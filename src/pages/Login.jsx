import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fingerprint, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [commanderId, setCommanderId] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Navigate to dashboard after login
    navigate('/dashboard');
  };

  return (
    <div style={styles.page} className="grid-bg">
      {/* Title */}
      <h1 style={styles.title}>
        O R B I T A L &nbsp; I N T E L
      </h1>
      <div style={styles.titleBar} />

      {/* Login Card */}
      <div style={styles.cardWrap}>
        <form onSubmit={handleLogin} style={styles.card} className="corner-frame">
          <div style={styles.cardHeader}>
            <span className="status-dot active" />
            <h3 style={styles.cardTitle}>Commander Authentication</h3>
          </div>

          <div style={styles.field}>
            <label className="label">Commander ID</label>
            <div className="input-group" style={{ marginTop: 8 }}>
              <Fingerprint className="input-icon" size={18} />
              <input
                type="text"
                className="input-field"
                placeholder="C-492-AX"
                value={commanderId}
                onChange={e => setCommanderId(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label className="label">Access Code</label>
            <div className="input-group" style={{ marginTop: 8 }}>
              <Shield className="input-icon" size={18} />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-accent" style={styles.submitBtn}>
            Initiate Uplink &nbsp;🚀
          </button>

          <a href="#" className="mono" style={styles.forgot}>Forgot Encryption Key</a>
          <p className="mono" style={styles.register}>
            New Commander? <Link to="/register" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Register</Link>
          </p>
        </form>
      </div>

      {/* Bottom info */}
      <div style={styles.bottomInfo}>
        <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
          Secure Protocol v.4 &nbsp;&nbsp; Encryption: AES-4096
        </span>
        <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
          Uplink Status: Standby
        </span>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: 2 }}>
          Orbital Command
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Protocol', 'Encryption', 'Support'].map(l => (
            <a key={l} href="#" className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
          © 2124 Celestial Sentinel | Orbital Command
        </span>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative',
  },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
    fontWeight: 700, color: 'var(--cyan)', letterSpacing: 8, marginBottom: 8,
  },
  titleBar: { width: 40, height: 3, background: 'var(--cyan)', borderRadius: 2, marginBottom: 48 },
  cardWrap: { width: '100%', maxWidth: 440 },
  card: {
    background: 'rgba(17, 24, 39, 0.9)', border: '1px solid var(--border-color)',
    borderRadius: 8, padding: '36px 32px', backdropFilter: 'blur(12px)',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: 2 },
  field: { marginBottom: 24 },
  submitBtn: { width: '100%', marginTop: 8, fontSize: '0.8rem' },
  forgot: {
    display: 'block', textAlign: 'center', marginTop: 24, fontSize: '0.7rem',
    color: 'var(--text-secondary)', textDecoration: 'none',
  },
  register: { textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--text-secondary)' },
  bottomInfo: {
    display: 'flex', gap: 60, marginTop: 48, padding: '0 24px',
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTop: '1px solid var(--border-color)', padding: '16px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
};
