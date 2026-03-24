import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        let queryParam = `q=${city}`;
        
        // Check if city is actually lat,lon coordinates
        if (city.includes(',') && !isNaN(city.split(',')[0]) && !isNaN(city.split(',')[1])) {
          const [lat, lon] = city.split(',');
          queryParam = `lat=${lat}&lon=${lon}`;
        }

        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?${queryParam}&appid=${API_KEY}&units=metric`
        );
        if (!currentRes.ok) throw new Error('Location not found');
        const currentData = await currentRes.json();
        setWeatherData(currentData);

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?${queryParam}&appid=${API_KEY}&units=metric`
        );
        const foreData = await forecastRes.json();
        
        // Filter to get one forecast per day (around noon)
        const dailyForecast = foreData.list.filter(item => item.dt_txt.includes('12:00:00'));
        setForecastData(dailyForecast);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  const getWeatherIcon = (condition) => {
    const main = condition.toLowerCase();
    if (main.includes('cloud')) return Cloud;
    if (main.includes('rain')) return CloudRain;
    if (main.includes('storm')) return CloudLightning;
    return Sun;
  };

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
          <SidebarItem icon={Sun} label="Forecast" active to="#" />
          <SidebarItem icon={Map} label="Radar" to="/map" />
          <SidebarItem icon={Wind} label="Air Quality" to="#" />
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
                placeholder="Search new area..."
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
        ) : weatherData && (
        <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>
              <Navigation size={14} /> {weatherData.name}, {weatherData.sys.country}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '8rem', fontWeight: '700', fontFamily: 'Outfit', lineHeight: '1' }}>{Math.round(weatherData.main.temp)}°</h1>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '500', marginBottom: '3rem', textTransform: 'capitalize' }}>
              {weatherData.weather[0].description} <span style={{ color: '#64748b', fontSize: '1.2rem', marginLeft: '1rem' }}>H: {Math.round(weatherData.main.temp_max)}° L: {Math.round(weatherData.main.temp_min)}°</span>
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
                <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>0 mm</div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '1rem' }}>No rain expected in the next 24 hours.</p>
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
                return (
                  <div key={item.dt} style={{ flex: 1, padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1.5rem', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', fontWeight: '700' }}>{date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>
                    <Icon color={i === 2 ? 'white' : '#f59e0b'} size={32} style={{ margin: '1rem auto' }} />
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
                <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>{weatherData.wind.speed} <span style={{ fontSize: '1rem', color: '#64748b' }}>km/h</span></div>
                <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px' }}>
                  <div style={{ width: '40%', height: '100%', background: 'linear-gradient(to right, #3b82f6, #a78bfa)', borderRadius: '3px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                   <span style={{ color: '#94a3b8' }}>Humidity</span>
                   <span style={{ fontWeight: '600' }}>{weatherData.main.humidity}%</span>
                </div>
             </div>

             <div className="glass" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <div>
                     <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Air Quality Index</div>
                     <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Healthy air quality for outdoor activities.</p>
                   </div>
                   <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>22</div>
                </div>
                <div style={{ height: '8px', background: 'linear-gradient(to right, #3b82f6, #60a5fa, #fbbf24, #ef4444)', borderRadius: '4px', position: 'relative' }}>
                   <div style={{ position: 'absolute', left: '22%', top: '-2px', width: '12px', height: '12px', background: 'white', border: '2px solid #3b82f6', borderRadius: '50%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.6rem', color: '#64748b', fontWeight: '700' }}>
                   <span>GOOD</span>
                   <span>MODERATE</span>
                   <span>UNHEALTHY</span>
                   <span>HAZARDOUS</span>
                </div>
             </div>
           </div>
        </section>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
