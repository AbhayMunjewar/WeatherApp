import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Globe, Shield, Terminal, Satellite } from 'lucide-react';

export default function Home() {
  return (
    <div style={styles.page} className="grid-bg">
      <Navbar variant="landing" />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.statusBadge}>
          <span className="status-dot active" /> 
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>System Status: Synchronized</span>
        </div>
        <h1 style={styles.heroTitle}>
          Establish<br />
          <span style={{ color: 'var(--cyan)' }}>Orbital Link</span>
        </h1>
        <p style={styles.heroDesc}>
          Access high-fidelity atmospheric intelligence from the Celestial Sentinel network. 
          Real-time telemetry from 400km altitude. Global coverage, precision response.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <Link to="/login" className="btn-primary">
            Initialize Connection
          </Link>
          <Link to="/register" className="btn-primary" style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}>
            Register New Commander
          </Link>
        </div>

        {/* Orbital ring decoration */}
        <div style={styles.orbitalRing}>
          <div style={styles.ringInner} />
          <div style={styles.ringDot} />
        </div>
      </section>

      {/* Feature Cards */}
      <section style={styles.features}>
        <div style={styles.featureCard} className="card corner-frame">
          <div style={styles.featureHeader}>
            <span className="label">Targeting Vector</span>
            <Satellite size={18} color="var(--cyan)" />
          </div>
          <h3 style={styles.featureTitle}>Sector 7-G Atmospheric</h3>
          <div style={styles.globeContainer}>
            <div style={styles.globeVisual}>
              <Globe size={120} color="var(--cyan-dark)" strokeWidth={0.8} />
            </div>
          </div>
          <div style={styles.coords}>
            <div>
              <span className="label">Lat / Long</span>
              <p className="mono" style={{ fontSize: '0.8rem', marginTop: 4 }}>34.0522 N / 118.2437 W</p>
            </div>
            <div>
              <span className="label">Velocity</span>
              <p className="mono" style={{ fontSize: '0.8rem', marginTop: 4 }}>27,600 KM/H</p>
            </div>
          </div>
        </div>

        <div style={styles.rightFeatures}>
          <div className="card" style={styles.protocolCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Shield size={16} color="var(--green)" />
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--green)' }}>Security Protocol Active</span>
            </div>
            <div style={styles.terminalBox}>
              {[
                '> TLS 3.0 Encryption established.',
                '> Atmospheric density: 1.225 kg/m³',
                '> Solar flux indices normalized.',
                '> Waiting for user biometric signature...',
                '> ALERT: Ionospheric distortion detected in Sector 4',
                '> Rerouting uplinks via Lunar Relay Beta...',
              ].map((line, i) => (
                <p key={i} className="mono" style={{
                  fontSize: '0.7rem',
                  color: line.includes('ALERT') ? 'var(--amber)' : 'var(--text-dim)',
                  marginBottom: 6,
                  opacity: 0.6 + (i * 0.07),
                }}>{line}</p>
              ))}
            </div>
          </div>

          <div className="card" style={styles.terminalCard}>
            <span className="label">Access Node</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>TERMINAL_04</h3>
              <Terminal size={20} color="var(--cyan)" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: 2 }}>
            Orbital Command
          </span>
          <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            © 2124 Celestial Sentinel | Orbital Command
          </span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Protocol', 'Encryption', 'Support'].map(l => (
              <a key={l} href="#" className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' },
  hero: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 24px 60px', textAlign: 'center', position: 'relative',
  },
  statusBadge: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px',
    background: 'rgba(0,229,255,0.06)', borderRadius: 20, marginBottom: 32,
    border: '1px solid rgba(0,229,255,0.1)',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 900, lineHeight: 1.1, letterSpacing: 3, marginBottom: 24,
  },
  heroDesc: {
    fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'var(--text-secondary)',
    maxWidth: 560, lineHeight: 1.7,
  },
  orbitalRing: {
    position: 'absolute', width: 500, height: 500,
    border: '1px solid rgba(0,229,255,0.06)', borderRadius: '50%',
    top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  ringInner: {
    position: 'absolute', inset: 40,
    border: '1px solid rgba(0,229,255,0.04)', borderRadius: '50%',
  },
  ringDot: {
    position: 'absolute', width: 8, height: 8, borderRadius: '50%',
    background: 'var(--cyan)', top: 0, left: '50%', transform: 'translateX(-50%)',
    boxShadow: '0 0 12px var(--cyan)',
  },
  features: {
    maxWidth: 1100, margin: '0 auto 60px', padding: '0 24px',
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
  },
  featureCard: { padding: 28 },
  featureHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  featureTitle: { fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 24 },
  globeContainer: { display: 'flex', justifyContent: 'center', padding: '40px 0' },
  globeVisual: { opacity: 0.7 },
  coords: { display: 'flex', gap: 40, marginTop: 16 },
  rightFeatures: { display: 'flex', flexDirection: 'column', gap: 16 },
  protocolCard: { flex: 1, padding: 24 },
  terminalBox: { padding: 16, background: 'var(--bg-primary)', borderRadius: 6, minHeight: 160 },
  terminalCard: { padding: 20 },
  footer: { marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '20px 0' },
  footerInner: {
    maxWidth: 1100, margin: '0 auto', padding: '0 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
};
