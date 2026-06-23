# Atmos Weather App

Atmos Weather is a production-grade, single-page responsive dashboard built using React and Vite. It integrates live weather services, AQI, UV indexes, outfit recommendations, local maps, YouTube clips, and a historical database feed with full CRUD features and multiple file format export capabilities.

## Features

1. **Location Search & Recent Chips**: Search via city name, zip code, or landmark. Recent searches are saved as quick chips in local storage (up to 5 cities) and can be easily deleted or re-selected.
2. **Current Weather Details**: Shows local time, temperature, weather conditions, wind speed & compass direction, humidity, pressure, and visibility.
3. **Sun & Moon (Sunrise/Sunset)**: Displays local sunrise, sunset times, and visual progress bar representing elapsed daylight hours, alongside morning/evening Golden Hour ranges.
4. **Air Quality Index (AQI)**: Color-coded air quality readings with specific PM2.5 and PM10 metrics.
5. **UV Index Indicator**: Predicts latitude-peaked UV Index and displays sun protection/SPF suggestions.
6. **Umbrella Alert**: Proactively notifies users to carry an umbrella if precipitation probability (POP) in the immediate forecast exceeds 40%.
7. **5-Day Forecast**: Horizontal scrolling strip presenting grouped daily summaries (daily high/low, conditions, max precipitation chance).
8. **Outfit Suggester**: Suggests clothes based on temperature, wind chill, and rain/snow forecasts.
9. **YouTube Video Feeds**: Displays localized YouTube videos relevant to the weather and city.
10. **Google Map Embed**: Renders map detail for the target coordinates.
11. **Historical Database CRUD Feed**:
    - **Create**: Input city name and date range to query and save weather logs. Location spelling is geocoded and validated.
    - **Read**: View previously logged queries in a responsive, searchable data table.
    - **Filter**: Filter list records instantly by name or date range.
    - **Update**: Edit temperature, description, or location of any record.
    - **Delete**: Clear logs from database feed.
    - **Export**: Export logs into JSON, CSV, XML, Markdown, or PDF formats.
12. **Premium Design**: Dark theme styling, loading skeleton states, inline dismissible error banners, and micro-animations.

---

## Technical Details

- **Tech Stack**: React 18, Vite, Lucide Icons, jsPDF, Vanilla Custom CSS.
- **API integrations**: OpenWeather API (Current Weather, 5-Day Forecast, Air Quality Index, Geocoding & Reverse Geocoding), YouTube API, Google Maps Embed.
- **Persistence**: Backend database integration with automated LocalStorage fallback for CRUD operations.

---

## New Features Added

### Outfit Suggester
Rule-based clothing recommendation based on temperature and rain probability.
No additional API needed.

### Pollen / Allergy Index
Powered by Google Pollen API.
Setup:
1. Go to console.cloud.google.com
2. Create a project → Enable "Pollen API"
3. Generate an API key → add to .env as VITE_GOOGLE_API_KEY

### Travel Weather Comparison
Compare weather between any two cities side by side.
Uses existing OpenWeatherMap key — no additional setup.

---

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root of the `frontend` folder:
   ```env
   VITE_WEATHER_API_KEY=<YOUR_OPENWEATHER_API_KEY>
   VITE_YOUTUBE_API_KEY=<YOUR_YOUTUBE_API_KEY>
   VITE_API_URL=https://atmos-weatherapp.onrender.com
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```
