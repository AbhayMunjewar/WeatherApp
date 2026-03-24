import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for the frontend

# Configure Environment Variables
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "your_api_key_here")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI)
    db = client.weather_db
    weather_collection = db.weather_records
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

@app.route("/")
def home():
    return jsonify({"message": "Weather Backend API is running."})

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
        
        response.raise_for_status() # Raise error for other bad status codes
        
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

# 3. POST /save -> Store data
@app.route("/save", methods=["POST"])
def save_weather():
    try:
        data = request.json
        if not data or "city" not in data or "temperature" not in data:
            return jsonify({"error": "Missing 'city' or 'temperature' in request body."}), 400
        
        record = {
            "city": data["city"],
            "temperature": data["temperature"],
            "description": data.get("description", "No description provided"),
            "date": data.get("date", datetime.utcnow().isoformat())
        }
        
        result = weather_collection.insert_one(record)
        record["_id"] = str(result.inserted_id) # Convert ObjectId to string for JSON
        
        return jsonify({"message": "Weather data saved successfully.", "record": record}), 201

    except Exception as e:
        return jsonify({"error": "Failed to save data.", "details": str(e)}), 500

# 3. GET /records -> Get all data
@app.route("/records", methods=["GET"])
def get_records():
    try:
        records = []
        for record in weather_collection.find():
            record["_id"] = str(record["_id"]) # Convert ObjectId to string
            records.append(record)
            
        return jsonify({"count": len(records), "records": records}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch records.", "details": str(e)}), 500

# 3. PUT /update/{id} -> Update
@app.route("/update/<record_id>", methods=["PUT"])
def update_record(record_id):
    try:
        data = request.json
        if not data:
             return jsonify({"error": "No data provided for update."}), 400

        # Don't update the _id
        if "_id" in data:
            del data["_id"]

        result = weather_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": data}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Record not found."}), 404

        return jsonify({"message": "Record updated successfully."}), 200

    except Exception as e:
        return jsonify({"error": "Failed to update record.", "details": str(e)}), 500

# 3. DELETE /delete/{id} -> Delete
@app.route("/delete/<record_id>", methods=["DELETE"])
def delete_record(record_id):
    try:
        result = weather_collection.delete_one({"_id": ObjectId(record_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Record not found."}), 404

        return jsonify({"message": "Record deleted successfully."}), 200

    except Exception as e:
        return jsonify({"error": "Failed to delete record.", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)