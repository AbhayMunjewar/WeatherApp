import os
import json
import csv
import io
import uuid
from urllib.parse import urlparse, unquote

import mysql.connector
import requests
from flask import Flask, request, jsonify, g, Response
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for the frontend

# Configure Environment Variables
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "your_api_key_here")
DATABASE_URL = os.getenv("DATABASE_URL")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "weather_app")
MAX_DATE_RANGE_DAYS = 31
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
WARNINGS_API_URL = "https://api.open-meteo.com/v1/warnings"
DEFAULT_LOCATION_FALLBACKS = {
    "san francisco": {
        "name": "San Francisco",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "country": "United States",
    }
}
LOCATION_CACHE = {}

# MySQL Initialization

def get_mysql_config(include_database=True):
    """Build MySQL connector settings from DATABASE_URL or MYSQL_* variables."""
    config = {
        "host": MYSQL_HOST,
        "port": MYSQL_PORT,
        "user": MYSQL_USER,
        "password": MYSQL_PASSWORD,
        "charset": "utf8mb4",
        "use_unicode": True,
    }

    if DATABASE_URL:
        parsed = urlparse(DATABASE_URL)
        if parsed.scheme not in {"mysql", "mysql+mysqlconnector"}:
            raise ValueError("DATABASE_URL must use mysql:// or mysql+mysqlconnector://")
        config.update({
            "host": parsed.hostname or MYSQL_HOST,
            "port": parsed.port or MYSQL_PORT,
            "user": unquote(parsed.username or MYSQL_USER),
            "password": unquote(parsed.password or MYSQL_PASSWORD),
        })
        database = parsed.path.lstrip("/") or MYSQL_DATABASE
    else:
        database = MYSQL_DATABASE

    if include_database:
        config["database"] = database
    return config, database


def connect_mysql(include_database=True):
    config, _ = get_mysql_config(include_database=include_database)
    return mysql.connector.connect(**config)


def normalize_sql(sql):
    """Convert sqlite-style placeholders to MySQL DB-API placeholders."""
    return sql.replace("?", "%s")


class DatabaseSession:
    def __init__(self, connection):
        self.connection = connection

    def execute(self, sql, params=None):
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(normalize_sql(sql), params or ())
        return cursor

    def commit(self):
        self.connection.commit()

    def close(self):
        self.connection.close()


def get_db():
    """Get a database connection for the current request context."""
    if 'db' not in g:
        g.db = DatabaseSession(connect_mysql())
    return g.db

@app.teardown_appcontext
def close_db(exception):
    """Close the database connection at the end of each request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Create database tables if they don't exist."""
    bootstrap_conn = connect_mysql(include_database=False)
    _, database = get_mysql_config(include_database=False)
    bootstrap_cursor = bootstrap_conn.cursor()
    bootstrap_cursor.execute(
        f"CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    bootstrap_conn.commit()
    bootstrap_cursor.close()
    bootstrap_conn.close()

    conn = connect_mysql()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_queries (
            id VARCHAR(36) PRIMARY KEY,
            input_location VARCHAR(255) NOT NULL,
            resolved_name VARCHAR(255) NOT NULL,
            latitude DOUBLE NOT NULL,
            longitude DOUBLE NOT NULL,
            country VARCHAR(255),
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            results_json JSON NOT NULL,
            created_at VARCHAR(40) NOT NULL,
            updated_at VARCHAR(40) NOT NULL,
            INDEX idx_weather_queries_created_at (created_at),
            INDEX idx_weather_queries_input_location (input_location),
            INDEX idx_weather_queries_resolved_name (resolved_name)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_records (
            id VARCHAR(36) PRIMARY KEY,
            city VARCHAR(255) NOT NULL,
            temperature DOUBLE NOT NULL,
            description TEXT,
            date VARCHAR(40) NOT NULL,
            INDEX idx_weather_records_date (date)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at VARCHAR(40) NOT NULL
        )
    """)

    conn.commit()
    conn.close()

# Initialize the database on startup
init_db()
_, active_database = get_mysql_config()
print("MySQL database initialized:", active_database)

# ─── Utility Functions ──────────────────────────────────────────────────────────

def parse_iso_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError as exc:
        raise ValueError("Dates must use YYYY-MM-DD format.") from exc

def validate_date_range(start_date, end_date):
    start = parse_iso_date(start_date)
    end = parse_iso_date(end_date)
    if end < start:
        raise ValueError("End date must be on or after the start date.")
    if (end - start).days > MAX_DATE_RANGE_DAYS:
        raise ValueError(f"Date range cannot exceed {MAX_DATE_RANGE_DAYS} days.")
    return start.isoformat(), end.isoformat()

def format_date_value(value):
    return value.isoformat() if hasattr(value, "isoformat") else value

def serialize_raw_row(row):
    return {
        key: format_date_value(value)
        for key, value in row.items()
    }

def resolve_location(location):
    normalized = (location or "").strip()
    if not normalized:
        raise ValueError("Location name is required.")

    cache_key = normalized.lower()
    cached = LOCATION_CACHE.get(cache_key)
    if cached:
        return cached

    params = {"name": normalized, "count": 1, "language": "en", "format": "json"}
    try:
        response = requests.get(GEOCODE_URL, params=params, timeout=10)
        response.raise_for_status()
        payload = response.json()
        results = payload.get("results") or []
        if not results:
            raise ValueError(f"Location '{normalized}' was not found.")
        match = results[0]
        resolved = {
            "name": match.get("name"),
            "latitude": match.get("latitude"),
            "longitude": match.get("longitude"),
            "country": match.get("country"),
        }
        LOCATION_CACHE[cache_key] = resolved
        return resolved
    except requests.exceptions.RequestException as err:
        fallback = fetch_cached_location(cache_key) or DEFAULT_LOCATION_FALLBACKS.get(cache_key)
        if fallback:
            LOCATION_CACHE[cache_key] = fallback
            return fallback
        raise err

def fetch_cached_location(cache_key):
    """Search for a previously-saved query matching this location in MySQL."""
    try:
        conn = connect_mysql()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """SELECT resolved_name, latitude, longitude, country
               FROM weather_queries
               WHERE LOWER(input_location) = %s OR LOWER(resolved_name) = %s
               ORDER BY created_at DESC LIMIT 1""",
            (cache_key, cache_key)
        )
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return {
            "name": row["resolved_name"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "country": row["country"],
        }
    except Exception:
        return None

def reverse_geocode(latitude, longitude):
    """Find the nearest city name for given coordinates."""
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "language": "en",
    }
    try:
        response = requests.get(
            "https://geocoding-api.open-meteo.com/v1/reverse",
            params=params,
            timeout=10
        )
        response.raise_for_status()
        payload = response.json()
        results = payload.get("results") or []
        if results:
            top_result = results[0]
            return {
                "name": top_result.get("name") or f"Lat {latitude:.2f}, Lon {longitude:.2f}",
                "latitude": latitude,
                "longitude": longitude,
                "country": top_result.get("country"),
            }
    except requests.exceptions.RequestException:
        pass
    return {
        "name": f"Lat {latitude:.2f}, Lon {longitude:.2f}",
        "latitude": latitude,
        "longitude": longitude,
        "country": None,
    }

def fetch_temperature_series(latitude, longitude, start_date, end_date):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean",
        "timezone": "auto",
    }
    response = requests.get(ARCHIVE_URL, params=params, timeout=15)
    response.raise_for_status()
    payload = response.json()
    daily = payload.get("daily") or {}
    dates = daily.get("time") or []
    t_max = daily.get("temperature_2m_max") or []
    t_min = daily.get("temperature_2m_min") or []
    t_mean = daily.get("temperature_2m_mean") or []
    if not dates:
        raise ValueError("No temperature readings were returned for that range.")
    results = []
    for idx, day in enumerate(dates):
        results.append({
            "date": day,
            "temp_max": t_max[idx] if idx < len(t_max) else None,
            "temp_min": t_min[idx] if idx < len(t_min) else None,
            "temp_mean": t_mean[idx] if idx < len(t_mean) else None,
        })
    return results

def fetch_weather_alerts(latitude, longitude):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "language": "en",
        "current_weather": True,
        "timezone": "auto",
    }
    response = requests.get(WARNINGS_API_URL, params=params, timeout=15)
    if response.status_code >= 400:
        return []
    payload = response.json()
    entries = payload.get("warnings") or []
    normalized = []
    for entry in entries:
        normalized.append({
            "event": entry.get("event") or entry.get("headline") or "Weather Alert",
            "description": entry.get("description") or entry.get("headline") or "",
            "severity": (entry.get("severity") or entry.get("level") or "info").lower(),
            "regions": entry.get("regions") or entry.get("affected_areas") or [],
            "start": entry.get("start") or entry.get("effective"),
            "end": entry.get("end") or entry.get("expires"),
            "source": entry.get("source") or entry.get("issuer"),
        })
    
    # Inject a mock alert for demonstration purposes if none exist
    if not normalized:
        from datetime import datetime, timezone
        normalized.append({
            "event": "Severe Thunderstorm Warning",
            "description": "A severe thunderstorm warning is in effect. Large hail and damaging winds are possible. Seek shelter immediately if outdoors and avoid windows.",
            "severity": "severe",
            "regions": ["Local Area", "Surrounding Counties"],
            "start": datetime.now(timezone.utc).isoformat(),
            "end": None,
            "source": "National Weather Service (Demo)"
        })
        
    return normalized

# ─── Serialization helpers ──────────────────────────────────────────────────────

def serialize_query_row(row):
    """Convert a database row for a weather_query into a JSON-friendly dict."""
    results = row.get("results_json", "[]")
    if isinstance(results, str):
        try:
            results = json.loads(results)
        except json.JSONDecodeError:
            results = []
    return {
        "id": row["id"],
        "input_location": row["input_location"],
        "resolved_name": row["resolved_name"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "start_date": format_date_value(row["start_date"]),
        "end_date": format_date_value(row["end_date"]),
        "results": results,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }

def serialize_user(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "created_at": row["created_at"],
    }

# ─── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"message": "Weather Backend API is running with MySQL!"})

# 1. GET /weather/{city} -> Fetch from OpenWeather API
@app.route("/weather/<city>", methods=["GET"])
def get_weather(city):
    if not city:
        return jsonify({"error": "City name is required."}), 400

    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url)
        
        if response.status_code == 404:
            return jsonify({"error": "Invalid city. City not found."}), 404
        
        response.raise_for_status()
        
        data = response.json()
        
        weather_info = {
            "city": data["name"],
            "temperature": round(data["main"]["temp"], 1),
            "description": data["weather"][0]["description"],
            "date": datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify(weather_info), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch data from OpenWeather API.", "details": str(e)}), 502

@app.route("/alerts", methods=["GET"])
def get_weather_alerts():
    try:
        location = (request.args.get("location") or "").strip()
        latitude_param = request.args.get("latitude")
        longitude_param = request.args.get("longitude")

        resolved = None
        latitude = None
        longitude = None

        if latitude_param or longitude_param:
            if not (latitude_param and longitude_param):
                return jsonify({"error": "Both latitude and longitude are required."}), 400
            try:
                latitude = float(latitude_param)
                longitude = float(longitude_param)
            except ValueError:
                return jsonify({"error": "Latitude and longitude must be numeric."}), 400
            resolved = reverse_geocode(latitude, longitude)
        elif location:
            resolved = resolve_location(location)
            latitude = resolved["latitude"]
            longitude = resolved["longitude"]
        else:
            return jsonify({"error": "Please provide either a location or latitude/longitude."}), 400

        alerts = fetch_weather_alerts(latitude, longitude)

        return jsonify({
            "location": {
                "input": location or f"{latitude},{longitude}",
                "name": resolved.get("name"),
                "country": resolved.get("country"),
                "latitude": latitude,
                "longitude": longitude,
            },
            "count": len(alerts),
            "alerts": alerts
        }), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except requests.exceptions.RequestException as err:
        return jsonify({"error": "Unable to load alerts from upstream service.", "details": str(err)}), 502
    except Exception as err:
        return jsonify({"error": "Failed to fetch alerts.", "details": str(err)}), 500

# CRUD: weather queries with date ranges
@app.route("/queries", methods=["POST"])
def create_weather_query():
    try:
        payload = request.json or {}
        location = (payload.get("location") or "").strip()
        start_date = payload.get("start_date")
        end_date = payload.get("end_date")
        if not location or not start_date or not end_date:
            return jsonify({"error": "Please provide location, start_date, and end_date."}), 400

        validated_start, validated_end = validate_date_range(start_date, end_date)
        resolved = resolve_location(location)
        temps = fetch_temperature_series(resolved["latitude"], resolved["longitude"], validated_start, validated_end)
        timestamp = datetime.now(timezone.utc).isoformat()
        query_id = str(uuid.uuid4())

        db = get_db()
        db.execute(
            """INSERT INTO weather_queries
               (id, input_location, resolved_name, latitude, longitude, country,
                start_date, end_date, results_json, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (query_id, location, resolved["name"], resolved["latitude"],
             resolved["longitude"], resolved.get("country"),
             validated_start, validated_end, json.dumps(temps),
             timestamp, timestamp)
        )
        db.commit()

        row = db.execute("SELECT * FROM weather_queries WHERE id = ?", (query_id,)).fetchone()
        return jsonify(serialize_query_row(row)), 201

    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except requests.exceptions.RequestException as err:
        return jsonify({"error": "External weather service is unavailable.", "details": str(err)}), 502
    except Exception as err:
        return jsonify({"error": "Failed to save weather query.", "details": str(err)}), 500

@app.route("/queries", methods=["GET"])
def list_weather_queries():
    try:
        db = get_db()
        rows = db.execute("SELECT * FROM weather_queries ORDER BY created_at DESC").fetchall()
        return jsonify({
            "count": len(rows),
            "queries": [serialize_query_row(row) for row in rows]
        }), 200
    except Exception as err:
        return jsonify({"error": "Failed to load weather queries.", "details": str(err)}), 500

@app.route("/queries/export", methods=["GET"])
def export_weather_queries():
    try:
        fmt = (request.args.get("format") or "json").lower()
        db = get_db()
        rows = db.execute("SELECT * FROM weather_queries ORDER BY created_at DESC").fetchall()
        payload = [serialize_query_row(row) for row in rows]

        if fmt == "json":
            return jsonify({"count": len(payload), "queries": payload})

        if fmt == "csv":
            fieldnames = [
                "id", "input_location", "resolved_name", "latitude", "longitude",
                "start_date", "end_date", "created_at", "updated_at", "results"
            ]
            buffer = io.StringIO()
            writer = csv.DictWriter(buffer, fieldnames=fieldnames)
            writer.writeheader()
            for item in payload:
                writer.writerow({
                    **{key: item.get(key) for key in fieldnames[:-1]},
                    "results": json.dumps(item.get("results"))
                })
            csv_data = buffer.getvalue()
            return Response(
                csv_data,
                mimetype="text/csv",
                headers={"Content-Disposition": "attachment; filename=weather-queries.csv"}
            )

        if fmt in {"md", "markdown"}:
            headers = ["ID", "Input", "Resolved", "Start", "End", "Updated"]
            lines = [
                "| " + " | ".join(headers) + " |",
                "|" + "|".join([" --- "] * len(headers)) + "|"
            ]
            for item in payload:
                lines.append(
                    "| {id} | {input_location} | {resolved_name} | {start_date} | {end_date} | {updated_at} |".format(**item)
                )
            markdown = "\n".join(lines)
            return Response(
                markdown,
                mimetype="text/markdown",
                headers={"Content-Disposition": "attachment; filename=weather-queries.md"}
            )

        return jsonify({"error": "Unsupported format. Use json, csv, or markdown."}), 400

    except Exception as err:
        return jsonify({"error": "Failed to export weather queries.", "details": str(err)}), 500

@app.route("/queries/<query_id>", methods=["GET"])
def get_weather_query(query_id):
    try:
        db = get_db()
        row = db.execute("SELECT * FROM weather_queries WHERE id = ?", (query_id,)).fetchone()
        if not row:
            return jsonify({"error": "Query not found."}), 404
        return jsonify(serialize_query_row(row)), 200
    except Exception as e:
        return jsonify({"error": "Invalid ID format or query not found.", "details": str(e)}), 400

@app.route("/queries/<query_id>", methods=["PUT"])
def update_weather_query(query_id):
    try:
        payload = request.json or {}
        if not payload:
            return jsonify({"error": "No data supplied for update."}), 400

        db = get_db()
        existing = db.execute("SELECT * FROM weather_queries WHERE id = ?", (query_id,)).fetchone()
        if not existing:
            return jsonify({"error": "Query not found."}), 404
        existing = dict(existing)

        location = (payload.get("location") or existing["input_location"]).strip()
        start_date = payload.get("start_date") or existing["start_date"]
        end_date = payload.get("end_date") or existing["end_date"]
        
        if not location:
            return jsonify({"error": "Location cannot be empty."}), 400

        validated_start, validated_end = validate_date_range(start_date, end_date)
        resolved = resolve_location(location)
        temps = fetch_temperature_series(resolved["latitude"], resolved["longitude"], validated_start, validated_end)

        timestamp = datetime.now(timezone.utc).isoformat()
        
        db.execute(
            """UPDATE weather_queries
               SET input_location = ?, resolved_name = ?, latitude = ?, longitude = ?,
                   country = ?, start_date = ?, end_date = ?, results_json = ?, updated_at = ?
               WHERE id = ?""",
            (location, resolved["name"], resolved["latitude"], resolved["longitude"],
             resolved.get("country"), validated_start, validated_end,
             json.dumps(temps), timestamp, query_id)
        )
        db.commit()

        updated = db.execute("SELECT * FROM weather_queries WHERE id = ?", (query_id,)).fetchone()
        return jsonify(serialize_query_row(updated)), 200

    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except requests.exceptions.RequestException as err:
        return jsonify({"error": "External weather service is unavailable.", "details": str(err)}), 502
    except Exception as err:
        return jsonify({"error": "Failed to update query.", "details": str(err)}), 500

@app.route("/queries/<query_id>", methods=["DELETE"])
def delete_weather_query(query_id):
    try:
        db = get_db()
        cursor = db.execute("DELETE FROM weather_queries WHERE id = ?", (query_id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Query not found."}), 404
        return jsonify({"message": "Query deleted successfully."}), 200
    except Exception as err:
        return jsonify({"error": "Failed to delete query.", "details": str(err)}), 500

# ─── Auth Routes ────────────────────────────────────────────────────────────────

@app.route("/auth/signup", methods=["POST"])
def signup():
    try:
        payload = request.json or {}
        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""

        if not name or not email or not password:
            return jsonify({"error": "Name, email, and password are required."}), 400
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters."}), 400

        db = get_db()
        existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            return jsonify({"error": "An account with that email already exists."}), 409

        password_hash = generate_password_hash(password)
        timestamp = datetime.now(timezone.utc).isoformat()
        user_id = str(uuid.uuid4())

        db.execute(
            "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, name, email, password_hash, timestamp)
        )
        db.commit()

        user_row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return jsonify({
            "message": "Account created successfully.",
            "user": serialize_user(user_row)
        }), 201
    except Exception as err:
        return jsonify({"error": "Failed to create account.", "details": str(err)}), 500

@app.route("/auth/login", methods=["POST"])
def login():
    try:
        payload = request.json or {}
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""

        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        db = get_db()
        doc = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not doc or not check_password_hash(doc["password_hash"], password):
            return jsonify({"error": "Invalid email or password."}), 401

        return jsonify({
            "message": "Login successful.",
            "user": serialize_user(doc)
        }), 200
    except Exception as err:
        return jsonify({"error": "Failed to login.", "details": str(err)}), 500

# ─── Simple Weather Records (Dashboard save/read/update/delete) ─────────────

# 2. POST /save -> Store data
@app.route("/save", methods=["POST"])
def save_weather():
    try:
        data = request.json
        if not data or "city" not in data or "temperature" not in data:
            return jsonify({"error": "Missing 'city' or 'temperature' in request body."}), 400
        
        city = data["city"]
        temperature = data["temperature"]
        description = data.get("description", "No description provided")
        date_str = data.get("date", datetime.now(timezone.utc).isoformat())
        record_id = str(uuid.uuid4())
        
        db = get_db()
        db.execute(
            "INSERT INTO weather_records (id, city, temperature, description, date) VALUES (?, ?, ?, ?, ?)",
            (record_id, city, temperature, description, date_str)
        )
        db.commit()
        
        record = {
            "_id": record_id, 
            "city": city,
            "temperature": temperature,
            "description": description,
            "date": date_str
        }
        
        return jsonify({"message": "Weather data saved successfully.", "record": record}), 201

    except Exception as e:
        return jsonify({"error": "Failed to save data.", "details": str(e)}), 500

# 3. GET /records -> Get all data
@app.route("/records", methods=["GET"])
def get_records():
    try:
        db = get_db()
        rows = db.execute("SELECT * FROM weather_records ORDER BY date DESC").fetchall()
        
        records = []
        for row in rows:
            records.append({
                "_id": row["id"],
                "city": row["city"],
                "temperature": row["temperature"],
                "description": row["description"],
                "date": row["date"]
            })
            
        return jsonify({"count": len(records), "records": records}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch records.", "details": str(e)}), 500

# 4. PUT /update/{id} -> Update
@app.route("/update/<record_id>", methods=["PUT"])
def update_record(record_id):
    try:
        data = request.json
        if not data:
             return jsonify({"error": "No data provided for update."}), 400

        db = get_db()
        existing = db.execute("SELECT * FROM weather_records WHERE id = ?", (record_id,)).fetchone()
        if not existing:
            return jsonify({"error": "Record not found."}), 404

        updates = {}
        for key in ["city", "temperature", "description", "date"]:
            if key in data:
                updates[key] = data[key]
                
        if not updates:
            return jsonify({"error": "No valid fields to update."}), 400

        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [record_id]
        
        db.execute(f"UPDATE weather_records SET {set_clause} WHERE id = ?", values)
        db.commit()

        return jsonify({"message": "Record updated successfully."}), 200

    except Exception as e:
        return jsonify({"error": "Failed to update record.", "details": str(e)}), 500

# 5. DELETE /delete/{id} -> Delete
@app.route("/delete/<record_id>", methods=["DELETE"])
def delete_record(record_id):
    try:
        db = get_db()
        cursor = db.execute("DELETE FROM weather_records WHERE id = ?", (record_id,))
        db.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Record not found."}), 404

        return jsonify({"message": "Record deleted successfully."}), 200

    except Exception as e:
        return jsonify({"error": "Failed to delete record.", "details": str(e)}), 500

# 6. Data Export
@app.route("/export", methods=["GET"])
def export_data():
    import csv
    import io
    try:
        format_type = request.args.get("format", "csv").lower()
        target_table = request.args.get("table", "weather_records")
        if target_table not in ["weather_records", "weather_queries"]:
            return jsonify({"error": "Invalid table."}), 400

        db = get_db()
        order_column = "date" if target_table == "weather_records" else "created_at"
        rows = db.execute(f"SELECT * FROM {target_table} ORDER BY {order_column} DESC").fetchall()
        
        if format_type == "json":
            records = [serialize_raw_row(row) for row in rows]
            return jsonify({"count": len(records), "data": records}), 200
        
        # Default to CSV
        output = io.StringIO()
        writer = csv.writer(output)
        if rows:
            writer.writerow(rows[0].keys())
            for row in rows:
                writer.writerow(row.values())
        
        response = app.response_class(
            response=output.getvalue(),
            status=200,
            mimetype="text/csv"
        )
        response.headers["Content-Disposition"] = f"attachment; filename={target_table}_export.csv"
        return response

    except Exception as e:
        return jsonify({"error": "Failed to export data.", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
