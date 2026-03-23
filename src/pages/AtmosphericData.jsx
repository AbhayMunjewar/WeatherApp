import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SearchBar';
import { useWeather } from '../context/WeatherContext';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

const pressureBarData = [
  { name: 'Jan', value: 45 }, { name: 'Feb', value: 65 }, { name: 'Mar', value: 40 },
  { name: 'Apr', value: 80 }, { name: 'May', value: 55 }, { name: 'Jun', value: 90 },
  { name: 'Jul', value: 70 }, { name: 'Aug', value: 60 },
];

const humidityData = [
  { name: '00', sensor: 30, prediction: 28 }, { name: '04', sensor: 35, prediction: 32 },
  { name: '08', sensor: 25, prediction: 30 }, { name: '12', sensor: 20, prediction: 22 },
  { name: '16', sensor: 28, prediction: 26 }, { name: '20', sensor: 35, prediction: 30 },
  { name: '24', sensor: 32, prediction: 28 },
];

export default function AtmosphericData() {
  const { city } = useWeather();
  const [siderealDay, setSiderealDay] = useState(245.8);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' }) + ' UTC');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar sector="7-G Alpha" subtitle="Command Center" showUser userName="Com.Vaughn" userId="ID: 0892-X" />
        <main style={styles.main}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.pageTitle}>Atmospheric Data Hub</h2>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Real-Time Stratospheric Intelligence • Live Uplink Status: Active
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cyan)', letterSpacing: 2 }}>{time}</div>
              <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Sidereal Day Counter: {siderealDay}</span>
            </div>
          </div>

          {/* Main Grid */}
          <div style={styles.grid}>
            {/* Stability Index + Gauge */}
            <div style={styles.gaugeCard} className="card">
              <div style={styles.gaugeHeader}>
                <div>
                  <span className="label">Central Metric</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cyan)', marginTop: 4 }}>Stability Index</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="label">Current Delta</span>
                  <p className="mono" style={{ fontSize: '1rem', color: 'var(--green)', marginTop: 4 }}>+0.042 %</p>
                </div>
              </div>

              {/* Circular Gauge */}
              <div style={styles.gaugeWrapper}>
                <svg width="280" height="280" viewBox="0 0 280 280">
                  <circle cx="140" cy="140" r="120" fill="none" stroke="var(--border-color)" strokeWidth="6" />
                  <circle cx="140" cy="140" r="120" fill="none" stroke="var(--cyan)" strokeWidth="6"
                    strokeDasharray={`${0.84 * 754} ${754}`} strokeLinecap="round" transform="rotate(-90 140 140)"
                    style={{ filter: 'drop-shadow(0 0 8px var(--cyan))' }} />
                  <circle cx="140" cy="140" r="105" fill="none" stroke="rgba(0,229,255,0.06)" strokeWidth="2" />
                  {/* Glow dot at end of arc */}
                  <circle cx="50" cy="200" r="5" fill="var(--cyan)" style={{ filter: 'drop-shadow(0 0 6px var(--cyan))' }} />
                </svg>
                <div style={styles.gaugeCenter}>
                  <span style={styles.gaugeValue}>84.2</span>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: 3 }}>Nominal Range</span>
                </div>
              </div>

              <div style={styles.gaugeFooter}>
                <span><span className="status-dot active" /> <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Sensor A-6 Sync</span></span>
                <span><span className="status-dot warning" /> <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Warning: Low Pressure Cell</span></span>
              </div>
            </div>

            {/* Right Column - Pressure Gradients */}
            <div style={styles.rightCol}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: 1 }}>Pressure Gradients</h3>
                  <BarChart3 size={18} color="var(--text-secondary)" />
                </div>

                {[
                  { label: 'Troposphere', value: '1013.2 hPa', pct: 100 },
                  { label: 'Stratosphere', value: '245.5 hPa', pct: 24 },
                  { label: 'Mesosphere', value: '0.1 hPa', pct: 3 },
                ].map(p => (
                  <div key={p.label} style={styles.pressureRow}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{p.label}</span>
                      <span className="mono" style={{ fontSize: '0.7rem' }}>{p.value}</span>
                    </div>
                    <div style={styles.pressureBarBg}>
                      <div style={{ ...styles.pressureBarFill, width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}

                {/* Bar Chart */}
                <div style={{ marginTop: 20, height: 160 }}>
                  <ResponsiveContainer>
                    <BarChart data={pressureBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Bar dataKey="value" fill="var(--cyan)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div style={styles.bottomRow}>
            {/* Oxygen Saturation */}
            <div className="card" style={styles.oxygenCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: '1.2rem' }}>🫁</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--amber)', letterSpacing: 1 }}>Oxygen Saturation</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1 }}>
                  20.94<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>%</span>
                </span>
                <div>
                  <span className="label">Composition Mix</span>
                  <div style={styles.compositionBar}>
                    <div style={{ width: '21%', height: '100%', background: 'var(--cyan)', borderRadius: 3 }} />
                    <div style={{ width: '78%', height: '100%', background: 'var(--border-color)', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Humidity Profile */}
            <div className="card" style={styles.humidityCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: 1 }}>Humidity Profile (H2O)</h3>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--cyan)', borderRadius: 2, marginRight: 4 }} />Sensor A
                  </span>
                  <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--text-dim)', borderRadius: 2, marginRight: 4 }} />Prediction
                  </span>
                </div>
              </div>
              <div style={{ height: 120 }}>
                <ResponsiveContainer>
                  <AreaChart data={humidityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Area type="monotone" dataKey="sensor" stroke="var(--cyan)" fill="rgba(0,229,255,0.1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="prediction" stroke="var(--text-dim)" fill="rgba(100,100,100,0.05)" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  main: { flex: 1, padding: 24, overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: 2, marginBottom: 4 },
  grid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 20 },
  gaugeCard: { padding: 24 },
  gaugeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  gaugeWrapper: { display: 'flex', justifyContent: 'center', position: 'relative', padding: '20px 0' },
  gaugeCenter: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  gaugeValue: { fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)' },
  gaugeFooter: { display: 'flex', gap: 32, justifyContent: 'center', marginTop: 8 },
  rightCol: { display: 'flex', flexDirection: 'column' },
  pressureRow: { marginBottom: 14 },
  pressureBarBg: { height: 4, background: 'var(--bg-primary)', borderRadius: 2, overflow: 'hidden' },
  pressureBarFill: { height: '100%', background: 'var(--cyan)', borderRadius: 2, transition: 'width 0.6s ease' },
  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 },
  oxygenCard: { padding: 24 },
  humidityCard: { padding: 24 },
  compositionBar: { display: 'flex', gap: 2, marginTop: 6, height: 12, width: 100 },
};
