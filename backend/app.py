import os
import sqlite3
import requests
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for the frontend

# Configure Environment Variables
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "your_api_key_here")
DATABASE = 'weather.db'

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
        db.commit()

# Initialize the database on startup
init_db()

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
            "date": datetime.utcnow().isoformat()
        }
        
        return jsonify(weather_info), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch data from OpenWeather API.", "details": str(e)}), 502

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
        date_str = data.get("date", datetime.utcnow().isoformat())
        
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