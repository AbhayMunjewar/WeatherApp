import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SearchBar';
import { Sliders, Zap, Bell } from 'lucide-react';

export default function Settings() {
  const [luminance, setLuminance] = useState(84);
  const [chromatic, setChromatic] = useState(62);
  const [scanline, setScanline] = useState(12);
  const [syncMode, setSyncMode] = useState('realtime');
  const [alerts, setAlerts] = useState({ class4: true, solar: false, civil: true });

  const SliderRow = ({ label, value, onChange, min = 'Clean', max = 'Retro-Distortion' }) => (
    <div style={styles.sliderRow}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: '0.8rem' }}>{label}</span>
        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>{value}%</span>
      </div>
      <input
        type="range" min="0" max="100" value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={styles.slider}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span className="label">{min}</span>
        <span className="label">{max}</span>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar sector="7-G Alpha" subtitle="Command Center" showUser userName="Com.Vaughn" />
        <main style={styles.main}>
          <div style={styles.header}>
            <h2 style={styles.pageTitle}>System Configuration</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 600, marginTop: 8 }}>
              Adjust global synchronization parameters, visual output calibration, and threat response thresholds for the Orbital Weather Command network.
            </p>
          </div>

          <div style={styles.grid}>
            {/* Interface Calibration */}
            <div className="card" style={styles.calibrationCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <Sliders size={18} color="var(--cyan)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--cyan)', letterSpacing: 1 }}>
                  Interface Calibration
                </h3>
              </div>
              <SliderRow label="Luminance Intensity" value={luminance} onChange={setLuminance} min="Min-Spec" max="Overload" />
              <SliderRow label="Chromatic Variance" value={chromatic} onChange={setChromatic} min="Linear" max="Hyper-Dynamic" />
              <SliderRow label="CRT Scanline Frequency" value={scanline} onChange={setScanline} min="Clean" max="Retro-Distortion" />
            </div>

            {/* Satellite Sync + Energy */}
            <div style={styles.rightCol}>
              <div className="card" style={styles.syncCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: '1rem' }}>⚡</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: 1 }}>Satellite Sync</h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                  Define how often the command center pulls telemetry from the Orbital Mesh.
                </p>
                {[
                  { id: 'realtime', label: 'Real-Time (Continuous)' },
                  { id: '5min', label: '5 Minute Interval' },
                  { id: '15min', label: '15 Minute Interval' },
                ].map(opt => (
                  <div key={opt.id} style={styles.radioRow} onClick={() => setSyncMode(opt.id)}>
                    <span className="mono" style={{ fontSize: '0.8rem' }}>{opt.label}</span>
                    <div style={styles.radio}>
                      {syncMode === opt.id && <div style={styles.radioActive} />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={styles.energyCard}>
                <span className="label" style={{ color: 'var(--amber)' }}>Energy Consumption</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>High Load</span>
                  <Zap size={24} color="var(--amber)" />
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Alert Thresholds */}
          <div className="card" style={styles.thresholdCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Bell size={18} color="var(--amber)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--cyan)', letterSpacing: 1 }}>
                Tactical Alert Thresholds
              </h3>
            </div>
            <div style={styles.thresholdGrid}>
              {[
                { id: 'class4', label: 'Class-4 Anomalies', desc: 'Immediate override of all active terminals when hurricane-force clusters are detected.' },
                { id: 'solar', label: 'Solar Interference', desc: 'Notification when ionosphere density exceeds 8.4 Mhz threshold.' },
                { id: 'civil', label: 'Civil Alerts', desc: 'Auto-broadcast weather safety protocols to connected ground-sector units.' },
              ].map(t => (
                <div key={t.id} style={styles.thresholdItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.label}</span>
                    <div
                      style={{ ...styles.toggle, ...(alerts[t.id] ? styles.toggleOn : {}) }}
                      onClick={() => setAlerts(p => ({ ...p, [t.id]: !p[t.id] }))}
                    >
                      <div style={{ ...styles.toggleThumb, ...(alerts[t.id] ? styles.toggleThumbOn : {}) }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={styles.footerActions}>
            <button style={styles.resetBtn}>Reset to Default</button>
            <button className="btn-accent" style={{ fontSize: '0.75rem', padding: '12px 28px' }}>Commit Changes</button>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  main: { flex: 1, padding: 24, overflow: 'auto' },
  header: { marginBottom: 28 },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: 2 },
  grid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 20 },
  calibrationCard: { padding: 28 },
  sliderRow: { marginBottom: 28 },
  slider: {
    width: '100%', height: 4, appearance: 'none', background: 'var(--border-color)',
    borderRadius: 2, outline: 'none', cursor: 'pointer',
    accentColor: 'var(--cyan)',
  },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  syncCard: { padding: 24, flex: 1 },
  radioRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 6,
    marginBottom: 8, cursor: 'pointer', transition: 'var(--transition)',
  },
  radio: {
    width: 18, height: 18, borderRadius: 3, border: '2px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { width: 10, height: 10, borderRadius: 2, background: 'var(--cyan)' },
  energyCard: { padding: 20 },
  thresholdCard: { padding: 28, marginBottom: 20 },
  thresholdGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 },
  thresholdItem: {},
  toggle: {
    width: 44, height: 24, borderRadius: 12, background: 'var(--bg-input)',
    border: '1px solid var(--border-color)', cursor: 'pointer', position: 'relative',
    transition: 'var(--transition)',
  },
  toggleOn: { background: 'rgba(0,229,255,0.2)', borderColor: 'var(--cyan)' },
  toggleThumb: {
    width: 18, height: 18, borderRadius: '50%', background: 'var(--text-dim)',
    position: 'absolute', top: 2, left: 2, transition: 'var(--transition)',
  },
  toggleThumbOn: { left: 22, background: 'var(--cyan)' },
  footerActions: {
    display: 'flex', justifyContent: 'flex-end', gap: 16,
    paddingTop: 16, borderTop: '1px solid var(--border-color)',
  },
  resetBtn: {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '12px 28px',
    background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 4,
    color: 'var(--text-secondary)', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
  },
};
