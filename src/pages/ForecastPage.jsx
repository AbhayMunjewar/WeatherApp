import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, History as HistoryIcon, PieChart, HelpCircle,
  MapPin, Settings, User, Wind, Droplets, Eye, Compass, Cloud,
  CloudRain, CloudSnow, CloudLightning, Sun, Moon, CloudDrizzle,
  Loader2, ArrowLeft, ChevronLeft, ChevronRight, Thermometer,
  LogOut, Calendar, Clock, TrendingUp, TrendingDown, Sunrise, Sunset
} from 'lucide-react';
import CitySearchWithSuggestions from '../components/CitySearchWithSuggestions';
import WeatherBackground from '../components/WeatherBackground';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

/* ─── Sidebar Item ─── */
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

/* ─── Helpers ─── */
const getWeatherIcon = (condition) => {
  if (!condition) return Sun;
  const c = condition.toLowerCase();
  if (c.includes('thunderstorm') || c.includes('storm')) return CloudLightning;
  if (c.includes('drizzle')) return CloudDrizzle;
  if (c.includes('rain')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('cloud')) return Cloud;
  return Sun;
};

const getWeatherGradient = (condition) => {
  if (!condition) return 'linear-gradient(135deg, #f59e0b22, #f59e0b08)';
  const c = condition.toLowerCase();
  if (c.includes('thunderstorm')) return 'linear-gradient(135deg, #7c3aed22, #7c3aed08)';
  if (c.includes('rain') || c.includes('drizzle')) return 'linear-gradient(135deg, #3b82f622, #3b82f608)';
  if (c.includes('snow')) return 'linear-gradient(135deg, #06b6d422, #06b6d408)';
  if (c.includes('cloud')) return 'linear-gradient(135deg, #64748b22, #64748b08)';
  return 'linear-gradient(135deg, #f59e0b22, #f59e0b08)';
};

const getIconColor = (condition) => {
  if (!condition) return '#f59e0b';
  const c = condition.toLowerCase();
  if (c.includes('thunderstorm')) return '#a78bfa';
  if (c.includes('rain') || c.includes('drizzle')) return '#60a5fa';
  if (c.includes('snow')) return '#67e8f9';
  if (c.includes('cloud')) return '#94a3b8';
  return '#f59e0b';
};

const formatTime = (dtTxt) => {
  const date = new Date(dtTxt);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDayLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const groupByDay = (list) => {
  const groups = {};
  list.forEach(item => {
    const dateKey = item.dt_txt.split(' ')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  });
  return groups;
};

const isCurrentSlot = (dtTxt) => {
  const now = new Date();
  const slotTime = new Date(dtTxt);
  const nextSlot = new Date(slotTime.getTime() + 3 * 60 * 60 * 1000);
  return now >= slotTime && now < nextSlot;
};

/* ─── 3-Hour Forecast Card ─── */
const ForecastCard = ({ item, isCurrent }) => {
  const Icon = getWeatherIcon(item.weather?.[0]?.main);
  const iconColor = getIconColor(item.weather?.[0]?.main);
  const bgGradient = getWeatherGradient(item.weather?.[0]?.main);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.25 }}
      style={{
        minWidth: '140px',
        padding: '1.25rem 1rem',
        borderRadius: '1.25rem',
        background: isCurrent
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.15))'
          : bgGradient,
        border: isCurrent
          ? '1.5px solid rgba(139, 92, 246, 0.6)'
          : isHovered
          ? '1px solid rgba(255,255,255,0.15)'
          : '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        boxShadow: isCurrent
          ? '0 0 20px rgba(139, 92, 246, 0.15), 0 8px 32px rgba(0,0,0,0.3)'
          : isHovered
          ? '0 12px 40px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(0,0,0,0.2)',
        transition: 'border 0.3s, box-shadow 0.3s',
        flexShrink: 0
      }}
    >
      {/* Current slot indicator */}
      {isCurrent && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#a78bfa',
          boxShadow: '0 0 8px #a78bfa',
          animation: 'pulse 2s infinite'
        }} />
      )}

      {/* Time */}
      <div style={{
        fontSize: '0.7rem',
        color: isCurrent ? '#c4b5fd' : '#64748b',
        fontWeight: '700',
        letterSpacing: '0.5px',
        marginBottom: '0.75rem',
        textTransform: 'uppercase'
      }}>
        {isCurrent ? '● NOW' : formatTime(item.dt_txt)}
      </div>

      {/* Icon */}
      <div style={{ marginBottom: '0.75rem' }}>
        <Icon size={28} color={isCurrent ? '#c4b5fd' : iconColor} strokeWidth={1.8} />
      </div>

      {/* Temperature */}
      <div style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        fontFamily: 'Outfit, sans-serif',
        marginBottom: '0.25rem',
        color: isCurrent ? '#fff' : '#e2e8f0'
      }}>
        {Math.round(item.main?.temp || 0)}°
      </div>

      {/* Description */}
      <div style={{
        fontSize: '0.65rem',
        color: isCurrent ? '#c4b5fd' : '#64748b',
        textTransform: 'capitalize',
        fontWeight: '500',
        marginBottom: '0.75rem',
        lineHeight: 1.3
      }}>
        {item.weather?.[0]?.description || 'N/A'}
      </div>

      {/* Mini stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.6rem',
        fontSize: '0.6rem',
        color: isCurrent ? '#c4b5fd' : '#475569'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <Droplets size={10} /> {item.main?.humidity || 0}%
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <Wind size={10} /> {Math.round(item.wind?.speed || 0)}
        </span>
      </div>
    </motion.div>
  );
};

/* ─── Day Section with Horizontal Scroll ─── */
const DaySection = ({ dateKey, items, index }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const dayItems = items.slice(0, 8); // Max 8 entries per day
  const isToday = formatDayLabel(dateKey) === 'Today';

  // Compute day summary
  const temps = dayItems.map(i => i.main?.temp || 0);
  const highTemp = Math.round(Math.max(...temps));
  const lowTemp = Math.round(Math.min(...temps));
  const avgHumidity = Math.round(dayItems.reduce((a, i) => a + (i.main?.humidity || 0), 0) / dayItems.length);
  const maxWind = Math.round(Math.max(...dayItems.map(i => i.wind?.speed || 0)));
  const dominantCondition = dayItems[Math.floor(dayItems.length / 2)]?.weather?.[0]?.main || 'Clear';
  const DayIcon = getWeatherIcon(dominantCondition);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    return () => { if (el) el.removeEventListener('scroll', checkScroll); };
  }, [items]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      style={{ marginBottom: '2rem' }}
    >
      {/* Day Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: isToday
              ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))'
              : 'rgba(30, 41, 59, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isToday ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)'
          }}>
            <DayIcon size={18} color={isToday ? '#a78bfa' : '#64748b'} />
          </div>
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              fontFamily: 'Outfit, sans-serif',
              margin: 0,
              color: isToday ? '#e2e8f0' : '#94a3b8'
            }}>
              {formatDayLabel(dateKey)}
            </h3>
            <p style={{
              fontSize: '0.7rem',
              color: '#475569',
              margin: 0,
              fontWeight: '500'
            }}>
              {new Date(dateKey).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Day Summary Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '0.3rem 0.7rem', borderRadius: '999px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '0.7rem', color: '#f87171', fontWeight: '600'
          }}>
            <TrendingUp size={12} /> {highTemp}°
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '0.3rem 0.7rem', borderRadius: '999px',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            fontSize: '0.7rem', color: '#60a5fa', fontWeight: '600'
          }}>
            <TrendingDown size={12} /> {lowTemp}°
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '0.3rem 0.7rem', borderRadius: '999px',
            background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
            fontSize: '0.7rem', color: '#93c5fd', fontWeight: '600'
          }}>
            <Droplets size={12} /> {avgHumidity}%
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '0.3rem 0.7rem', borderRadius: '999px',
            background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)',
            fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600'
          }}>
            <Wind size={12} /> {maxWind} km/h
          </div>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div style={{ position: 'relative' }}>
        {/* Left scroll button */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll(-1)}
              style={{
                position: 'absolute',
                left: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#e2e8f0',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
              }}
            >
              <ChevronLeft size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right scroll button */}
        <AnimatePresence>
          {canScrollRight && dayItems.length > 4 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll(1)}
              style={{
                position: 'absolute',
                right: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#e2e8f0',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
              }}
            >
              <ChevronRight size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            padding: '0.5rem 0.25rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {dayItems.map((item) => (
            <ForecastCard
              key={item.dt}
              item={item}
              isCurrent={isCurrentSlot(item.dt_txt)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Summary Banner ─── */
const ForecastSummaryBanner = ({ forecastList, cityName }) => {
  if (!forecastList?.length) return null;

  const allTemps = forecastList.map(i => i.main?.temp || 0);
  const overallHigh = Math.round(Math.max(...allTemps));
  const overallLow = Math.round(Math.min(...allTemps));
  const totalDays = Object.keys(groupByDay(forecastList)).length;
  const totalSlots = forecastList.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}
    >
      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '1rem',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.06))',
        border: '1px solid rgba(139,92,246,0.2)'
      }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          LOCATION
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} color="#a78bfa" />
          <span style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'Outfit' }}>{cityName || 'Unknown'}</span>
        </div>
      </div>

      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '1rem',
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          TEMP RANGE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#f87171', fontSize: '1.1rem', fontWeight: '700', fontFamily: 'Outfit' }}>↑ {overallHigh}°</span>
          <span style={{ color: '#475569' }}>·</span>
          <span style={{ color: '#60a5fa', fontSize: '1.1rem', fontWeight: '700', fontFamily: 'Outfit' }}>↓ {overallLow}°</span>
        </div>
      </div>

      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '1rem',
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          COVERAGE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} color="#10b981" />
          <span style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'Outfit' }}>{totalDays} Days</span>
          <span style={{ color: '#475569', fontSize: '0.8rem' }}>· {totalSlots} slots</span>
        </div>
      </div>

      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '1rem',
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          INTERVAL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="#f59e0b" />
          <span style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'Outfit' }}>3-Hour</span>
          <span style={{ color: '#475569', fontSize: '0.8rem' }}>precision</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Loading Skeleton ─── */
const ForecastSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    {[0, 1, 2].map(i => (
      <div key={i}>
        <div style={{
          width: '200px', height: '24px', borderRadius: '8px',
          background: 'rgba(30,41,59,0.5)', marginBottom: '1rem',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[0, 1, 2, 3, 4].map(j => (
            <div key={j} style={{
              width: '140px', height: '180px', borderRadius: '1.25rem',
              background: 'rgba(30,41,59,0.5)', flexShrink: 0,
              animation: `pulse 1.5s ease-in-out ${j * 0.1}s infinite`
            }} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════ MAIN PAGE COMPONENT ═══════════════════════ */
const ForecastPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [forecastList, setForecastList] = useState([]);
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const initialCity = searchParams.get('city') || 'London';

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch forecast
  const fetchForecast = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error(`Couldn't find forecast for "${city}". Check the name and try again.`);
      const data = await res.json();
      if (!data.list?.length) throw new Error('No forecast data available.');

      setCityName(data.city?.name || city);
      setForecastList(data.list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error('Unable to load forecast for this location.');
      const data = await res.json();
      if (!data.list?.length) throw new Error('No forecast data available.');

      setCityName(data.city?.name || 'Your Location');
      setForecastList(data.list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(initialCity);
  }, [initialCity]);

  const groupedDays = groupByDay(forecastList);
  const dayKeys = Object.keys(groupedDays);
  const dominantCondition = forecastList[0]?.weather?.[0]?.main || 'Clear';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#02040a',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      position: 'relative'
    }}>
      {/* Weather Background */}
      <WeatherBackground weatherCondition={dominantCondition} isDaytime={true} />

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
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #3b82f6, #a78bfa)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Compass size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Outfit', margin: 0 }}>Atmos</h1>
            <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600', margin: 0 }}>MIDNIGHT LUSTER V2</p>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          <SidebarItem icon={Calendar} label="Forecast" to={`/forecast?city=${encodeURIComponent(cityName || initialCity)}`} active />
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

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Nav */}
        <nav style={{
          padding: '1rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(30,41,59,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
                borderRadius: '10px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={16} /> Dashboard
            </button>
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              fontFamily: 'Outfit',
              margin: 0,
              background: 'linear-gradient(90deg, #e2e8f0, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              3-Hour Forecast
            </h2>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </nav>

        {/* Scrollable content */}
        <main style={{ flex: 1, padding: '1rem 3rem 3rem', overflowY: 'auto' }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '700px' }}>
              <CitySearchWithSuggestions
                onCitySelect={(name, lat, lon) => {
                  if (typeof lat === 'number' && typeof lon === 'number') {
                    fetchForecastByCoords(lat, lon);
                  } else {
                    fetchForecast(name);
                  }
                }}
                API_KEY={API_KEY}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: '1.25rem 1.75rem',
                borderRadius: '1rem',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                background: 'rgba(69, 10, 10, 0.6)',
                color: '#fecaca',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{error}</span>
              <button
                onClick={() => fetchForecast(initialCity)}
                style={{
                  background: '#fca5a5', border: 'none', color: '#0f172a',
                  borderRadius: '999px', padding: '0.4rem 1.2rem',
                  fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem'
                }}
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* Loading */}
          {loading ? (
            <ForecastSkeleton />
          ) : (
            <>
              {/* Summary Banner */}
              <ForecastSummaryBanner forecastList={forecastList} cityName={cityName} />

              {/* Day Sections */}
              {dayKeys.map((dateKey, index) => (
                <DaySection
                  key={dateKey}
                  dateKey={dateKey}
                  items={groupedDays[dateKey]}
                  index={index}
                />
              ))}

              {/* Footer Credits */}
              {forecastList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    textAlign: 'center',
                    padding: '2rem 0',
                    color: '#334155',
                    fontSize: '0.7rem',
                    fontWeight: '500'
                  }}
                >
                  Data provided by OpenWeather · Updated every 3 hours · {forecastList.length} time slots loaded
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        main::-webkit-scrollbar { width: 6px; }
        main::-webkit-scrollbar-track { background: transparent; }
        main::-webkit-scrollbar-thumb {
          background: rgba(139,92,246,0.3);
          border-radius: 3px;
        }
        main::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.5); }
        div::-webkit-scrollbar { height: 0; width: 0; }
      `}</style>
    </div>
  );
};

export default ForecastPage;
