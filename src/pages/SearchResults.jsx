import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, Sun, Droplets, Wind, Navigation, 
  Search, Bell, User, LayoutDashboard, Map, 
  History as HistoryIcon, PieChart, Sunrise, Sunset, ShieldAlert,
  Compass, Settings, HelpCircle, MapPin, History, CloudRain, CloudLightning, Loader2
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const SidebarItem = ({ icon: Icon, label, active = false, to = '#' }) => (
  <Link 
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.9rem 1.25rem',
      borderRadius: '0.75rem',
      background: active ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
      color: active ? '#a78bfa' : '#94a3b8',
      cursor: 'pointer',
      marginBottom: '0.5rem',
      transition: 'all 0.2s',
      fontWeight: active ? '600' : '500',
      textDecoration: 'none'
  }}>
    {Icon && <Icon size={20} />}
    <span>{label}</span>
  </Link>
);

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || 'San Francisco';
  
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const lastSavedCity = useRef(null);

  useEffect(() => {
    setSelectedDayIndex(null);
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        let currentData = null;
        let success = false;
        let finalQueryParam = '';

        // 1. Is it exactly coordinates? Example: "21.1458,79.0882"
        if (city.includes(',') && !isNaN(city.split(',')[0].trim()) && !isNaN(city.split(',')[1].trim())) {
          const [lat, lon] = city.split(',').map(c => c.trim());
          const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
          if (currentRes.ok) {
            currentData = await currentRes.json();
            success = true;
          }
        }

        // 2. Multi-strategy omni-search if coordinates absent or failed
        if (!success) {
          let customDisplayName = null;
          const endpointsToTry = [];
          
          try {
             // Strategy A: OpenStreetMap Nominatim Universal Geocoder (God-Tier for complex addresses/local areas)
             // This flawlessly parses hyper-local inputs like "bhagwan nagar , nagpur -27" that break OpenWeather
             const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
             if (nominatimRes.ok) {
                const nomData = await nominatimRes.json();
                if (nomData && nomData.length > 0) {
                   endpointsToTry.push(`lat=${nomData[0].lat}&lon=${nomData[0].lon}`);
                   customDisplayName = nomData[0].name || nomData[0].display_name.split(',')[0];
                }
             }
             
             // Strategy B: Advanced Geocoding for local Area/City via OpenWeather
             const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
             if (geoRes.ok) {
               const geoData = await geoRes.json();
               if (geoData && geoData.length > 0) {
                 endpointsToTry.push(`lat=${geoData[0].lat}&lon=${geoData[0].lon}`);
                 if (!customDisplayName) customDisplayName = geoData[0].name;
               }
             }
          } catch(e) {}
          
          // Strategy C: Pure string search natively against the Weather engine
          endpointsToTry.push(`q=${encodeURIComponent(city)}`);

          
          // Strategy C: If the query contains digits, heavily prioritize fetching it as a Postal Code
          if (/\d/.test(city)) {
             endpointsToTry.push(`zip=${encodeURIComponent(city)}`);
             if (!city.includes(',')) endpointsToTry.push(`zip=${encodeURIComponent(city)},IN`); // Extended zipcode fallback
          }

          // Execute strategies until one succeeds!
          for (let endpoint of endpointsToTry) {
             const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?${endpoint}&appid=${API_KEY}&units=metric`);
             if (currentRes.ok) {
                currentData = await currentRes.json();
                
                // UX Fix: If OpenWeather returns a generic regional weather station name ("Gevrai") 
                // for our precise GPS coordinates, confidently overwrite it with the hyper-local Custom Name ("Bhagwan Nagar")!
                if (customDisplayName && endpoint.includes('lat=')) {
                   currentData.name = customDisplayName;
                }
                
                success = true;
                break;

             }
          }
        }

        if (!success || !currentData) throw new Error(`Location "${city}" not found. Try a broader city or proper postal format.`);
        
        // Ensure subsequent fetch (Forecast, AirQuality) relies strictly on true coordinates
        finalQueryParam = `lat=${currentData.coord.lat}&lon=${currentData.coord.lon}`;

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?${finalQueryParam}&appid=${API_KEY}&units=metric`
        );
        const foreData = await forecastRes.json();
        
        // Fetch Real AQI for the current location
        try {
          const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?${finalQueryParam}&appid=${API_KEY}`);
          if (aqiRes.ok) {
            const aqiData = await aqiRes.json();
            currentData.aqi = aqiData.list[0].main.aqi;
          }
        } catch(e) {}
        
        setWeatherData(currentData);
        
        // Filter to get one forecast per day (around noon)
        const dailyForecast = foreData.list.filter(item => item.dt_txt.includes('12:00:00'));
        setForecastData(dailyForecast);

        // Save to Database Backgroundly
        if (lastSavedCity.current !== city) {
          lastSavedCity.current = city; // Mark immediately to prevent race conditions in Strict Mode
          try {
            await fetch('http://127.0.0.1:5000/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                city: currentData.name,
                temperature: currentData.main.temp,
                description: currentData.weather[0].description
              })
            });
          } catch(e) {
            console.error("Failed to save to history DB", e);
            lastSavedCity.current = null; // Revert on failure
          }
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  const displayData = selectedDayIndex !== null && forecastData[selectedDayIndex]
    ? {
        ...weatherData,
        main: {
           ...weatherData.main,
           temp: forecastData[selectedDayIndex].main.temp,
           temp_max: forecastData[selectedDayIndex].main.temp_max,
           temp_min: forecastData[selectedDayIndex].main.temp_min,
           humidity: forecastData[selectedDayIndex].main.humidity,
        },
        weather: forecastData[selectedDayIndex].weather,
        wind: forecastData[selectedDayIndex].wind,
        isForecast: true,
        pop: forecastData[selectedDayIndex].pop
      }
    : (weatherData ? { ...weatherData, isForecast: false } : null);

  const getWeatherIcon = (condition) => {
    const main = condition.toLowerCase();
    if (main.includes('cloud')) return Cloud;
    if (main.includes('rain')) return CloudRain;
    if (main.includes('storm')) return CloudLightning;
    return Sun;
  };

  const getAqiDisplay = (aqi) => {
    switch(aqi) {
      case 1: return { text: 'Good', desc: 'Air quality is favorable.', color: '#22c55e', percent: '10%' };
      case 2: return { text: 'Fair', desc: 'Air quality is acceptable.', color: '#84cc16', percent: '30%' };
      case 3: return { text: 'Moderate', desc: 'Healthy for most people.', color: '#eab308', percent: '50%' };
      case 4: return { text: 'Poor', desc: 'May cause health issues.', color: '#f97316', percent: '70%' };
      case 5: return { text: 'Hazardous', desc: 'Emergency conditions.', color: '#ef4444', percent: '90%' };
      default: return { text: 'Unknown', desc: 'Data unavailable.', color: '#64748b', percent: '0%' };
    }
  };

  const currentAqi = weatherData?.aqi || 0;
  const aqiInfo = getAqiDisplay(currentAqi);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#02040a',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        borderRight: '1px solid #1e293b',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#60a5fa', marginBottom: '0.2rem' }}>Atmospheric Lens</h2>
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Local Weather</p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          <SidebarItem icon={Sun} label="Forecast" active={!showMap} to="#" />
          <div 
            onClick={() => setShowMap(!showMap)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.9rem 1.25rem',
              borderRadius: '0.75rem',
              background: showMap ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: showMap ? '#a78bfa' : '#94a3b8',
              cursor: 'pointer',
              marginBottom: '0.5rem',
              transition: 'all 0.2s',
              fontWeight: showMap ? '600' : '500',
            }}>
            <Map size={20} />
            <span>Map</span>
          </div>
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            <span style={{ color: '#60a5fa' }}>Weather </span>
            <span style={{ color: '#a78bfa' }}>App</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search city, street, or zip..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/search?city=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
                style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid #1e293b',
                  borderRadius: '99px',
                  padding: '0.6rem 1rem 0.6rem 2.5rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '250px'
                }}
              />
            </div>
            <MapPin size={20} color="#3b82f6" cursor="pointer" onClick={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                  navigate(`/search?city=${position.coords.latitude},${position.coords.longitude}`);
                });
              }
            }} />
            <Link 
              to="/profile"
              style={{ width: '36px', height: '36px', background: '#fef3c7', borderRadius: '8px', cursor: 'pointer', display: 'block' }}
            >
              <img src="https://ui-avatars.com/api/?name=Alex+Rivers&background=fdf2f2&color=6366f1" style={{ width: '100%', borderRadius: '8px' }} alt="Profile" />
            </Link>
          </div>
        </header>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Loader2 className="animate-spin" size={48} color="#a78bfa" />
          </div>
        ) : error ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
             {error}
          </div>
        ) : showMap && weatherData ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  <Map size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Map View — {weatherData.name}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Showing ~3 km radius around the searched location</p>
              </div>
              <button 
                onClick={() => setShowMap(false)}
                style={{ background: '#a78bfa', border: 'none', color: 'white', borderRadius: '99px', padding: '0.5rem 1.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                Back to Forecast
              </button>
            </div>
            <div style={{ flex: 1, borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #1e293b', minHeight: '500px' }}>
              <iframe
                title="Location Map"
                width="100%"
                height="100%"
                style={{ border: 'none', minHeight: '500px' }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${weatherData.coord.lon - 0.03},${weatherData.coord.lat - 0.02},${weatherData.coord.lon + 0.03},${weatherData.coord.lat + 0.02}&layer=mapnik&marker=${weatherData.coord.lat},${weatherData.coord.lon}`}
              />
            </div>
            <a 
              href={`https://www.openstreetmap.org/?mlat=${weatherData.coord.lat}&mlon=${weatherData.coord.lon}#map=14/${weatherData.coord.lat}/${weatherData.coord.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center', textDecoration: 'none', fontWeight: '600' }}>
              Open Full Map in New Tab ↗
            </a>
          </div>
        ) : displayData && weatherData && (
        <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>
              <Navigation size={14} /> {weatherData.name}, {weatherData.sys.country}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '8rem', fontWeight: '700', fontFamily: 'Outfit', lineHeight: '1' }}>{Math.round(displayData.main.temp)}°</h1>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '500', marginBottom: '3rem', textTransform: 'capitalize' }}>
              {displayData.weather[0].description} <span style={{ color: '#64748b', fontSize: '1.2rem', marginLeft: '1rem' }}>H: {Math.round(displayData.main.temp_max)}° L: {Math.round(displayData.main.temp_min)}°</span>
            </div>

            {/* Grid Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3.5rem' }}>
              <div className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' }}>
                  <Sun size={16} /> UV INDEX
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>4 Moderate</div>
                <div style={{ height: '4px', background: 'linear-gradient(to right, #22c55e, #f59e0b, #ef4444)', borderRadius: '2px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '40%', top: '-2px', width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />
                </div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '1rem' }}>Use sun protection until 4:00 PM.</p>
              </div>

              <div className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' }}>
                  <Droplets size={16} /> PRECIPITATION
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                   {displayData.isForecast ? `${Math.round((displayData.pop || 0) * 100)}%` : `${weatherData.rain ? weatherData.rain['1h'] : 0} mm`}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '1rem' }}>
                   {displayData.isForecast ? 'Probability of precipitation.' : 'Rain volume in the last hour.'}
                </p>
              </div>

              <div className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' }}>
                  <Sunset size={16} /> SUN CYCLE
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>SUNRISE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>6:24 AM</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>SUNSET</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>7:51 PM</div>
                  </div>
                </div>
                {/* Arc mockup */}
                <div style={{ height: '40px', borderTop: '1px dashed #475569', borderRadius: '50% 50% 0 0', position: 'relative' }}>
                   <div style={{ position: 'absolute', left: '70%', top: '-4px', width: '8px', height: '8px', background: '#a78bfa', borderRadius: '50%' }} />
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1.5rem' }}>5-Day Forecast</h3>
               <button style={{ background: 'transparent', border: '1px solid #1e293b', color: '#3b82f6', borderRadius: '99px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>View Monthly</button>
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
                    style={{ 
                      flex: 1, 
                      padding: '1.5rem', 
                      background: isSelected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(15, 23, 42, 0.4)', 
                      borderRadius: '1.5rem', 
                      textAlign: 'center', 
                      border: isSelected ? '1px solid #a78bfa' : '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{ fontSize: '0.8rem', color: isSelected ? '#fff' : '#94a3b8', marginBottom: '1rem', fontWeight: '700' }}>{date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>
                    <Icon color={isSelected ? 'white' : '#f59e0b'} size={32} style={{ margin: '1rem auto' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Math.round(item.main.temp_max)}°</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{Math.round(item.main.temp_min)}°</div>
                  </div>
                );
              })}
            </div>
          </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div className="glass" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>WIND SPEED</div>
                  <Wind color="#3b82f6" size={20} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>{displayData.wind.speed} <span style={{ fontSize: '1rem', color: '#64748b' }}>km/h</span></div>
                <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px' }}>
                  <div style={{ width: '40%', height: '100%', background: 'linear-gradient(to right, #3b82f6, #a78bfa)', borderRadius: '3px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                   <span style={{ color: '#94a3b8' }}>Humidity</span>
                   <span style={{ fontWeight: '600' }}>{displayData.main.humidity}%</span>
                </div>
             </div>

             <div className="glass" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <div>
                     <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Air Quality Index</div>
                     <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                       {displayData.isForecast ? 'AQI forecast not available.' : aqiInfo.desc}
                     </p>
                   </div>
                   <div style={{ fontSize: displayData.isForecast ? '1.2rem' : '2.5rem', fontWeight: '700', color: displayData.isForecast ? '#64748b' : aqiInfo.color }}>
                      {displayData.isForecast ? 'Cannot Say' : aqiInfo.text}
                   </div>
                </div>
                {!displayData.isForecast && (
                <>
                  <div style={{ height: '8px', background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)', borderRadius: '4px', position: 'relative' }}>
                     <div style={{ position: 'absolute', left: aqiInfo.percent, top: '-2px', width: '12px', height: '12px', background: 'white', border: `2px solid ${aqiInfo.color}`, borderRadius: '50%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.6rem', color: '#64748b', fontWeight: '700' }}>
                     <span>GOOD</span>
                     <span>FAIR</span>
                     <span>MODERATE</span>
                     <span>POOR</span>
                     <span>SEVERE</span>
                  </div>
                </>
                )}
             </div>
           </div>
        </section>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
