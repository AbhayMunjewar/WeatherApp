import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Settings, Rocket, Moon, Search, Radio, User } from 'lucide-react';

const landingLinks = [
  { label: 'Missions', path: '/dashboard' },
  { label: 'Sensors', path: '/atmospheric' },
  { label: 'Archive', path: '#' },
];

const dashboardLinks = [
  { label: 'Orbital Map', path: '/dashboard' },
  { label: 'Satellite Feed', path: '/satellite' },
  { label: 'Atmospheric Data', path: '/atmospheric' },
  { label: 'System Alerts', path: '/alerts' },
  { label: 'Settings', path: '/settings' },
  { label: 'Support', path: '/support' },
];

export default function Navbar({ variant = 'default' }) {
  const location = useLocation();
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

  if (variant === 'landing') {
    return (
      <nav style={styles.nav}>
        <div style={styles.inner}>
          <Link to="/" style={styles.logo}>Orbital Intel</Link>
          <div style={styles.links}>
            {landingLinks.map(l => (
              <Link key={l.label} to={l.path} style={{
                ...styles.link,
                ...(location.pathname === l.path ? styles.linkActive : {})
              }}>{l.label}</Link>
            ))}
          </div>
          <div style={styles.actions}>
            <Link to="/dashboard"><Globe size={18} color="var(--text-secondary)" /></Link>
            <Link to="/settings"><Settings size={18} color="var(--text-secondary)" /></Link>
            <Link to="/login" style={styles.launchBtn}>Launch Terminal</Link>
          </div>
        </div>
      </nav>
    );
  }

  // Default dashboard navbar — used on ALL dashboard pages
  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/dashboard" style={styles.logo}>Orbital Weather Command</Link>
        <div style={styles.links}>
          {dashboardLinks.map(l => (
            <Link key={l.label} to={l.path} style={{
              ...styles.link,
              ...(location.pathname === l.path ? styles.linkActive : {})
            }}>{l.label}</Link>
          ))}
        </div>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-dim)" />
          <input type="text" placeholder="Search Sector or Satellite..." style={styles.searchInput} />
        </div>
        <div style={styles.actions}>
          <span style={styles.time}>{time}</span>
          <Moon size={18} color="var(--cyan)" style={{ cursor: 'pointer' }} />
          <Radio size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
          <div style={styles.avatar}>
            <User size={16} color="var(--cyan)" />
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'rgba(10, 14, 23, 0.95)',
    borderBottom: '1px solid var(--border-color)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1600,
    margin: '0 auto',
    padding: '0 20px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.8rem',
    fontWeight: 800,
    color: 'var(--cyan)',
    textDecoration: 'none',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  links: { display: 'flex', gap: 4, marginLeft: 8, flexWrap: 'nowrap' },
  link: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.68rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    padding: '6px 10px',
    borderRadius: 4,
    transition: 'var(--transition)',
    whiteSpace: 'nowrap',
  },
  linkActive: {
    color: 'var(--cyan)',
    background: 'rgba(0,229,255,0.08)',
    borderBottom: '2px solid var(--cyan)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 6,
    padding: '6px 14px',
    marginLeft: 'auto',
    minWidth: 200,
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '1px',
    outline: 'none',
    width: '100%',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 14 },
  time: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--cyan)',
    letterSpacing: '1px',
    whiteSpace: 'nowrap',
  },
  launchBtn: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    padding: '8px 20px',
    border: '1px solid var(--cyan)',
    borderRadius: 4,
    color: 'var(--cyan)',
    textDecoration: 'none',
    transition: 'var(--transition)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1.5px solid var(--cyan)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
};
