import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, EyeOff, Eye, Zap, Shield, Globe, Info } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', sector: 'NEBULA-GAMA', email: '', password: '' });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = (e) => {
    e.preventDefault();
    // Navigate to login page after registration
    navigate('/login');
  };

  return (
    <div style={styles.page} className="grid-bg">
      <div style={styles.header}>
        <Shield size={20} color="var(--cyan)" />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--cyan)', letterSpacing: 3 }}>
          Orbital Intel
        </span>
      </div>

      <h1 style={styles.title}>Recruit New<br/>Commander</h1>
      <p className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 40, letterSpacing: 2 }}>
        Authorization Protocol: Phase Alpha-9
      </p>

      <div style={styles.cardWrap}>
        <form onSubmit={handleRegister} style={styles.card} className="corner-frame">
          <div style={styles.field}>
            <label className="label cyan">Full Name</label>
            <div className="input-group" style={{ marginTop: 8 }}>
              <User className="input-icon" size={18} />
              <input className="input-field" placeholder="Enter Operative Name" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label className="label cyan">Assigned Sector</label>
              <select className="select-field" style={{ marginTop: 8 }} value={form.sector} onChange={e => update('sector', e.target.value)}>
                <option>NEBULA-GAMA</option>
                <option>ALPHA-1</option>
                <option>SECTOR-7G</option>
                <option>OMEGA-PRIME</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label cyan">Email</label>
              <input className="input-field" style={{ marginTop: 8, paddingLeft: 16 }} placeholder="comms@orbital.int" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
          </div>

          <div style={styles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="label cyan">Create Access Code</label>
              <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>Encryption Level: High</span>
            </div>
            <div style={{ position: 'relative', marginTop: 8 }}>
              <input
                className="input-field"
                style={{ paddingLeft: 16, paddingRight: 48 }}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => update('password', e.target.value)}
              />
              <div style={styles.passToggle} onClick={() => setShowPass(!showPass)}>
                <span className="status-dot warning" style={{ width: 6, height: 6 }} />
                {showPass ? <Eye size={16} color="var(--text-secondary)" /> : <EyeOff size={16} color="var(--text-secondary)" />}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-accent" style={styles.submitBtn}>
            Enlist In Command &nbsp;<Zap size={16} />
          </button>

          <p className="mono" style={styles.loginLink}>
            Already Registered? <Link to="/login" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Terminal Login</Link>
          </p>

          <div style={styles.socialRow}>
            <Settings2Icon />
            <Globe size={18} color="var(--text-dim)" style={{ cursor: 'pointer' }} />
            <Info size={18} color="var(--cyan)" style={{ cursor: 'pointer' }} />
          </div>
        </form>
      </div>

      {/* Status bar */}
      <div style={styles.statusBar}>
        <span><span className="status-dot active" /> <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>Uplink Stable</span></span>
        <span><span className="status-dot active" /> <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>Secure Channel</span></span>
        <span><span className="status-dot active" /> <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>ID Verified</span></span>
      </div>

      <footer style={styles.footer}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: 2 }}>Orbital Intel</span>
        <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>© 2124 Celestial Sentinel | Orbital Command</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Protocol', 'Encryption', 'Support'].map(l => (
            <a key={l} href="#" className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function Settings2Icon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '40px 24px', position: 'relative',
  },
  header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)',
    fontWeight: 900, textAlign: 'center', lineHeight: 1.1, letterSpacing: 3, marginBottom: 12,
  },
  cardWrap: { width: '100%', maxWidth: 520 },
  card: {
    background: 'rgba(17, 24, 39, 0.9)', border: '1px solid var(--border-color)',
    borderRadius: 8, padding: '36px 32px', backdropFilter: 'blur(12px)',
  },
  field: { marginBottom: 24 },
  row: { display: 'flex', gap: 16, marginBottom: 24 },
  passToggle: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
  },
  submitBtn: { width: '100%', marginTop: 8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loginLink: { textAlign: 'center', marginTop: 24, fontSize: '0.75rem', color: 'var(--text-secondary)' },
  socialRow: { display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20 },
  statusBar: { display: 'flex', gap: 32, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTop: '1px solid var(--border-color)', padding: '16px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
};
