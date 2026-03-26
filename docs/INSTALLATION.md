# Installation Guide

Complete step-by-step instructions for setting up the Weather App locally.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Frontend Setup](#frontend-setup)
3. [Backend Setup](#backend-setup)
4. [Configuration](#configuration)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** v16 or higher - [Download](https://nodejs.org/)
- **Python** 3.8 or higher - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)
- **npm** (bundled with Node.js)

### Check Installations
```bash
node --version        # Should be v16.0.0 or higher
npm --version         # Should be 7.0.0 or higher
python --version      # Should be 3.8 or higher
git --version         # Should show installed version
```

### System Requirements
- **Disk Space**: 500MB minimum for dependencies
- **RAM**: 4GB or more recommended
- **Internet**: Required for API calls
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

---

## Frontend Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/AbhayMunjewar/WeatherApp.git
cd WeatherApp
cd weather-app
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all packages listed in `package.json`:
- React 18.2
- React Router DOM 6.22
- Vite 5.2
- Framer Motion 11
- Lucide React 0.344
- jsPDF 4.2
- ESLint, Playwright, and dev dependencies

**⏱️ Estimated time: 2-5 minutes** (depends on internet speed)

### Step 3: Create Environment File
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Step 4: Start Development Server
```bash
npm run dev
```

Output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Visit **http://localhost:5173** in your browser.

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
# From the weather-app directory
cd backend
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Verify activation:**
```bash
# Your terminal should now show (venv) prefix
# (venv) C:\WeatherApp\weather-app\backend>
```

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

Dependencies installed:
- Flask 2.2.5
- Flask-CORS 3.0.10
- Requests 2.28+
- python-dotenv 0.21.1

**⏱️ Estimated time: 1-2 minutes**

### Step 4: Create Environment File
```bash
# In backend directory
cat > .env << EOF
OPENWEATHER_API_KEY=your_openweather_api_key_here
FLASK_ENV=development
FLASK_DEBUG=1
EOF
```

Or create manually:
```
OPENWEATHER_API_KEY=your_key_here
FLASK_ENV=development
FLASK_DEBUG=1
```

### Step 5: Run Flask Server
```bash
python app.py
```

Output:
```
 * Serving Flask app
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
 * Restarting with reloader
```

Visit **http://localhost:5000** - you should see `OK` response.

---

## Configuration

### Getting OpenWeather API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/)
2. Click **Sign Up** (or Sign In if you have account)
3. Complete registration
4. Go to **API keys** tab
5. Copy your default API key
6. Paste into `.env` files (both frontend and backend)

**Free tier includes:**
- Current weather data
- 5-day forecast
- Air pollution data
- Up to 60 calls/minute

### Environment Variables

**Frontend (.env)**
```
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

**Backend (backend/.env)**
```
OPENWEATHER_API_KEY=your_api_key_here
FLASK_ENV=development          # development or production
FLASK_DEBUG=1                  # 1 for debug, 0 for production
```

---

## Verification

### Frontend Verification
1. Open http://localhost:5173
2. Should see Atmos Weather App loading
3. Try searching for a city (e.g., "London")
4. Check console (F12) for any errors

### Backend Verification
```bash
# Test API endpoint
curl http://localhost:5000/

# Response should be: OK
```

### Combined System Test
1. Frontend running at http://localhost:5173
2. Backend running at http://localhost:5000
3. Search for a city in the app
4. Should display current weather and forecast
5. Check browser DevTools (F12) Network tab - API calls should succeed

---

## Available Scripts

### Frontend (npm)
```bash
npm run dev          # Start development server with HMR
npm run build        # Create production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run Playwright tests
```

### Backend (Python)
```bash
python app.py                    # Start Flask server
python -m pytest tests/          # Run tests (if available)
pip freeze > requirements.txt    # Update dependencies list
```

---

## Troubleshooting

### Port Already in Use

**Frontend (5173):**
```bash
# Kill process using port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows (PowerShell):
Get-Process -Name node | Stop-Process -Force
```

**Backend (5000):**
```bash
# Kill process using port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows (PowerShell):
Get-Process -Name python | Stop-Process -Force
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Python Virtual Environment Issues

```bash
# Deactivate current environment
deactivate

# Delete venv folder
rm -rf venv

# Recreate
python -m venv venv
source venv/bin/activate    # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### API Key Not Working

1. Verify key is correct in `.env`
2. Check OpenWeatherMap account is active
3. Ensure key is not expired
4. Restart both frontend and backend servers
5. Check API rate limits (60 calls/minute for free tier)

### CORS Errors

Make sure:
1. Backend is running on http://localhost:5000
2. Frontend is running on http://localhost:5173
3. Backend has `Flask-CORS` installed
4. No firewall blocking communication

### No Weather Data Showing

1. Check browser console (F12) for errors
2. Check backend console for API errors  
3. Verify internet connection
4. Try different city name
5. Check OpenWeatherMap service status

### Database Issues

```bash
# Delete old database
cd backend
rm -f weather.db

# Restart Flask - will create new database
python app.py
```

---

## Next Steps

- Read [API Documentation](./API_DOCUMENTATION.md) to understand endpoints
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) to understand code structure
- Review [CONTRIBUTING.md](../CONTRIBUTING.md) if you plan to contribute
- Explore code and run the app!

## Need Help?

- 📖 [Full README](../README.md)
- 🐛 [Report Issues](https://github.com/AbhayMunjewar/WeatherApp/issues)
- 💬 [Ask Questions](https://github.com/AbhayMunjewar/WeatherApp/discussions)
- 🆘 [Troubleshooting Guide](./TROUBLESHOOTING.md)
