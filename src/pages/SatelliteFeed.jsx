import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SearchBar';
import { Signal, ZoomIn, ZoomOut, Maximize2, Radio, AlertTriangle } from 'lucide-react';

export default function SatelliteFeed() {
  const [countdown, setCountdown] = useState({ h: 0, m: 42, s: 12 });

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar sector="7-G Alpha" subtitle="Command Center" />
        <main style={styles.main}>
          <div style={styles.content}>
            {/* Left Info Panel */}
            <div style={styles.leftPanel}>
              <div className="card" style={styles.uplinkCard}>
                <span className="label">Active Uplink</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span className="status-dot active" />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>S-FEED</span>
                </div>
                <span className="mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, display: 'block' }}>0942</span>
              </div>

              <div className="card" style={styles.signalCard}>
                <span className="label">Signal Strength</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--cyan)' }}>98%</span>
                  <Signal size={22} color="var(--cyan)" />
                </div>
                <div style={{ marginTop: 12 }}>
                  <span className="label">Sync Latency</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, display: 'block', marginTop: 4 }}>12.4 MS</span>
                </div>
              </div>

              <div className="card" style={styles.telemetryCard}>
                <span className="label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Atmospheric Telemetry</span>
                {[
                  { label: 'Altitude', value: '422 KM' },
                  { label: 'Velocity', value: '7.66 KM/S' },
                  { label: 'Declination', value: '+14.2°' },
                ].map(item => (
                  <div key={item.label} style={styles.telemetryRow}>
                    <span className="label">{item.label}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center - Live Feed */}
            <div style={styles.centerPanel}>
              <div style={styles.feedContainer} className="card">
                <div style={styles.feedHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Radio size={14} color="var(--cyan)" />
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                      Live Satellite Feed :: Sector Alpha-9
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={styles.badge}>Recording</span>
                    <span style={{ ...styles.badge, background: 'rgba(0,229,255,0.15)', color: 'var(--cyan)' }}>Active</span>
                  </div>
                </div>
                <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', display: 'block', marginBottom: 12 }}>
                  Coord: 45.3221° N, 122.6765° W
                </span>

                {/* Simulated satellite view */}
                <div style={styles.feedView}>
                  <div style={styles.feedOverlay}>
                    <div style={styles.scanLine} />
                  </div>
                  <div style={styles.earthGradient}>
                    <div style={styles.cityLights} />
                    <div style={styles.atmosphere} />
                  </div>
                  <div style={styles.feedGrid} />
                  <div style={styles.crosshair}>
                    <div style={styles.crossH} />
                    <div style={styles.crossV} />
                  </div>
                </div>

                <div style={styles.feedControls}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.controlBtn}><ZoomIn size={16} color="var(--cyan)" /></button>
                    <button style={styles.controlBtn}><ZoomOut size={16} color="var(--cyan)" /></button>
                    <button style={styles.controlBtn}><Maximize2 size={16} color="var(--cyan)" /></button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                      <span className="label">Time to Intercept</span>
                      <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, display: 'block', marginTop: 2 }}>
                        {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
                      </span>
                    </div>
                    <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.7rem' }}>Manual Override</button>
                  </div>
                </div>
              </div>

              {/* Intel Cards */}
              <div style={styles.intelRow}>
                <div style={styles.intelCard} className="card">
                  <div style={styles.intelThumb}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a3a5c, #0d2137)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🌡️</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: 1, marginBottom: 6 }}>Infrared Array</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Detecting thermal variance in Sector Beta. Cold front intensifying at +2.4C/hr.
                    </p>
                  </div>
                </div>

                <div style={styles.intelCard} className="card">
                  <div style={styles.intelThumb}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a2a3c, #0d1a27)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🌀</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--amber)', letterSpacing: 1, marginBottom: 6 }}>Storm Watch</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Vortex Alpha-7 showing high-speed rotation. Alert protocol: STAGE 2.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Other Sectors */}
            <div style={styles.rightPanel}>
              <span className="label">Other Sectors</span>
              {[
                { name: 'Alpha', status: 'Optimal', statusColor: 'var(--green)', bg: 'linear-gradient(135deg, #0d2a3f, #1a3d5c)' },
                { name: 'Beta', status: 'Volatile', statusColor: 'var(--amber)', bg: 'linear-gradient(135deg, #1a2030, #2a3040)' },
                { name: 'Gamma', status: 'Offline', statusColor: 'var(--text-dim)', bg: 'linear-gradient(135deg, #151515, #1a1a1a)' },
              ].map(s => (
                <div key={s.name} className="card" style={{ padding: 0, marginTop: 10, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ height: 80, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {s.name === 'Gamma' ? (
                      <span style={{ fontSize: '2rem', opacity: 0.3 }}>〰️</span>
                    ) : (
                      <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>{s.name === 'Alpha' ? '🌍' : '🛰️'}</span>
                    )}
                    <div style={{ position: 'absolute', top: 8, left: 10, right: 10, display: 'flex', justifyContent: 'space-between' }}>
                      <span className="mono" style={{ fontSize: '0.6rem', fontWeight: 700 }}>{s.name.toUpperCase()}</span>
                      <span className="mono" style={{ fontSize: '0.55rem', color: 'var(--cyan)' }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="label">Stability</span>
                    <span className="mono" style={{ fontSize: '0.65rem', color: s.statusColor, fontWeight: 600 }}>{s.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
              <button className="btn-primary" style={{ width: '100%', marginTop: 16, padding: '10px', fontSize: '0.7rem' }}>
                Expand All Feeds
              </button>
            </div>
          </div>

          {/* Footer Status Bar */}
          <div style={styles.footer}>
            <div style={{ display: 'flex', gap: 24 }}>
              <span><span className="status-dot active" /> <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>System Health: Normal</span></span>
              <span><span className="status-dot warning" /> <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Storage: 88% Full</span></span>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Encryption: AES-512 Secure</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--cyan)', padding: '4px 12px', border: '1px solid var(--cyan)', borderRadius: 4 }}>
                T-Zero: {new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' })} UTC
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content: { flex: 1, display: 'flex', padding: 16, gap: 16 },
  leftPanel: { width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  uplinkCard: { padding: 16 },
  signalCard: { padding: 16 },
  telemetryCard: { padding: 16 },
  telemetryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  centerPanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16 },
  feedContainer: { padding: 16, flex: 1 },
  feedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  badge: {
    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '3px 10px',
    borderRadius: 4, background: 'rgba(255,23,68,0.15)', color: 'var(--red)',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  feedView: {
    height: 220, background: 'linear-gradient(180deg, #030810 0%, #0a1628 30%, #0d2040 60%, #1a3a5c 85%, #2a5a7c 100%)',
    borderRadius: 6, position: 'relative', overflow: 'hidden',
  },
  feedOverlay: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    background: 'rgba(0,229,255,0.15)', top: '50%',
    boxShadow: '0 0 20px rgba(0,229,255,0.1)',
  },
  earthGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  cityLights: {
    position: 'absolute', bottom: '20%', left: '30%', width: '40%', height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(255,200,100,0.4), rgba(255,200,100,0.6), rgba(255,200,100,0.3), transparent)',
  },
  atmosphere: {
    position: 'absolute', bottom: '55%', left: 0, right: 0, height: 3,
    background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.2), rgba(0,229,255,0.3), rgba(0,229,255,0.2), transparent)',
  },
  feedGrid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
  },
  crosshair: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
  crossH: { width: 40, height: 1, background: 'rgba(0,229,255,0.3)', position: 'absolute', top: 0, left: -20 },
  crossV: { width: 1, height: 40, background: 'rgba(0,229,255,0.3)', position: 'absolute', left: 0, top: -20 },
  feedControls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  controlBtn: {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 4, cursor: 'pointer',
  },
  intelRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  intelCard: { display: 'flex', gap: 12, padding: 12 },
  intelThumb: { width: 80, height: 70, borderRadius: 6, overflow: 'hidden', flexShrink: 0 },
  rightPanel: { width: 160, flexShrink: 0 },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px',
    borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
  },
};
