import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SearchBar';
import { useWeather } from '../context/WeatherContext';
import { Search, MapPin, CloudSnow, Sparkles, Globe, Wind } from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import Suggestion from '../components/Suggestion';
import Forecast from '../components/Forecast';
import History from '../components/History';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { formatTemp } from '../utils/formatTemp';
import { getSuggestion } from '../utils/getSuggestion';

export default function Dashboard() {
  const { weatherData, forecastData, loading, error, history, fetchWeather } = useWeather();
  const [searchInput, setSearchInput] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput) fetchWeather(searchInput);
  };


  if (loading) return <Loader title="Orbital Uplink" subtitle="Acquiring Sector Telemetry..." fill />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchWeather(city)} fill />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar sector="Alpha-1" subtitle="Live Telemetry" showUser userName="Com.Vaughn" userId="ID: 0892-X" />
        <main style={styles.main}>
          {/* Content Area */}
          <div style={styles.content}>
            {/* Left Panel */}
            <div style={styles.leftPanel}>
              <form onSubmit={handleSearch} style={styles.queryBox}>
                <Search size={16} color="var(--text-dim)" />
                <input 
                  type="text" 
                  placeholder="Query Target Sector" 
                  style={styles.queryInput}
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </form>

              <button style={styles.gpsBtn} onClick={() => fetchWeather('Oslo')}>
                <MapPin size={14} color="var(--cyan)" />
                <span className="mono" style={{ fontSize: '0.75rem' }}>Establish GPS Link</span>
              </button>

              {/* Weather Card */}
              {weatherData && (
                <div style={styles.weatherCard}>
                  <div style={styles.weatherHeader}>
                    <div>
                      <span className="label">Live Telemetry:</span>
                      <p className="mono" style={{ fontSize: '0.8rem', marginTop: 2 }}>{weatherData.name}</p>
                    </div>
                    <CloudSnow size={24} color="var(--cyan)" />
                  </div>
                  <div style={styles.tempDisplay}>{formatTemp(weatherData.main.temp)}°</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.5rem' }}>{weatherData.weather[0].main === 'Clear' ? '☀️' : '☁️'}</span>
                    <div>
                      <p className="mono" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {getSuggestion(weatherData.weather[0].main)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Strategist */}
              <div style={styles.aiCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Sparkles size={16} color="var(--amber)" />
                  <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700 }}>AI Strategist:</span>
                </div>
                <p style={styles.aiText}>
                  {weatherData ? getSuggestion(weatherData.weather[0].main) : 'Analyzing atmospheric density...'}
                </p>
              </div>

              {/* Recent Coordinates */}
              <div style={{ marginTop: 24 }}>
                <span className="label">Recent Coordinates</span>
                <div style={styles.coordTags}>
                  {history.map(c => (
                    <span 
                      key={c} 
                      className="mono" 
                      onClick={() => fetchWeather(c)} 
                      style={{ ...styles.coordTag, cursor: 'pointer' }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <button className="btn-accent" style={styles.syncBtn} onClick={() => fetchWeather(city)}>Sync Satellite</button>
            </div>

            {/* Center - Globe Area */}
            <div style={styles.centerPanel}>
              <div style={styles.globeArea}>
                <div style={styles.satelliteLabel} className="mono">Satellite Active</div>
                <div style={styles.globeWrapper}>
                  <Globe size={260} color="var(--cyan-dark)" strokeWidth={0.5} />
                  <div style={styles.globeOverlay} />
                  <div style={styles.targetMarker}>
                    <span className="status-dot active" style={{ width: 6, height: 6 }} />
                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--cyan)', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 4 }}>
                      TARGET_LOCKED:{city.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.globeStatus}>
                <span><span className="status-dot active" /> <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{weatherData ? 'SAT_LOCKED' : 'BUSY'}</span></span>
                <span><span className="status-dot active" /> <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>SIGNAL_98%</span></span>
              </div>
            </div>

            {/* Right Panel */}
            <div style={styles.rightPanel}>
              <span className="label">5-Day Orbital Projection</span>
              <div style={styles.forecastList}>
                {forecastData ? forecastData.list.filter((_, i) => i % 8 === 0).map(f => (
                  <div key={f.dt} style={styles.forecastItem}>
                    <span className="mono" style={{ fontSize: '0.6rem' }}>{new Date(f.dt * 1000).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()}</span>
                    <span style={{ fontSize: '1rem' }}>{f.weather[0].main === 'Clear' ? '☀️' : '☁️'}</span>
                    <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>{formatTemp(f.main.temp)}°</span>
                  </div>
                )) : (
                  <p className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Awaiting telemetry...</p>
                )}
              </div>

              {weatherData && (
                <>
                  <div style={{ marginTop: 32 }}>
                    <span className="label">Atmospheric Metrics</span>
                    <div style={styles.metricsGrid}>
                      <div style={styles.metricCircle}>
                        <svg width="60" height="60" viewBox="0 0 60 60">
                          <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                          <circle cx="30" cy="30" r="26" fill="none" stroke="var(--cyan)" strokeWidth="3"
                            strokeDasharray={`${(weatherData.main.humidity / 100) * 163} 163`} strokeLinecap="round" transform="rotate(-90 30 30)" />
                        </svg>
                        <span className="mono" style={styles.metricValue}>{weatherData.main.humidity}%</span>
                        <span className="label" style={{ marginTop: 4 }}>Humidity</span>
                      </div>
                      <div style={styles.metricCircle}>
                        <svg width="60" height="60" viewBox="0 0 60 60">
                          <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                          <circle cx="30" cy="30" r="26" fill="none" stroke="var(--amber)" strokeWidth="3"
                            strokeDasharray={`${(1012 / 1200) * 163} 163`} strokeLinecap="round" transform="rotate(-90 30 30)" />
                        </svg>
                        <span className="mono" style={styles.metricValue}>{weatherData.main.pressure}</span>
                        <span className="label" style={{ marginTop: 4 }}>hPa</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 32 }}>
                    <span className="label">Wind Vector</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>{Math.round(weatherData.wind.speed * 3.6)} KM/H</span>
                      <Wind size={28} color="var(--cyan)" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom ticker */}
          <div style={styles.ticker}>
            <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--amber)' }}>
              {error ? 'UPLINK ERROR: ' + error.toUpperCase() : 'AR FLARE DETECTED - SATELLITE INTERFERENCE MINIMAL'}
            </span>
            <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
              INFO: <span className="cyan">{loading ? 'ACQUIRING DATA...' : 'NEW DATA BATCH: FROM HUBBLE-X INCOMING'}</span>
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content: { flex: 1, display: 'flex', padding: 20, gap: 20 },
  leftPanel: { width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' },
  queryBox: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6,
  },
  queryInput: {
    background: 'transparent', border: 'none', color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', outline: 'none', width: '100%', letterSpacing: 1,
  },
  gpsBtn: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginTop: 10,
    background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 6,
    color: 'var(--text-primary)', cursor: 'pointer', transition: 'var(--transition)',
  },
  weatherCard: {
    marginTop: 16, padding: 20, background: 'linear-gradient(135deg, rgba(0,229,255,0.08), var(--bg-card))',
    border: '1px solid rgba(0,229,255,0.15)', borderRadius: 8,
  },
  weatherHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  tempDisplay: {
    fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 900,
    color: 'var(--cyan)', lineHeight: 1, margin: '8px 0 12px',
  },
  aiCard: {
    marginTop: 16, padding: 16, background: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: 8,
  },
  aiText: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 },
  coordTags: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  coordTag: {
    fontSize: '0.65rem', padding: '6px 12px', border: '1px solid var(--border-color)',
    borderRadius: 4, color: 'var(--text-secondary)', letterSpacing: 1,
  },
  syncBtn: { marginTop: 'auto', width: '100%', padding: '12px 20px', fontSize: '0.75rem' },
  centerPanel: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  globeArea: { position: 'relative', padding: 40 },
  satelliteLabel: {
    position: 'absolute', top: 20, left: '25%', fontSize: '0.6rem',
    color: 'var(--text-dim)', transform: 'rotate(-30deg)', letterSpacing: 2,
  },
  globeWrapper: { position: 'relative' },
  globeOverlay: {
    position: 'absolute', inset: -20,
    border: '1px solid rgba(0,229,255,0.08)', borderRadius: '50%',
    boxShadow: '0 0 60px rgba(0,229,255,0.05), inset 0 0 60px rgba(0,229,255,0.03)',
  },
  targetMarker: {
    position: 'absolute', top: '40%', left: '55%',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  globeStatus: { display: 'flex', gap: 40, marginTop: 24 },
  rightPanel: { width: 200, flexShrink: 0 },
  forecastList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 },
  forecastItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6,
  },
  metricsGrid: { display: 'flex', gap: 16, marginTop: 12 },
  metricCircle: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  metricValue: { fontSize: '0.8rem', fontWeight: 700, marginTop: -40, marginBottom: 20 },
  ticker: {
    display: 'flex', justifyContent: 'space-between', padding: '8px 20px',
    borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
  },
};
