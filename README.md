# Atmos — Full-Stack Weather Application

A production-ready weather platform built with **React 18** and **Flask**, delivering real-time conditions, extended forecasts, air quality monitoring, and AI-powered contextual recommendations.

> **Live Status:** Production Ready · **Last Updated:** March 2026 · **Author:** [Abhay Munjewar](https://github.com/AbhayMunjewar)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Documentation](#documentation)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Atmos is a full-stack weather application that aggregates data from multiple weather APIs to provide a unified, responsive, and intelligent user experience. The frontend is built with React 18 and Vite, while the backend is powered by Flask with a SQLite database. The application features a glassmorphism dark UI with fluid Framer Motion animations and supports user authentication, saved preferences, and a rule-based AI assistant.

---

## Features

### Weather Data
- **Current Conditions** — Temperature, humidity, pressure, wind speed, visibility, dew point, and UV index
- **5-Day Forecast** — Extended daily and hourly weather predictions
- **Air Quality Index (AQI)** — Real-time AQI with tiered health advisories
- **Severe Weather Alerts** — Active warnings and safety notifications
- **Historical Archive** — Weather records for any location and date (up to 1 year via Open-Meteo)

### Search & Discovery
- **City Autocomplete** — Debounced search (300ms) with live dropdown suggestions
- **Geolocation** — Automatic weather detection using the browser's Geolocation API
- **Search History** — Persisted record of previously queried locations
- **Saved Locations** — Bookmark and retrieve favourite cities

### AI & Intelligence
- **Weather Assistant** — Rule-based chatbot that answers contextual queries such as "Should I go outside?", "What should I wear?", and "Will it rain?"
- **Health & Safety Advisories** — Dynamic recommendations generated from live conditions
- **Comfort Index** — Composite score calculated from temperature, humidity, and wind

### User Experience
- **Dynamic Backgrounds** — Animated gradients that adapt to current weather conditions
- **Responsive Design** — Optimised for desktop, tablet, and mobile viewports
- **Glassmorphism Dark Theme** — Modern, eye-friendly interface
- **Framer Motion Transitions** — 60 fps page animations and UI micro-interactions
- **Error Boundaries** — Graceful degradation with user-friendly fallback UI
- **Skeleton Loading States** — Perceived performance improvement during API calls
- **Live Clock** — Real-time clock rendered in the navigation bar

### Authentication & Profile
- **User Accounts** — Registration and login with hashed passwords
- **Profile Management** — Personalised settings and notification preferences
- **Saved Queries** — Persistent storage of favourite weather lookups

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite 5, Framer Motion, Lucide React, jsPDF |
| Backend | Flask, Flask-CORS, SQLite, Python Requests |
| External APIs | OpenWeatherMap, Open-Meteo (Geocoding, Archive, Alerts) |
| Testing & Tooling | Playwright (E2E), ESLint, Git, npm |

---

## Architecture

```
weather-app/
├── index.html
├── package.json
├── vite.config.js
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   └── pages/
│       ├── Dashboard.jsx        # Primary weather display
│       ├── AlertsPage.jsx
│       ├── MapsPage.jsx
│       ├── HistoryPage.jsx
│       ├── ProfilePage.jsx
│       ├── SettingsPage.jsx
│       ├── SearchResults.jsx
│       ├── LoginPage.jsx
│       └── LandingPage.jsx
│
├── docs/
│   ├── INSTALLATION.md
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   └── FOLDER_STRUCTURE.md
│
└── backend/
    ├── app.py
    ├── requirements.txt
    └── .env.example
```

Key design decisions:
- **Debounced search** reduces unnecessary API calls and stays within free-tier rate limits
- **Component-level error boundaries** isolate failures without crashing the full application
- **`useMemo` and `useCallback`** prevent redundant re-renders in data-heavy components
- **Environment-based API key management** keeps secrets out of source control

---

## Getting Started

### Prerequisites

| Dependency | Minimum Version |
|---|---|
| Node.js | v16+ |
| Python | 3.8+ |
| Git | Any recent version |

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/AbhayMunjewar/WeatherApp.git
cd WeatherApp/weather-app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your OpenWeatherMap API key to .env:
# VITE_OPENWEATHER_API_KEY=your_key_here

# Start the development server
npm run dev
# Application available at http://localhost:5173
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
echo OPENWEATHER_API_KEY=your_key_here > .env

# Start the Flask server
python app.py
# API available at http://localhost:5000
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Hot Module Replacement |
| `npm run build` | Compile production bundle |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm run test` | Run Playwright end-to-end tests |

---

## Documentation

| Document | Description |
|---|---|
| [Installation Guide](./docs/INSTALLATION.md) | Detailed environment setup and configuration |
| [API Documentation](./docs/API_DOCUMENTATION.md) | Backend endpoint reference with request/response schemas |
| [Architecture Guide](./docs/ARCHITECTURE.md) | System design, data flow, and component patterns |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [Folder Structure](./docs/FOLDER_STRUCTURE.md) | Annotated directory layout |

---

## Security

- Passwords stored using a secure hashing algorithm
- CORS configured to restrict cross-origin requests
- API keys loaded exclusively from environment variables
- User input is sanitised and validated on both client and server
- Error responses are sanitised to avoid leaking sensitive internals

---

## Performance

- **Vite** for near-instant HMR and optimised production bundles
- **Code splitting** via React lazy loading for faster initial load
- **Debounced API calls** (300ms) to reduce unnecessary network requests
- **`useMemo` / `useCallback`** to prevent redundant re-renders
- **Framer Motion** hardware-accelerated animations targeting 60 fps

---

## Known Limitations

| Issue | Status | Workaround |
|---|---|---|
| Air quality data unavailable in some regions | Known | Query a nearby major city |
| Historical data capped at 1 year | API limit (Open-Meteo free tier) | No workaround on free tier |
| Occasional delay in real-time alerts | Known | Refresh the page manually |

---

## Roadmap

- [x] Core weather display and current conditions
- [x] 5-day extended forecast
- [x] Air quality monitoring
- [x] Severe weather alerts
- [x] User authentication and profile management
- [ ] React Native mobile application
- [ ] Push notifications for severe weather
- [ ] Dark / Light theme toggle
- [ ] Multi-language support
- [ ] Advanced interactive weather maps

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. It covers the code of conduct, branching strategy, commit message conventions, and review process.

---

## License

MIT License © 2026 Abhay Munjewar. See [LICENSE](./LICENSE) for full terms.

---

## Acknowledgements

- [OpenWeatherMap](https://openweathermap.org/) — Primary weather data provider
- [Open-Meteo](https://open-meteo.com/) — Geocoding, historical data, and alerts
- [Framer Motion](https://www.framer.com/motion/) — Animation library
- [Lucide](https://lucide.dev/) — Icon set
- [React](https://react.dev/) — UI framework
