#  Atmos - Weather App

A comprehensive, full-stack weather application built with React and Flask that provides real-time weather data, extended forecasting, weather alerts, and AI-powered contextual advice.

##  Features

### Core Weather Features
- **Real-Time Weather Data** - Current conditions, temperature, humidity, pressure, wind speed, and visibility
- **5-Day Forecast** - Extended weather predictions with hourly breakdowns
- **Air Quality Monitoring** - Real-time AQI (Air Quality Index) with health recommendations
- **Weather Alerts & Warnings** - Severe weather notifications and safety advisories
- **Historical Weather Data** - Archive weather records for any location and date

### Search & Discovery
- **City Search with Auto-Suggestions** - Debounced API calls with dropdown suggestions (300ms debounce)
- **Search History** - Track previously searched locations
- **Geolocation Support** - Automatic weather detection based on user's location
- **Saved Queries** - Store and retrieve favorite weather lookups

### Interactive Features
- **Weather AI Assistant** - Rule-based chatbot answering weather-related questions
- **Dynamic Weather Backgrounds** - Animated gradients that change with weather conditions
- **Health & Safety Advisories** - Real-time recommendations based on conditions
- **Environmental Insights** - Dew point, UV index, comfort index calculations
- **Weather Maps** - Geographical visualization of weather patterns
- **Detailed Reports** - Comprehensive weather analysis and preparedness checklists

### User Experience
- **Dark Theme Interface** - Eye-friendly, modern glassmorphism design
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion transitions for page navigation
- **Live Clock** - Real-time clock display in navbar
- **Error Boundaries** - Graceful error handling with user-friendly messages
- **Loading States** - Skeleton screens and spinners during data fetch

### Authentication & Profile
- **User Accounts** - Sign up and login functionality
- **Profile Management** - Personalized user settings and preferences
- **Account Settings** - Customizable app behavior and notifications

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, Vite 5, Framer Motion, Lucide React, jsPDF |
| **Backend** | Flask, Flask-CORS, SQLite, Python Requests |
| **APIs** | OpenWeather, Open-Meteo (Geocoding, Archive, Warnings) |
| **DevTools** | ESLint, Playwright, Git, npm |

##  Project Structure

`
weather-app/
├── 📄 index.html, package.json, vite.config.js
├── 📄 CONTRIBUTING.md, README.md, .env.example
│
├── 📁 src/
│   ├── main.jsx, index.css, App.jsx
│   └── 📁 pages/
│       ├── Dashboard.jsx (main weather display)
│       ├── AlertsPage.jsx, MapsPage.jsx
│       ├── HistoryPage.jsx, ProfilePage.jsx
│       ├── SettingsPage.jsx, SearchResults.jsx
│       ├── LoginPage.jsx, LandingPage.jsx
│
├── 📁 docs/
│   ├── INSTALLATION.md
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   └── FOLDER_STRUCTURE.md ← Full details here
│
└── 📁 backend/ (separate repo)
    ├── app.py, requirements.txt
    └── .env.example
`

##  Quick Start

### Prerequisites
- Node.js v16+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://www.python.org/))
- Git ([Download](https://git-scm.com/))

### Frontend Installation (2 minutes)

\\\ash
# Clone and enter directory
git clone https://github.com/AbhayMunjewar/WeatherApp.git
cd WeatherApp/weather-app

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add VITE_OPENWEATHER_API_KEY=your_key_here

# Start dev server
npm run dev
# Open http://localhost:5173
\\\

### Backend Installation (2 minutes)

\\\ash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo OPENWEATHER_API_KEY=your_key_here > .env

# Run Flask server
python app.py
# Server at http://localhost:5000
\\\

##  Build & Deploy

\\\ash
# Development with HMR
npm run dev

# Production build
npm run build

# Preview production
npm run preview

# Quality check
npm run lint

# Run tests
npm run test
\\\

##  Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](./docs/INSTALLATION.md) | Detailed setup instructions |
| [API Documentation](./docs/API_DOCUMENTATION.md) | Backend endpoints reference |
| [Architecture Guide](./docs/ARCHITECTURE.md) | System design & patterns |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues & solutions |

##  Key Features Explained

### Weather AI Assistant
The **WeatherAIQuestionBox** component uses rule-based logic to answer weather questions:
- Questions like "Should I go outside?" generate contextual advice
- "What should I wear?" provides outfit recommendations
- "Will it rain?" checks forecast data
- All responses consider current temperature, humidity, wind, precipitation

### Dynamic Weather Backgrounds
The **WeatherBackground** component renders gradients based on conditions:
-  Clear: Blue gradient
-  Cloudy: Gray gradient  
-  Rainy: Dark blue gradient
-  Snowy: White/light blue gradient

### Error Handling
**ErrorBoundary** component catches React errors and displays gracefully without crashing the entire app.

##  Security

-  Password hashing for user accounts
-  CORS protection on API endpoints
-  Environment-based API key management
-  Input sanitization and validation
-  Secure error messages (no sensitive data in logs)

##  Performance

-  Vite for ultra-fast development builds
-  Framer Motion for smooth 60fps animations
-  Debounced search (300ms) to reduce API calls
-  Memoized computations with useMemo
-  Code splitting for faster load times
-  Optimized re-renders with useCallback

##  Known Issues & Limitations

| Issue | Status | Workaround |
|-------|--------|-----------|
| Air quality unavailable for some regions | Known | Try nearby major cities |
| Historical data limited to 1 year | By API | Use Open-Meteo's free tier limits |
| Real-time alerts occasional delay | Known | Refresh page manually |

See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) for more.

##  Roadmap

- [x] Core weather display
- [x] Real-time forecasts
- [x] Air quality tracking
- [x] Weather alerts
- [x] User authentication
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Advanced weather maps

##  Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code of Conduct
- Contribution Process
- Pull Request Guidelines
- Development Setup

##  License

MIT License  2026 - see [LICENSE](./LICENSE) for details

##  Author

**Abhay Munjewar**
- GitHub: [@AbhayMunjewar](https://github.com/AbhayMunjewar)
- Project: [WeatherApp](https://github.com/AbhayMunjewar/WeatherApp)

##  Support

-  [Report Bugs](https://github.com/AbhayMunjewar/WeatherApp/issues)
-  [Ask Questions](https://github.com/AbhayMunjewar/WeatherApp/discussions)
-  [Read Docs](./docs)
-  [Get Help](./src/pages/SupportPage.jsx)

##  Acknowledgments

- OpenWeather for reliable weather data
- Open-Meteo for free APIs
- Framer for incredible animation library
- Lucide for beautiful icons
- React community for amazing ecosystem

---

**Status**:  **Production Ready**
**Last Updated**: March 2026
**Contributors**: 1+

Made with  for weather enthusiasts everywhere
