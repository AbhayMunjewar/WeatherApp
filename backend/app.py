import os
import json
import csv
import io
import sqlite3
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
DATABASE = 'weather.db'
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

def get_db():
    """Get a connection to the SQLite database."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # Returns dict-like rows
    return db

@app.teardown_appcontext
def close_connection(exception):
    """Close the connection after each request."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Initialize the database with the required table."""
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS weather_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL,
                temperature REAL NOT NULL,
                description TEXT,
                date TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS weather_queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_location TEXT NOT NULL,
                resolved_name TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                results_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        db.commit()

# Initialize the database on startup
init_db()

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
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT resolved_name, latitude, longitude, '' as country
        FROM weather_queries
        WHERE lower(input_location) = ? OR lower(resolved_name) = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (cache_key, cache_key)
    )
    row = cursor.fetchone()
    if not row:
        return None
    return {
        "name": row["resolved_name"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "country": row["country"] or None,
    }

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
        # Some regions do not have warning coverage; treat that as "no alerts"
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
    return normalized

def serialize_query_row(row):
    return {
        "id": row["id"],
        "input_location": row["input_location"],
        "resolved_name": row["resolved_name"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "start_date": row["start_date"],
        "end_date": row["end_date"],
        "results": json.loads(row["results_json"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }

def load_all_query_rows():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM weather_queries ORDER BY id DESC")
    return cursor.fetchall()

def get_user_by_email(email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower(),))
    return cursor.fetchone()

def serialize_user(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "created_at": row["created_at"],
    }

@app.route("/")
def home():
    return jsonify({"message": "Weather Backend API is running with SQLite!"})

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
            # Require both coordinates and ensure they can be cast to floats
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

        db = get_db()
        cursor = db.cursor()
        timestamp = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            """
            INSERT INTO weather_queries (
                input_location, resolved_name, latitude, longitude,
                start_date, end_date, results_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                location,
                resolved["name"],
                resolved["latitude"],
                resolved["longitude"],
                validated_start,
                validated_end,
                json.dumps(temps),
                timestamp,
                timestamp,
            ),
        )
        db.commit()
        cursor.execute("SELECT * FROM weather_queries WHERE id = ?", (cursor.lastrowid,))
        row = cursor.fetchone()
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
        rows = load_all_query_rows()
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
        rows = load_all_query_rows()
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

@app.route("/queries/<int:query_id>", methods=["GET"])
def get_weather_query(query_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM weather_queries WHERE id = ?", (query_id,))
    row = cursor.fetchone()
    if not row:
        return jsonify({"error": "Query not found."}), 404
    return jsonify(serialize_query_row(row)), 200

@app.route("/queries/<int:query_id>", methods=["PUT"])
def update_weather_query(query_id):
    try:
        payload = request.json or {}
        if not payload:
            return jsonify({"error": "No data supplied for update."}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM weather_queries WHERE id = ?", (query_id,))
        existing = cursor.fetchone()
        if not existing:
            return jsonify({"error": "Query not found."}), 404

        location = (payload.get("location") or existing["input_location"]).strip()
        start_date = payload.get("start_date") or existing["start_date"]
        end_date = payload.get("end_date") or existing["end_date"]
        if not location:
            return jsonify({"error": "Location cannot be empty."}), 400

        validated_start, validated_end = validate_date_range(start_date, end_date)
        resolved = resolve_location(location)
        temps = fetch_temperature_series(resolved["latitude"], resolved["longitude"], validated_start, validated_end)

        timestamp = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            """
            UPDATE weather_queries
            SET input_location = ?, resolved_name = ?, latitude = ?, longitude = ?,
                start_date = ?, end_date = ?, results_json = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                location,
                resolved["name"],
                resolved["latitude"],
                resolved["longitude"],
                validated_start,
                validated_end,
                json.dumps(temps),
                timestamp,
                query_id,
            ),
        )
        db.commit()
        cursor.execute("SELECT * FROM weather_queries WHERE id = ?", (query_id,))
        updated = cursor.fetchone()
        return jsonify(serialize_query_row(updated)), 200

    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except requests.exceptions.RequestException as err:
        return jsonify({"error": "External weather service is unavailable.", "details": str(err)}), 502
    except Exception as err:
        return jsonify({"error": "Failed to update query.", "details": str(err)}), 500

@app.route("/queries/<int:query_id>", methods=["DELETE"])
def delete_weather_query(query_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM weather_queries WHERE id = ?", (query_id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Query not found."}), 404
        return jsonify({"message": "Query deleted successfully."}), 200
    except Exception as err:
        return jsonify({"error": "Failed to delete query.", "details": str(err)}), 500

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

        if get_user_by_email(email):
            return jsonify({"error": "An account with that email already exists."}), 409

        password_hash = generate_password_hash(password)
        timestamp = datetime.now(timezone.utc).isoformat()

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (name, email, password_hash, timestamp)
        )
        db.commit()
        cursor.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,))
        row = cursor.fetchone()
        return jsonify({
            "message": "Account created successfully.",
            "user": serialize_user(row)
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

        row = get_user_by_email(email)
        if not row or not check_password_hash(row["password_hash"], password):
            return jsonify({"error": "Invalid email or password."}), 401

        return jsonify({
            "message": "Login successful.",
            "user": serialize_user(row)
        }), 200
    except Exception as err:
        return jsonify({"error": "Failed to login.", "details": str(err)}), 500

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
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO weather_records (city, temperature, description, date) VALUES (?, ?, ?, ?)",
            (city, temperature, description, date_str)
        )
        db.commit()
        
        # Use _id to match MongoDB's style for seamless frontend compatibility
        record = {
            "_id": cursor.lastrowid, 
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
        cursor = db.cursor()
        cursor.execute("SELECT * FROM weather_records ORDER BY id DESC")
        rows = cursor.fetchall()
        
        records = []
        for row in rows:
            records.append({
                "_id": row["id"],  # Keep _id for frontend compatibility
                "city": row["city"],
                "temperature": row["temperature"],
                "description": row["description"],
                "date": row["date"]
            })
            
        return jsonify({"count": len(records), "records": records}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch records.", "details": str(e)}), 500

# 4. PUT /update/{id} -> Update
@app.route("/update/<int:record_id>", methods=["PUT"])
def update_record(record_id):
    try:
        data = request.json
        if not data:
             return jsonify({"error": "No data provided for update."}), 400

        update_fields = []
        update_values = []
        
        # Determine which fields are being updated
        for key in ["city", "temperature", "description", "date"]:
            if key in data:
                update_fields.append(f"{key} = ?")
                update_values.append(data[key])
                
        if not update_fields:
            return jsonify({"error": "No valid fields to update."}), 400
            
        update_values.append(record_id)
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            f"UPDATE weather_records SET {', '.join(update_fields)} WHERE id = ?",
            tuple(update_values)
        )
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Record not found."}), 404

        return jsonify({"message": "Record updated successfully."}), 200

    except Exception as e:
        return jsonify({"error": "Failed to update record.", "details": str(e)}), 500

# 5. DELETE /delete/{id} -> Delete
@app.route("/delete/<int:record_id>", methods=["DELETE"])
def delete_record(record_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM weather_records WHERE id = ?", (record_id,))
        db.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Record not found."}), 404

        return jsonify({"message": "Record deleted successfully."}), 200

    except Exception as e:
        return jsonify({"error": "Failed to delete record.", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)