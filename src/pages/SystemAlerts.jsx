import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SearchBar';
import { Zap, AlertTriangle, RefreshCw, Cpu, Shield, Monitor } from 'lucide-react';

const logEntries = [
  { time: '07:12:45', text: 'Connection established with Satellite LEO-45...', color: 'var(--text-dim)' },
  { time: '07:12:48', text: 'Decrypting atmosphere data packets (X-Band)...', color: 'var(--text-dim)' },
  { time: '07:13:02', text: 'WARNING: Particle flux exceeding safety threshold...', color: 'var(--amber)' },
  { time: '07:13:10', text: 'rerouting processing thread to secondary core alpha-7...', color: 'var(--text-dim)' },
];

export default function SystemAlerts() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar sector="7-G Alpha" subtitle="Command Center" showUser userId="ID: 0984-ALPHA" />
        <main style={styles.main}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.pageTitle}>System Alerts</h2>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Real-Time Anomaly Detection Grid</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={styles.counterBadge}>
                <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Active Threats</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>04</span>
              </div>
              <div style={{ ...styles.counterBadge, borderColor: 'var(--red)' }}>
                <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>System Critical</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--red)' }}>01</span>
              </div>
            </div>
          </div>

          {/* Critical Alert */}
          <div style={styles.criticalAlert} className="card">
            <div style={styles.alertRow}>
              <div style={styles.alertIcon}>
                <Zap size={24} color="var(--amber)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ ...styles.levelBadge, background: 'rgba(255,23,68,0.15)', color: 'var(--red)', borderColor: 'var(--red)' }}>Level 5 Critical</span>
                  <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>TS: 2024.05.21 // 04:12:09 UTC</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: 1, marginBottom: 8 }}>Geomagnetic Storm Detected</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  KP-Index surge at 8.7. Solar winds exceeding 750km/s. Ionospheric disruption imminent for sectors 4-A through 9-C. Satellite hardening protocols advised.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button style={{ ...styles.actionBtn, background: 'rgba(255,171,0,0.1)', color: 'var(--amber)', borderColor: 'var(--amber)' }}>
                  🔒 Quarantine
                </button>
                <button style={{ ...styles.actionBtn, borderColor: 'var(--cyan)' }}>Acknowledge</button>
              </div>
            </div>
          </div>

          {/* Environmental Alert + Sensor Status */}
          <div style={styles.midRow}>
            <div style={styles.envAlert} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ ...styles.alertIconSmall, background: 'rgba(0,229,255,0.08)' }}>
                  <AlertTriangle size={20} color="var(--cyan)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ ...styles.levelBadge, background: 'rgba(0,229,255,0.1)', color: 'var(--cyan)', borderColor: 'var(--cyan)' }}>Level 3 Environmental</span>
                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>TS: 05:44:12 UTC</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: 1, marginBottom: 6 }}>Satellite Sync Latency</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Sub-orbital sensor "ORION-9" reporting 450ms delay in packet transmission. Possible atmospheric interference in Sector 7-G.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  <button style={styles.smallBtn}>ⓘ</button>
                  <button style={{ ...styles.actionBtn, fontSize: '0.65rem', padding: '6px 14px' }}>Acknowledge</button>
                </div>
              </div>
            </div>

            <div className="card" style={styles.sensorCard}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: 1, marginBottom: 16 }}>Sensor Status</h4>
              <div style={styles.sensorRow}>
                <span className="mono" style={{ fontSize: '0.75rem' }}>ThermalGrid</span>
                <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--green)' }}>NOMINAL</span>
              </div>
              <div style={styles.sensorRow}>
                <span className="mono" style={{ fontSize: '0.75rem' }}>Barometric Array</span>
                <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>CALIBRATING</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="status-dot active" />
                <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Live Uplink Active</span>
              </div>
            </div>
          </div>

          {/* Info Alerts Row */}
          <div style={styles.infoRow}>
            <div className="card" style={styles.infoCard}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ ...styles.alertIconSmall, background: 'rgba(0,229,255,0.06)' }}>
                  <RefreshCw size={18} color="var(--text-secondary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ ...styles.levelBadge, background: 'rgba(0,229,255,0.06)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>System Info</span>
                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>TS: 06:12:45 UTC</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: 1, marginBottom: 4 }}>Firmware V.24.4 Push</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Scheduled patch for atmospheric modeling core. Downtime expected in 24 hours.</p>
                </div>
                <button style={{ ...styles.actionBtn, fontSize: '0.65rem', padding: '6px 14px' }}>Dismiss</button>
              </div>
            </div>

            <div className="card" style={styles.infoCard}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ ...styles.alertIconSmall, background: 'rgba(0,229,255,0.06)' }}>
                  <Cpu size={18} color="var(--text-secondary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ ...styles.levelBadge, background: 'rgba(255,171,0,0.08)', color: 'var(--amber)', borderColor: 'var(--amber)' }}>Hardware Maintenance</span>
                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>TS: 06:15:01 UTC</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: 1, marginBottom: 4 }}>Node 04 Reboot</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Autonomous reboot sequence completed for localized data processing hub.</p>
                </div>
                <button style={{ ...styles.actionBtn, fontSize: '0.65rem', padding: '6px 14px' }}>Dismiss</button>
              </div>
            </div>
          </div>

          {/* Live Command Log */}
          <div className="card" style={styles.logCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Monitor size={16} color="var(--cyan)" />
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--red)', letterSpacing: 1 }}>Live Command Log</h4>
            </div>
            <div style={styles.logBox}>
              {logEntries.map((entry, i) => (
                <p key={i} className="mono" style={{ fontSize: '0.7rem', color: entry.color, marginBottom: 6 }}>
                  <span style={{ color: 'var(--cyan)' }}>[{entry.time}]</span> {entry.text}
                </p>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Security Level: Emerald-Alpha</span>
            <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>System Status: Online</span>
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
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: 2, marginBottom: 4 },
  counterBadge: {
    padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: 6,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  },
  criticalAlert: { padding: 24, marginBottom: 16, borderColor: 'rgba(255,171,0,0.2)' },
  alertRow: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  alertIcon: {
    width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,171,0,0.08)', flexShrink: 0,
  },
  alertIconSmall: {
    width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  levelBadge: {
    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '3px 10px',
    borderRadius: 4, border: '1px solid', letterSpacing: 1, textTransform: 'uppercase',
  },
  actionBtn: {
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '8px 16px',
    background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 4,
    color: 'var(--text-primary)', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
    transition: 'var(--transition)',
  },
  smallBtn: {
    width: 32, height: 32, borderRadius: 4, background: 'var(--bg-input)',
    border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  midRow: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 },
  envAlert: { padding: 20 },
  sensorCard: { padding: 20 },
  sensorRow: {
    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  infoRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  infoCard: { padding: 20 },
  logCard: { padding: 20, marginBottom: 16 },
  logBox: { padding: 16, background: 'var(--bg-primary)', borderRadius: 6 },
  footer: {
    display: 'flex', justifyContent: 'space-between', padding: '12px 0',
    borderTop: '1px solid var(--border-color)',
  },
};
