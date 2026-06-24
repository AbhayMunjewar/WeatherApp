# Atmos - Full Stack Weather Application

Atmos is a comprehensive, full-stack weather application designed to deliver real-time meteorological data alongside an immersive user experience. It provides live forecasts, YouTube city tours, localized weather alerts, and comprehensive weather history tracking. 

## Features

### Frontend
- **Built with React & Vite**: A lightning-fast, modern single-page application.
- **Dynamic "Midnight Luster V2" Design**: An ultra-sleek, responsive dark-mode UI with dynamic framer-motion micro-animations.
- **Real-Time Data Integrations**: Uses **OpenWeatherMap API** to fetch detailed metrics (temperature, conditions, wind, precipitation).
- **Interactive Maps & Media**: Includes live OpenStreetMap visualizers and integrates the **YouTube Data API** to fetch relevant videos of the searched location.
- **Dashboard PDF Export**: Users can generate a clean PDF snapshot of their current dashboard metrics with a single click.
- **Alerts System**: Tracks severe weather warnings and provides 48-hour outlooks. Users can follow specific regions for quick updates.

### Backend & Persistence Layer
- **Python Flask API**: A lightweight backend that serves as a proxy to upstream APIs and manages user data securely.
- **SQLite Database**: A persistent local database to store query history, ensuring seamless tracking of user queries without data loss on refresh.
- **Full CRUD Capabilities**: The History tab allows users to Create, Read, Update, and Delete past weather queries.
- **Database Export**: One-click backend export capability that generates a clean CSV dump of the user's weather queries directly from the SQLite database.

## Architecture & Tech Stack

### Frontend
- **Framework**: React.js (Bootstrapped with Vite)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Map Visuals**: React-Leaflet
- **Exporting**: jsPDF

### Backend
- **Framework**: Python Flask
- **Database**: SQLite (built-in Python `sqlite3`)
- **Requests**: Python `requests` library

## Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/), [Python 3.x](https://www.python.org/), and `git` installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/AbhayMunjewar/WeatherApp.git
cd WeatherApp/weather-app
```

### 2. Setup the Backend
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in the `backend` directory and add your OpenWeather API key:
```env
OPENWEATHER_API_KEY=your_openweather_api_key
```
Run the backend server:
```bash
python app.py
```
*The server will start on http://127.0.0.1:5000 and automatically initialize the SQLite database (`weather.db`).*

### 3. Setup the Frontend
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory with the following keys:
```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_API_URL=http://127.0.0.1:5000
```
Run the frontend development server:
```bash
npm run dev
```
*The application will be accessible at http://localhost:5173.*

## Usage
- Search for any city to see current weather, map locations, and YouTube travel videos.
- Use the **History** tab to manage your past searches, filter by date ranges, or export your query history to a CSV.
- Visit the **Alerts** tab to track severe weather warnings for your favorite regions.

## Assessment Compliance
This project was built to satisfy both **Tech Assessment #1 (Frontend)** and **Tech Assessment #2 (Backend)** requirements:
- **Responsive Frontend UI** built without Python/Java frameworks.
- **Multiple API Integrations** (OpenWeather & YouTube).
- **Backend CRUD Implementation** via Python Flask & SQLite.
- **Data Export capabilities** for both PDF Dashboard generation and CSV backend database exports.

---
*Designed & developed by Abhay Munjewar.*
