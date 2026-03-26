# System Architecture

## High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             React Application (Vite)                 │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ • App.jsx (Router, ErrorBoundary)                    │   │
│  │ • Dashboard.jsx (Main Weather Display)              │   │
│  │ • Pages/* (Routing Components)                      │   │
│  │ • State Management (React Hooks)                    │   │
│  │ • Framer Motion (Animations)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ▲                                   │
│                    IPC/APIs ▼ HTTP                            │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           NETWORK / EXTERNAL SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │   Backend API Server     │  │  External Weather APIs   │ │
│  │   (Flask Python)         │  ├──────────────────────────┤ │
│  │  localhost:5000          │  │ • OpenWeatherMap         │ │
│  ├──────────────────────────┤  │ • Open-Meteo             │ │
│  │ Routes:                  │  │ • GeoIP Services         │ │
│  │ • /weather/{city}        │  │                          │ │
│  │ • /forecast/{lat}/{lon}  │  └──────────────────────────┘ │
│  │ • /air-quality/{city}    │                               │
│  │ • /weather-alerts        │  ┌──────────────────────────┐ │
│  │ • /chatbot/ask           │  │  AI Language Models      │ │
│  │ • /search/{city}         │  │ (Optional Integration)   │ │
│  │                          │  └──────────────────────────┘ │
│  └──────────────────────────┘                               │
│           ▲                                                   │
│           ▼ CORS Enabled                                     │
└─────────────────────────────────────────────────────────────┘
                            ▲
               ┌────────────┴───────────┐
               ▼                        ▼
        ┌──────────────┐        ┌──────────────┐
        │  SQLite DB   │        │  Cache Layer │
        │  weather.db  │        │  (In-Memory) │
        └──────────────┘        └──────────────┘
```

## Component Architecture

### Frontend Layer

#### **App.jsx** (Root Component)
```
┌─ ErrorBoundary ─────────────────────────┐
│                                          │
│  ┌─ Router (BrowserRouter) ────────────┐ │
│  │                                      │ │
│  │  ├─ Route "/" → LandingPage         │ │
│  │  ├─ Route "/dashboard" → Dashboard  │ │
│  │  ├─ Route "/alerts" → AlertsPage    │ │
│  │  ├─ Route "/maps" → MapsPage        │ │
│  │  ├─ Route "/history" → HistoryPage  │ │
│  │  ├─ Route "/profile" → ProfilePage  │ │
│  │  ├─ Route "/settings" → SettingsPage│ │
│  │  ├─ Route "/search" → SearchResults │ │
│  │  └─ Route "/login" → LoginPage      │ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

#### **Dashboard.jsx** (Main Component)
```
└─ Dashboard
   ├─ Navbar
   │  ├─ Logo
   │  ├─ Live Clock (Updates every 1 second)
   │  ├─ Navigation Links
   │  └─ User Menu
   │
   ├─ Search Bar
   │  ├─ Text Input
   │  └─ Search Button
   │
   ├─ Current Weather Display
   │  ├─ City Name & Coordinates
   │  ├─ Current Temperature
   │  ├─ Weather Description
   │  ├─ "Feels Like" Temperature
   │  └─ Additional Metrics (Humidity, Pressure, Wind)
   │
   ├─ Air Quality Section
   │  ├─ PM2.5 Level
   │  ├─ PM10 Level
   │  └─ Quality Index
   │
   ├─ 5-Day Forecast
   │  └─ Forecast Days
   │     ├─ Day Name/Date
   │     ├─ Temperature Range
   │     ├─ Weather Icon
   │     └─ Description
   │
   ├─ WeatherAIQuestionBox (Chatbot)
   │  ├─ Question Input
   │  ├─ Submit Button
   │  └─ AI Response Display
   │
   └─ Error Display (if any)
```

### Backend Layer

#### **Flask Application Structure**
```
app.py (Main Flask App)
│
├─ Configuration
│  ├─ API Keys
│  ├─ CORS Settings
│  └─ Environment Variables
│
├─ Routes
│  ├─ GET /weather/<city>
│  ├─ GET /forecast/<lat>/<lon>
│  ├─ GET /air-quality/<city>
│  ├─ GET /weather-alerts/<city>
│  ├─ POST /chatbot/ask
│  ├─ GET /search/<query>
│  └─ GET /location/current
│
├─ Service Layer
│  ├─ WeatherService
│  ├─ CacheService
│  └─ AlertService
│
└─ Database Layer
   └─ SQLite Connection
```

## Data Flow

### Weather Data Retrieval Flow

```
User Action: Enter City Name
        │
        ▼
   Dashboard Search Handler
        │
        ├─ Clear previous error
        ├─ Set loading state
        │
        ▼
   API Call: /weather/{city}
        │
        ▼
   Flask Backend
        │
        ├─ Check Cache (if available)
        │
        ├─ NO Cache → Query OpenWeatherMap
        │   ├─ Get current weather
        │   ├─ Get coordinates
        │   └─ Cache result
        │
        ▼
   Return JSON Response
        │
        ├─ Current Weather Data
        ├─ Coordinates
        └─ Air Quality Data
        │
        ▼
   Frontend State Update
        │
        ├─ setWeather(data)
        ├─ setCity(data.city)
        ├─ setCoordinates(data.coords)
        │
        ▼
   Fetch Forecast
        │
        ▼
   API Call: /forecast/{lat}/{lon}
        │
        ▼
   Frontend State Update
        │
        ├─ setForecast(forecastData)
        ├─ Show WeatherAIQuestionBox
        │
        ▼
   Display Updated Dashboard
```

### AI Chatbot Integration Flow

```
User Question Input
        │
        ▼
   WeatherAIQuestionBox Component
        │
        ├─ Format question with weather context
        ├─ Current weather data
        ├─ Current location
        │
        ▼
   API Call: POST /chatbot/ask
        │
        ├─ Question: user input
        └─ Context: current weather
        │
        ▼
   Flask Backend
        │
        ├─ Receive question + context
        ├─ Format prompt for LLM
        │
        ▼
   Call AI Language Model
        │
        ├─ Google Gemini API (or configured AI)
        ├─ Include weather context
        │
        ▼
   Receive AI Response
        │
        ├─ Parse response
        └─ Format for display
        │
        ▼
   Return Response JSON
        │
        ▼
   Frontend: Display Response
        │
        ├─ Update chat history
        ├─ Show animated response
        │
        ▼
   User Sees AI Answer
```

## State Management

### React Hooks Architecture

#### **Dashboard.jsx State**
```javascript
// Weather Data
const [weather, setWeather]           // Current weather info
const [forecast, setForecast]         // 5-day forecast
const [airQuality, setAirQuality]     // Air quality metrics

// UI State
const [loading, setLoading]           // Loading indicator
const [error, setError]               // Error messages
const [searchCity, setSearchCity]     // Search input

// Display State
const [selectedDay, setSelectedDay]   // Selected forecast day
const [showDetail, setShowDetail]     // Detail view toggle
const [currentTime, setCurrentTime]   // Live clock

// User Data
const [city, setCity]                 // Current city
const [coordinates, setCoordinates]   // Lat/Lon
```

#### **Hooks Usage**
```javascript
// Fetch weather on mount and city change
useEffect(() => {
  fetchWeatherData(city)
}, [city])

// Update clock every second
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date())
  }, 1000)
  return () => clearInterval(timer)
}, [])
```

## Data Models

### Weather Object
```javascript
{
  city: "London",
  country: "GB",
  temperature: 15.5,
  feels_like: 14.2,
  weather: "Cloudy",
  description: "Overcast clouds",
  humidity: 72,
  pressure: 1013,
  wind_speed: 5.2,
  wind_direction: 230,
  UV_index: 3,
  visibility: 10,
  coordinates: {
    latitude: 51.5074,
    longitude: -0.1278
  },
  last_updated: "2024-01-15T14:30:00Z"
}
```

### Forecast Object
```javascript
{
  city: "London",
  forecast: [
    {
      date: "2024-01-16",
      day: "Tuesday",
      temp_high: 18,
      temp_low: 12,
      weather: "Sunny",
      icon: "01d",
      humidity: 60,
      precipitation_chance: 10
    },
    // ... 4 more days
  ]
}
```

### Air Quality Object
```javascript
{
  city: "London",
  aqi: 3,           // 1-5 scale (1=Good, 5=Very Poor)
  pm2_5: 15.2,      // Particulate Matter
  pm10: 35.8,
  no2: 42.1,
  o3: 65.2,
  status: "Good",
  health_advice: "Air quality is satisfactory..."
}
```

## API Contract

### Frontend → Backend Communication

#### Request Format
```javascript
// GET /weather/London
// Returns: Weather object

// POST /chatbot/ask
{
  question: "Will it rain today?",
  weather_context: { /* current weather */ },
  location: "London"
}

// Response
{
  answer: "Based on current weather...",
  confidence: 0.95,
  sources: ["historical data", "forecast"]
}
```

## Caching Strategy

### Cache Layer (Backend)
```
Cache Key: "{endpoint}_{city}_{timestamp_hour}"
Cache TTL: 3600 seconds (1 hour)

Examples:
- "weather_london_2024_01_15_14"
- "forecast_51.5074_-0.1278_2024_01_15"
```

### When Cache Is Used
- Current weather (if less than 1 hour old)
- Forecast data
- Air quality data

### When Cache Is Bypassed
- User explicitly requests refresh
- Geolocation-based queries (always fresh)
- Real-time alerts

## Error Handling

### Error Stack
```
User Action (Search, Navigate, etc.)
        │
        ▼
   Try-Catch Block in Component
        │
        ├─ Network Error
        │  └─ Display "Unable to fetch data"
        │
        ├─ API Error (4xx/5xx)
        │  └─ Display specific error message
        │
        ├─ Parsing Error
        │  └─ Display "Invalid data received"
        │
        ▼
   Error Boundary (App.jsx)
        │
        ├─ Catch uncaught errors
        └─ Display fallback UI
```

### Error States
```javascript
// Valid error states
if (error) {
  return <ErrorDisplay message={String(error)} />
}

// Loading state
if (loading) {
  return <Spinner />
}

// Success state
return <WeatherDisplay data={weather} />
```

## Security Architecture

### API Key Protection
```
Frontend: VITE_OPENWEATHER_API_KEY (public key)
Backend: OPENWEATHER_API_KEY (secret key)

Flow:
1. Frontend makes request to Backend
2. Backend forwards to OpenWeatherMap API
3. Backend returns data to Frontend
4. Frontend never sees raw API key
```

### CORS Configuration
```
Allowed Origins:
- http://localhost:5173  (Dev)
- http://localhost:5175  (Alt Dev)
- https://yourdomain.com (Production)
```

### Data Validation
```
Backend validates all:
- Query parameters (city names)
- Request bodies
- API responses before returning
```

## Performance Optimization

### Frontend Optimizations
- Vite bundling for fast builds
- HMR (Hot Module Replacement) for dev
- Code splitting by routes
- Lazy loading components
- Memoization with useMemo/useCallback

### Backend Optimizations
- Response caching (1 hour TTL)
- Efficient API calls
- Connection pooling (if using DB)
- Gzip compression

### Network Optimizations
- Compressed JSON responses
- Minimal payload size
- Efficient error handling

## Deployment Architecture

### Development
```
Local Machine
├─ Frontend: npm run dev (Vite dev server)
├─ Backend: Flask development server
└─ Database: SQLite (local)
```

### Production
```
Cloud Server (e.g., Heroku, AWS)
├─ Frontend: Static files served by CDN/web server
├─ Backend: Gunicorn/uWSGI WSGI server
├─ Database: PostgreSQL (recommend for production)
└─ Environment: Proper SSL/TLS certificates
```

## Scaling Considerations

### Current Limitations
- SQLite (single file, not scalable)
- Single server deployment
- No load balancing

### For Scale
- Migrate to PostgreSQL
- Use Redis for caching
- Implement API rate limiting
- Use CDN for static assets
- Horizontal scaling with load balancer

## Technology Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| | Vite 5.4 | Build tool |
| | React Router v6 | Routing |
| | Framer Motion | Animations |
| | CSS | Styling |
| Backend | Python 3.x | Server language |
| | Flask | Web framework |
| | CORS | Cross-origin handling |
| External | OpenWeatherMap | Weather data |
| | Open-Meteo | Geocoding, backup |
| | Google Gemini | AI chatbot |
| Database | SQLite | Local storage |

## Future Enhancement Opportunities

1. **Database**: Migrate to PostgreSQL for production
2. **Caching**: Add Redis for distributed caching
3. **Real-time**: Implement WebSocket for live alerts
4. **ML**: Add predictive weather models
5. **Mobile**: Create React Native mobile app
6. **Analytics**: Implement user analytics
7. **Internationalization**: Add multi-language support
8. **Accessibility**: Enhance WCAG compliance
