import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, History as HistoryIcon, PieChart, HelpCircle, 
  Search, MapPin, Settings, Bell, Wind, Droplets, User,
  ArrowUp, ArrowDown, Eye, Umbrella, Sun, ShieldCheck,
  ChevronRight, Compass, Cloud, CloudRain, CloudLightning, Loader2,
  Locate, Activity, LogOut, AlertTriangle, X, Thermometer, CheckCircle2
} from 'lucide-react';
import CitySearchWithSuggestions from '../components/CitySearchWithSuggestions';
import WeatherBackground from '../components/WeatherBackground';
import WeatherAIQuestionBox from '../components/WeatherAIQuestionBox';
import { WeatherSkeleton, LoadingSpinner } from '../components/LoadingStates';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const SidebarItem = ({ icon: Icon, label, active = false, to = '#', onClick }) => (
  <Link 
    to={to}
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.9rem 1.5rem',
      borderRadius: '0.75rem',
      background: active ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
      color: active ? '#a78bfa' : '#94a3b8',
      cursor: 'pointer',
      marginBottom: '0.5rem',
      transition: 'all 0.2s',
      fontWeight: active ? '600' : '500',
      borderRight: active ? '3px solid #a78bfa' : 'none',
      textDecoration: 'none'
  }}>
    {Icon && <Icon size={20} />}
    <span>{label}</span>
  </Link>
);

const StatCard = ({ icon: Icon, label, value, unit, color }) => (
  <div className="glass" style={{
    padding: '1.5rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    background: 'rgba(15, 23, 42, 0.4)'
  }}>
    <Icon size={20} color={color} />
    <div>
      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Outfit' }}>
        {value} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>{unit}</span>
      </div>
    </div>
  </div>
);

const InsightItem = ({ icon: Icon, title, description, color }) => (
  <div style={{
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    background: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '1rem',
    border: '1px solid var(--glass-border)',
    marginBottom: '1rem'
  }}>
    <Icon size={20} color={color} style={{ marginTop: '0.2rem' }} />
    <div>
      <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h4>
      <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>{description}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isDaytime, setIsDaytime] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const resetDashboard = () => {
    setWeatherData(null);
    setForecastData([]);
    setSearchTerm('');
    setSelectedDayIndex(null);
    setLoading(false);
    setAirQuality(null);
    setReportOpen(false);
    setLastUpdated(null);
  };

  const loadAirQuality = async (lat, lon) => {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      setAirQuality(null);
      return;
    }
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Unable to reach the air-quality service.');
      }
      const data = await response.json();
      // Ensure we're setting a valid object, not the entire API response
      if (data?.list && Array.isArray(data.list) && data.list.length > 0) {
        const aqData = data.list[0];
        // Validate that it has proper structure before setting
        if (typeof aqData === 'object' && aqData.hasOwnProperty('main')) {
          setAirQuality(aqData);
        } else {
          console.warn('Invalid air quality data structure');
          setAirQuality(null);
        }
      } else {
        console.warn('No valid air quality data received');
        setAirQuality(null);
      }
    } catch (aqError) {
      console.error('Air quality request failed', aqError);
      setAirQuality(null);
    }
  };

  const describeAqi = (aqi) => {
    // Ensure aqi is a number
    const aqiValue = typeof aqi === 'number' ? aqi : null;
    switch (aqiValue) {
      case 1: return { label: 'Good', note: 'Air is crisp and safe.', color: '#22c55e' };
      case 2: return { label: 'Fair', note: 'Sensitive groups should stay aware.', color: '#84cc16' };
      case 3: return { label: 'Moderate', note: 'Long outdoor activity may cause discomfort.', color: '#eab308' };
      case 4: return { label: 'Poor', note: 'Consider a mask outdoors.', color: '#f97316' };
      case 5: return { label: 'Hazardous', note: 'Limit time outside and seal interiors.', color: '#ef4444' };
      default: return { label: 'Unknown', note: 'Awaiting AQI feed.', color: '#94a3b8' };
    }
  };

  const computeDewPoint = (tempC, humidityPct) => {
    if (typeof tempC !== 'number' || typeof humidityPct !== 'number') return null;
    const dew = tempC - ((100 - humidityPct) / 5);
    return Math.round(dew * 10) / 10;
  };

  const formatVisibility = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return `${(value / 1000).toFixed(1)} km`;
  };

  const formatSolarTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError(null);
    setSelectedDayIndex(null);
    setAirQuality(null);
    try {
      // Fetch Current Weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!currentRes.ok) {
        throw new Error(`We couldn't find "${city}". Try a nearby city or check the spelling.`);
      }
      const currentData = await currentRes.json();
      setWeatherData(currentData);
      setSearchTerm(currentData.name || city);
      
      await loadAirQuality(currentData.coord?.lat, currentData.coord?.lon);

      // Fetch 5-Day Forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!forecastRes.ok) {
        throw new Error('Unable to load the extended forecast right now. Please try again in a moment.');
      }
      const foreData = await forecastRes.json();
      if (!foreData.list || !foreData.list.length) {
        throw new Error('No forecast data is available for this area yet.');
      }
      
      // Filter to get one forecast per day (around noon)
      const dailyForecast = foreData.list.filter(item => item.dt_txt.includes('12:00:00'));
      setForecastData(dailyForecast);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching the latest weather.');
      // If the saved city throws a 404 (such as from a bad diacritic), purge it so the board re-initializes cleanly next refresh
      localStorage.removeItem('lastDashboardCity');
    } finally {
      setLoading(false);
    }
  };
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setSelectedDayIndex(null);
    setAirQuality(null);
    try {
      // 1. Fetch Current Weather by Coords
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!currentRes.ok) {
        throw new Error('We could not load weather for your current location. Please search manually.');
      }
      const currentData = await currentRes.json();

      // 2. Fetch proper local city name (Reverse Geocoding)
      // Standard openweather weather endpoint defaults to broad administrative zones in India (like "Konkan Division"). 
      // The Geo API correctly identifies the actual city/neighborhood!
      try {
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0 && geoData[0].name) {
            currentData.name = geoData[0].name; // Overwrite the broad region name!
          }
        }
      } catch (e) {
        console.warn('Silent failure on reverse geocode', e);
      }

      setWeatherData(currentData);
      setSearchTerm(currentData.name); // Update search term to current precise city
      await loadAirQuality(currentData.coord?.lat, currentData.coord?.lon);

      // 3. Fetch 5-Day Forecast by Coords
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!forecastRes.ok) {
        throw new Error('Unable to load the forecast for your location.');
      }
      const foreData = await forecastRes.json();
      if (!foreData.list || !foreData.list.length) {
        throw new Error('Forecast data is not available for this location yet.');
      }
      
      // Filter to get one forecast per day (around noon)
      const dailyForecast = foreData.list.filter(item => item.dt_txt.includes('12:00:00'));
      setForecastData(dailyForecast);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err.message || 'Unable to reach the weather service.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocateMe = () => {
    setLoading(true);
    setError(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Location access denied or unavailable. Please search manually.");
          setLoading(false);
          // Fallback if needed, e.g., fetchWeatherData('London');
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (weatherData?.name) {
      fetchWeatherData(weatherData.name);
    } else {
      handleLocateMe();
    }
  };

  useEffect(() => {
    // Attempt high-accuracy IP Geolocation primarily, to avoid locking to ISP data hubs (e.g. Mumbai)
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
         if (data && data.latitude && data.longitude) {
            fetchWeatherByCoords(data.latitude, data.longitude); // Coordinates never 404 on OpenWeather!
         } else if (data && data.city) {
            fetchWeatherData(data.city); 
         } else {
            throw new Error("IP Geolocation failed to identify city");
         }
      })
      .catch(err => {
         console.warn("IP tracking failed, falling back to browser geolocation", err);
         if ('geolocation' in navigator) {
           navigator.geolocation.getCurrentPosition(
             (position) => {
               fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
             },
             (geoError) => {
               setError("Unable to determine location automatically. Please search for your city above.");
             },
             { timeout: 8000, maximumAge: 300000 }
           );
         } else {
           setError("Unable to determine location automatically. Please search for your city above.");
         }
      });
  }, []);

  useEffect(() => {
    // Track airQuality changes
    // (logs removed)
  }, [airQuality]);

  useEffect(() => {
    // Determine if it's daytime based on sunrise/sunset times
    if (weatherData?.sys?.sunrise && weatherData?.sys?.sunset) {
      const now = new Date();
      const sunrise = new Date(weatherData.sys.sunrise * 1000);
      const sunset = new Date(weatherData.sys.sunset * 1000);
      setIsDaytime(now >= sunrise && now <= sunset);
    }
  }, [weatherData]);

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const searchCity = e.target.value.trim();
      setError(null);
      fetchWeatherData(searchCity);
    }
  };

  const getWeatherIcon = (condition) => {
    const main = condition.toLowerCase();
    if (main.includes('cloud')) return Cloud;
    if (main.includes('rain')) return CloudRain;
    if (main.includes('storm')) return CloudLightning;
    return Sun;
  };

  const displayData = selectedDayIndex !== null && forecastData[selectedDayIndex]
    ? {
        ...weatherData,
        main: {
           ...weatherData.main,
           temp: forecastData[selectedDayIndex].main.temp,
           temp_max: forecastData[selectedDayIndex].main.temp_max,
           temp_min: forecastData[selectedDayIndex].main.temp_min,
           humidity: forecastData[selectedDayIndex].main.humidity,
           pressure: forecastData[selectedDayIndex].main.pressure,
        },
        weather: forecastData[selectedDayIndex].weather,
        wind: forecastData[selectedDayIndex].wind,
        visibility: forecastData[selectedDayIndex].visibility || weatherData?.visibility,
        isForecast: true,
      }
    : weatherData;

  const dewPoint = computeDewPoint(weatherData?.main?.temp, weatherData?.main?.humidity);
  const visibilityText = formatVisibility(weatherData?.visibility);
  // Safely get airDescriptor and ensure it's always properly formed
  const airDescriptorRaw = describeAqi(typeof airQuality?.main?.aqi === 'number' ? airQuality.main.aqi : undefined);
  const airDescriptor = (airDescriptorRaw && typeof airDescriptorRaw === 'object' && typeof airDescriptorRaw.label === 'string')
    ? airDescriptorRaw
    : { label: 'Unknown', note: 'Loading data...', color: '#94a3b8' };
  const compactForecast = forecastData.slice(0, 4);
  const sunriseTime = formatSolarTime(weatherData?.sys?.sunrise);
  const sunsetTime = formatSolarTime(weatherData?.sys?.sunset);
  const hasCoords = Number.isFinite(weatherData?.coord?.lat) && Number.isFinite(weatherData?.coord?.lon);
  const coordString = hasCoords ? `${weatherData.coord.lat.toFixed(2)}, ${weatherData.coord.lon.toFixed(2)}` : 'N/A';
  const pollutantList = [
    { key: 'pm2_5', label: 'PM2.5' },
    { key: 'pm10', label: 'PM10' },
    { key: 'o3', label: 'O3' },
    { key: 'no2', label: 'NO2' },
    { key: 'so2', label: 'SO2' },
    { key: 'co', label: 'CO' },
    { key: 'nh3', label: 'NH3' },
  ];
  
  // Safely extract dominant pollutant, filtering out the 'all' key
  const dominantPollutantEntry = (() => {
    try {
      if (airQuality && typeof airQuality === 'object' && airQuality.components && typeof airQuality.components === 'object') {
        const entries = Object.entries(airQuality.components)
          .filter(([key]) => key !== 'all') // Exclude the 'all' key which is not a pollutant
          .sort((a, b) => (b[1] || 0) - (a[1] || 0));
        return entries.length > 0 ? entries[0] : null;
      }
    } catch (e) {
      console.error('Error processing pollutant data:', e);
    }
    return null;
  })();
  
  const dominantPollutantLabel = dominantPollutantEntry && Array.isArray(dominantPollutantEntry) && typeof dominantPollutantEntry[0] === 'string'
    ? (pollutantList.find((item) => item.key === dominantPollutantEntry[0])?.label || dominantPollutantEntry[0])
    : 'N/A';
  const climateMetrics = weatherData ? [
    { label: 'Feels Like', value: String(Math.round(weatherData.main?.feels_like || 0)) + ' °C' },
    { label: 'Humidity', value: String(weatherData.main?.humidity || 0) + '%' },
    { label: 'Pressure', value: String(weatherData.main?.pressure || 0) + ' hPa' },
    { label: 'Visibility', value: String(visibilityText || 'N/A') },
    { label: 'Wind Speed', value: String(weatherData.wind?.speed || 0) + ' km/h' },
    { label: 'Dew Point', value: String(dewPoint !== null ? `${dewPoint} °C` : 'N/A') },
  ].map(metric => ({ ...metric, value: String(metric.value) })) : [];
  const reportInsights = [];
  if ((forecastData[0]?.pop || 0) >= 0.4) {
    reportInsights.push(String('Showers remain likely this afternoon. Keep waterproof layers ready.'));
  }
  if ((weatherData?.wind?.speed || 0) > 28) {
    reportInsights.push(String('Gusty winds detected; secure lightweight outdoor items.'));
  }
  if ((weatherData?.main?.humidity || 0) >= 70) {
    reportInsights.push(String('High humidity may amplify heat stress. Hydrate frequently.'));
  }
  if ((airQuality?.main?.aqi || 0) >= 4) {
    reportInsights.push(String('Air quality is degraded - limit prolonged outdoor exposure.'));
  }
  if (!reportInsights.length) {
    reportInsights.push(String('Conditions are stable. Continue standard outdoor plans.'));
  }
  // Ensure all insights are strings (defensive programming)
  const safeReportInsights = reportInsights.map(insight => String(insight || 'N/A'));

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#02040a',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      position: 'relative'
    }}>
      {/* Dynamic Weather Background */}
      <WeatherBackground 
        weatherCondition={displayData?.weather?.[0]?.main || 'Clear'}
        isDaytime={isDaytime}
      />
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid #1e293b',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        background: '#02040a',
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', marginBottom: '3rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #a78bfa)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass color="white" size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Outfit', margin: 0 }}>Atmos</h1>
            <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600', margin: 0 }}>MIDNIGHT LUSTER V2</p>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            to="/dashboard" 
            active={location.pathname === '/dashboard'} 
            onClick={resetDashboard}
          />
          <SidebarItem icon={HistoryIcon} label="History" to="/history" />
          <SidebarItem icon={PieChart} label="Alerts" to="/alerts" />
          <SidebarItem icon={User} label="Profile" to="/profile" />
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
          <SidebarItem icon={HelpCircle} label="Support" to="/support" />
          <SidebarItem icon={LogOut} label="Logout" onClick={(e) => {
            e.preventDefault();
              localStorage.removeItem('isAuthenticated');
              localStorage.removeItem('userProfile');
            window.location.href = '/login';
          }} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navigation Bar from Image 1 */}
        <nav style={{
          padding: '1rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
            <div style={{ color: '#a78bfa', fontWeight: '700', fontSize: '1.5rem', fontFamily: 'Outfit' }}>Atmos</div>

          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
             <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
             <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', alignItems: 'center' }}>
               <MapPin size={20} cursor="pointer" />
             </div>
          </div>
        </nav>

        <main style={{ flex: 1, padding: '1rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Area with Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '800px', alignItems: 'center' }}>
              <CitySearchWithSuggestions 
                onCitySelect={(cityName, lat, lon) => {
                  // Called with (cityName, lat, lon) from suggestions or (cityName) from manual entry
                  if (typeof lat === 'number' && typeof lon === 'number') {
                    // Suggestion selected with coordinates
                    fetchWeatherByCoords(lat, lon);
                  } else {
                    // Manual city name entered or suggestion without coords
                    fetchWeatherData(cityName);
                  }
                }}
                API_KEY={API_KEY}
                value={searchTerm}
              />
              <button 
                onClick={handleLocateMe}
                style={{ 
                  background: 'rgba(30, 41, 59, 0.6)', 
                  border: '1px solid #1e293b', 
                  color: '#94a3b8', 
                  borderRadius: '8px', 
                  padding: '0.6rem 1.25rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}>
                <Locate size={16} /> Locate
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                padding: '1.25rem 1.75rem',
                borderRadius: '1rem',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                background: 'rgba(69, 10, 10, 0.6)',
                color: '#fecaca'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <AlertTriangle size={24} color="#fca5a5" />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.2rem' }}>We hit a snag.</div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#fecaca' }}>{String(error || 'An error occurred')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleRetry}
                  style={{
                    background: '#fca5a5',
                    border: 'none',
                    color: '#0f172a',
                    borderRadius: '999px',
                    padding: '0.45rem 1.25rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={() => setError(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(248, 113, 113, 0.6)',
                    color: '#fecaca',
                    borderRadius: '999px',
                    padding: '0.45rem 1.25rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}


        {/* Hero Dashboard Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Current Weather Card */}
            <AnimatePresence mode="wait">
              {loading ? (
                <WeatherSkeleton />
              ) : displayData ? (
                <motion.div 
                   key={displayData.name}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="glass" 
                   style={{ 
                     padding: '3rem', 
                     background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))',
                     position: 'relative'
                   }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '1px' }}>
                    <MapPin size={14} /> {displayData.name.toUpperCase()}
                  </div>
                  <h2 style={{ fontSize: '4.5rem', fontWeight: '700', fontFamily: 'Outfit', marginBottom: '0.5rem' }}>{String(displayData.name || 'N/A')}</h2>
                  <p style={{ fontSize: '1.25rem', color: '#94a3b8', fontWeight: '500' }}>
                    {String(displayData?.weather?.[0]?.main || 'Clear')} & {String(displayData?.weather?.[0]?.description || 'N/A')}
                  </p>
                  
                  <div style={{ position: 'absolute', right: '3rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <div style={{ fontSize: '8rem', fontWeight: '700', fontFamily: 'Outfit', lineHeight: 1 }}>
                      {Math.round(displayData?.main?.temp || 0)}°
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>↑ {Math.round(displayData?.main?.temp_max || 0)}°</div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>↓ {Math.round(displayData?.main?.temp_min || 0)}°</div>
                    </div>
                  </div>

                  {/* Stat Grid */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '4rem' }}>
                    <StatCard icon={Wind} label="Wind Speed" value={String(displayData?.wind?.speed || 0)} unit="km/h" color="#3b82f6" />
                    <StatCard icon={Droplets} label="Humidity" value={String(displayData?.main?.humidity || 0)} unit="%" color="#60a5fa" />
                    <StatCard icon={Compass} label="Pressure" value={String(displayData?.main?.pressure || 0)} unit="hPa" color="#f472b6" />
                    <StatCard icon={Eye} label="Visibility" value={displayData?.visibility ? String((displayData.visibility / 1000).toFixed(1)) : "N/A"} unit={displayData?.visibility ? "km" : ""} color="#a78bfa" />
                  </div>
                </motion.div>
              ) : (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: '#ef4444' }}>{error || 'No weather data available.'}</p>
                </div>
              )}
            </AnimatePresence>

            {/* 5-Day Forecast */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>5-Day Forecast</h3>
                <span 
                  style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700', cursor: 'pointer' }}
                  onClick={() => {
                    if (searchTerm) navigate(`/forecast?city=${encodeURIComponent(searchTerm)}`);
                  }}
                >
                  VIEW 3-HOUR DETAIL
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {forecastData.map((item, i) => {
                  const date = new Date(item.dt * 1000);
                  const Icon = getWeatherIcon(item.weather[0].main);
                  const isSelected = selectedDayIndex === i;
                  return (
                    <div 
                      key={item.dt} 
                      onClick={() => setSelectedDayIndex(isSelected ? null : i)}
                      className="glass" 
                      style={{ 
                        flex: 1, 
                        padding: '1.5rem', 
                        textAlign: 'center', 
                        background: isSelected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(15, 23, 42, 0.4)',
                        border: isSelected ? '1px solid #a78bfa' : '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderRadius: '1rem'
                      }}>
                      <div style={{ fontSize: '0.75rem', color: isSelected ? '#fff' : '#64748b', fontWeight: '600', marginBottom: '1rem' }}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </div>
                      <Icon color={isSelected ? 'white' : '#a78bfa'} size={24} style={{ margin: '1rem auto' }} />
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                        {Math.round(item.main.temp_max)}°
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isSelected ? '#e2e8f0' : '#64748b' }}>
                        {Math.round(item.main.temp_min)}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Weather Cards Grid */}
            {weatherData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {/* Air Quality Card */}
                <div className="glass" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    <CloudRain size={14} /> Air Quality
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: airDescriptor?.color || '#94a3b8', marginBottom: '0.5rem' }}>
                    {typeof airDescriptor?.label === 'string' ? airDescriptor.label : 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{typeof airDescriptor?.note === 'string' ? airDescriptor.note : 'Loading...'}</div>
                </div>

                {/* Feels Like Temperature */}
                <div className="glass" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    <Thermometer size={14} /> Feels Like
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
                    {Math.round(weatherData?.main?.feels_like || 0)}°
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Perceived temp</div>
                </div>

                {/* Dew Point */}
                <div className="glass" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    <Cloud size={14} /> Dew Point
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#60a5fa', marginBottom: '0.5rem' }}>
                    {dewPoint !== null ? `${dewPoint}°` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Condensation</div>
                </div>

                {/* Cloud Coverage */}
                <div className="glass" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    <Cloud size={14} /> Cloud Cover
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#06b6d4', marginBottom: '0.5rem' }}>
                    {weatherData?.clouds?.all ?? 'N/A'}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sky coverage</div>
                </div>

                {/* Visibility Card */}
                <div className="glass" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    <Eye size={14} /> Visibility
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                    {visibilityText}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Excellent range</div>
                </div>

                {/* Comfort Index */}
                <div className="glass" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    <CheckCircle2 size={14} /> Comfort
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem' }}>
                    {weatherData?.main?.humidity ? (100 - Math.abs(weatherData.main.humidity - 55)) + '%' : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Overall index</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.4)' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Bell size={18} color="#ef4444" /> Weather Insights
               </h3>
               
               <InsightItem 
                 icon={Umbrella} 
                 title="Carry an umbrella" 
                 description="Light showers expected between 2 PM and 4 PM. Better safe than sorry."
                 color="#8b5cf6"
               />
               <InsightItem 
                 icon={Droplets} 
                 title="Stay hydrated" 
                 description="High humidity today may lead to faster dehydration. Keep water close."
                 color="#3b82f6"
               />
               <InsightItem 
                 icon={Sun} 
                 title="UV Protection" 
                 description="UV index is moderate. Apply sunscreen if heading out for long."
                 color="#f59e0b"
               />

               <button 
                 className="btn-secondary"
                 onClick={() => weatherData && setReportOpen(true)}
                 disabled={!weatherData}
                 style={{ 
                   width: '100%', 
                   padding: '0.85rem', 
                   marginTop: '1rem', 
                   fontSize: '0.8rem', 
                   borderRadius: '12px',
                   cursor: weatherData ? 'pointer' : 'not-allowed',
                   opacity: weatherData ? 1 : 0.6
                 }}>
                 FULL ENVIRONMENTAL REPORT
               </button>
            </div>

            {/* AI Question Box */}
            {weatherData && (
              <>
              <div className="glass" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.4)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#10b981" /> Health & Safety
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(weatherData?.main?.humidity || 0) > 70 && (
                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.75rem' }}>
                      <div style={{ fontWeight: '600', color: '#60a5fa', marginBottom: '0.25rem' }}>💧 High Humidity</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Stay hydrated and limit outdoor activity duration</div>
                    </div>
                  )}
                  {(weatherData?.wind?.speed || 0) > 20 && (
                    <div style={{ padding: '1rem', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '0.75rem' }}>
                      <div style={{ fontWeight: '600', color: '#fb923c', marginBottom: '0.25rem' }}>💨 Strong Winds</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Exercise caution outdoors, secure loose items</div>
                    </div>
                  )}
                  {(weatherData?.main?.feels_like || 0) < 0 && (
                    <div style={{ padding: '1rem', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '0.75rem' }}>
                      <div style={{ fontWeight: '600', color: '#38bdf8', marginBottom: '0.25rem' }}>❄️ Freezing</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Bundle up! Risk of frostbite on prolonged exposure</div>
                    </div>
                  )}
                  {(weatherData?.main?.temp || 0) > 30 && (
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem' }}>
                      <div style={{ fontWeight: '600', color: '#f87171', marginBottom: '0.25rem' }}>☀️ Heat Warning</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Apply sunscreen, drink plenty of water</div>
                    </div>
                  )}
                  {(airQuality?.main?.aqi || 0) >= 4 && (
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem' }}>
                      <div style={{ fontWeight: '600', color: '#f87171', marginBottom: '0.25rem' }}>😷 Air Quality Alert</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Air quality degraded - use mask if sensitive</div>
                    </div>
                  )}
                  {!(weatherData?.main?.humidity > 70 || weatherData?.wind?.speed > 20 || weatherData?.main?.feels_like < 0 || weatherData?.main?.temp > 30 || airQuality?.main?.aqi >= 4) && (
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem' }}>
                      <div style={{ fontWeight: '600', color: '#6ee7b7', marginBottom: '0.25rem' }}>✓ All Clear</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Excellent conditions - perfect for outdoor activities!</div>
                    </div>
                  )}
                </div>
              </div>
              <WeatherAIQuestionBox 
                weatherData={displayData}
                forecastData={forecastData}
              />
              </>
            )}

            {/* Premium Card */}
            <div style={{
              background: 'linear-gradient(225deg, #1e1b4b 0%, #02040a 100%)',
              padding: '2.5rem',
              borderRadius: '2rem',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Atmos Premium</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.5' }}>
                  Unlock hyper-local precision and AI weather predictions.
                </p>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', background: 'white', color: 'black', borderRadius: '12px' }}
                >
                  UPGRADE NOW
                </button>
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: '#a78bfa',
                filter: 'blur(60px)',
                opacity: 0.3
              }} />
            </div>
          </div>
        </div>
        </main>
        <AnimatePresence>
          {reportOpen && weatherData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(2, 4, 10, 0.92)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                zIndex: 200
              }}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                style={{
                  width: 'min(1100px, 95vw)',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: '#020617',
                  borderRadius: '1.5rem',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  padding: '2.5rem',
                  boxShadow: '0 30px 80px rgba(2, 4, 10, 0.6)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: 0, color: '#64748b', letterSpacing: '0.2rem', fontSize: '0.7rem', fontWeight: '700' }}>FULL ENVIRONMENTAL REPORT</p>
                    <h2 style={{ margin: '0.35rem 0', fontSize: '2rem', fontFamily: 'Outfit' }}>
                      {weatherData.name}{weatherData?.sys?.country ? `, ${weatherData.sys.country}` : ''}
                    </h2>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                      Updated {lastUpdated ? lastUpdated.toLocaleString() : 'moments ago'} - Coordinates {coordString}
                    </p>
                  </div>
                  <button
                    onClick={() => setReportOpen(false)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid #1f2937',
                      color: '#e2e8f0',
                      borderRadius: '999px',
                      padding: '0.35rem',
                      cursor: 'pointer'
                    }}
                    aria-label="Close environmental report"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="glass" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.5)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Current Climate</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      {climateMetrics.map((metric) => (
                        <div key={metric.label} style={{ border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '1rem', padding: '0.85rem 1rem' }}>
                          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '1px' }}>{metric.label.toUpperCase()}</p>
                          <p style={{ margin: '0.35rem 0 0', fontSize: '1.25rem', fontWeight: '700' }}>{metric.value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '1px' }}>SUNRISE</p>
                        <p style={{ margin: '0.35rem 0 0', fontSize: '1.15rem', fontWeight: '700' }}>{sunriseTime}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '1px' }}>SUNSET</p>
                        <p style={{ margin: '0.35rem 0 0', fontSize: '1.15rem', fontWeight: '700' }}>{sunsetTime}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '1px' }}>CONDITIONS</p>
                        <p style={{ margin: '0.35rem 0 0', fontSize: '1rem', fontWeight: '600', textTransform: 'capitalize' }}>
                          {displayData?.weather?.[0]?.description || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.5)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Air Quality</h3>
                    <div style={{textAlign: 'center', color: '#94a3b8'}}>
                      <p>{airQuality ? String(airDescriptor?.label || 'N/A') : 'No Data'}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  <div className="glass" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.5)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Forecast Outlook</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {compactForecast.map((entry) => {
                        const day = new Date(entry.dt * 1000);
                        return (
                          <div key={entry.dt} style={{ border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '1rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '1px' }}>{day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</p>
                              <p style={{ margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: '600', textTransform: 'capitalize' }}>{entry.weather[0].description}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{Math.round(entry.main.temp_max)}° / {Math.round(entry.main.temp_min)}°</p>
                              <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Rain chance {entry.pop ? Math.round(entry.pop * 100) : 0}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.5)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Preparedness Checklist</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {safeReportInsights.map((tip, index) => (
                        <li key={`${String(tip)}-${index}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '1rem', padding: '0.9rem 1rem' }}>
                          <span style={{ color: '#60a5fa', fontWeight: '700' }}>-</span>
                          <span style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{String(tip || 'N/A')}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setReportOpen(false)}
                      style={{
                        width: '100%',
                        marginTop: '1.5rem',
                        padding: '0.85rem',
                        borderRadius: '0.9rem',
                        border: 'none',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                        color: '#020617'
                      }}
                    >
                      Close Report
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
