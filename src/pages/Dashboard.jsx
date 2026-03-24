import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Map, History as HistoryIcon, PieChart, HelpCircle, 
  Search, MapPin, Settings, Bell, Wind, Droplets, 
  ArrowUp, ArrowDown, Eye, Umbrella, Sun, ShieldCheck,
  ChevronRight, Compass, Cloud, CloudRain, CloudLightning, Loader2,
  Locate, Activity
} from 'lucide-react';

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

  const resetDashboard = () => {
    setWeatherData(null);
    setForecastData([]);
    setSearchTerm('');
    setSelectedDayIndex(null);
    setLoading(false);
  };

  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError(null);
    setSelectedDayIndex(null);
    try {
      // Fetch Current Weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!currentRes.ok) throw new Error('City not found');
      const currentData = await currentRes.json();
      setWeatherData(currentData);

      // Fetch 5-Day Forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
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
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setSelectedDayIndex(null);
    try {
      // Fetch Current Weather by Coords
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!currentRes.ok) throw new Error('Location not found');
      const currentData = await currentRes.json();
      setWeatherData(currentData);
      setSearchTerm(currentData.name); // Update search term to current city

      // Fetch 5-Day Forecast by Coords
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
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

  useEffect(() => {
    // Attempt to load current location on initial mount
    handleLocateMe();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/search?city=${encodeURIComponent(e.target.value.trim())}`);
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Outfit', margin: 0 }}>Atmospheric</h1>
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
          <SidebarItem icon={PieChart} label="Alerts" />
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <SidebarItem icon={HelpCircle} label="Support" />
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
            <div style={{ color: '#a78bfa', fontWeight: '700', fontSize: '1.5rem', fontFamily: 'Outfit' }}>AuraWeather</div>

          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
             <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>23:48 PM</div>
             <div style={{ display: 'flex', gap: '1.25rem', color: '#94a3b8' }}>
                <MapPin size={20} cursor="pointer" />
                <Settings size={20} cursor="pointer" />
                <img src="https://ui-avatars.com/api/?name=Alex+Rivers&background=a78bfa&color=fff" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
             </div>
          </div>
        </nav>

        <main style={{ flex: 1, padding: '1rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Area with Search Bar from Image 1 */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '800px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '99px',
              border: '1px solid #1e293b',
              padding: '0.25rem'
            }}>
              <Search size={18} style={{ marginLeft: '1.5rem', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search city, street, area, or zip..."
                onKeyDown={handleSearch}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem' }}>
                <button 
                  onClick={handleLocateMe}
                  style={{ 
                  background: 'rgba(30, 41, 59, 0.6)', 
                  border: '1px solid #1e293b', 
                  color: '#94a3b8', 
                  borderRadius: '99px', 
                  padding: '0.5rem 1.25rem', 
                  fontSize: '0.8rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <Locate size={14} /> Locate
                </button>
                <button 
                  onClick={() => {
                    const val = document.querySelector('input').value.trim();
                    if(val) navigate(`/search?city=${encodeURIComponent(val)}`);
                  }}
                  style={{ 
                    background: '#a78bfa', 
                    border: 'none', 
                    color: 'white', 
                    borderRadius: '99px', 
                    padding: '0.5rem 2rem', 
                    fontSize: '0.8rem', 
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>


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
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  className="glass"
                >
                  <Loader2 className="animate-spin" size={48} color="#a78bfa" />
                </motion.div>
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
                  <h2 style={{ fontSize: '4.5rem', fontWeight: '700', fontFamily: 'Outfit', marginBottom: '0.5rem' }}>{displayData.name}</h2>
                  <p style={{ fontSize: '1.25rem', color: '#94a3b8', fontWeight: '500' }}>
                    {displayData.weather[0].main} & {displayData.weather[0].description}
                  </p>
                  
                  <div style={{ position: 'absolute', right: '3rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <div style={{ fontSize: '8rem', fontWeight: '700', fontFamily: 'Outfit', lineHeight: 1 }}>
                      {Math.round(displayData.main.temp)}°
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>↑ {Math.round(displayData.main.temp_max)}°</div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>↓ {Math.round(displayData.main.temp_min)}°</div>
                    </div>
                  </div>

                  {/* Stat Grid */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '4rem' }}>
                    <StatCard icon={Wind} label="Wind Speed" value={displayData.wind.speed} unit="km/h" color="#3b82f6" />
                    <StatCard icon={Droplets} label="Humidity" value={displayData.main.humidity} unit="%" color="#60a5fa" />
                    <StatCard icon={Compass} label="Pressure" value={displayData.main.pressure} unit="hPa" color="#f472b6" />
                    <StatCard icon={Eye} label="Visibility" value={displayData.visibility ? (displayData.visibility / 1000).toFixed(1) : "N/A"} unit={displayData.visibility ? "km" : ""} color="#a78bfa" />
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
                    if (searchTerm) navigate(`/search?city=${encodeURIComponent(searchTerm)}`);
                  }}
                >
                  VIEW DETAILED
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

               <button className="btn-secondary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', fontSize: '0.8rem', borderRadius: '12px' }}>
                 FULL ENVIRONMENTAL REPORT
               </button>
            </div>

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
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Aura Premium</h3>
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
      </div>
    </div>
  );
};

export default Dashboard;
