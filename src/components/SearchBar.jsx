import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Compass, Satellite, AlertTriangle, Settings, HelpCircle, Shield, User } from 'lucide-react';

const menuItems = [
  { icon: Globe, label: 'Orbital Map', path: '/dashboard' },
  { icon: Compass, label: 'Atmospheric Data', path: '/atmospheric' },
  { icon: Satellite, label: 'Satellite Feed', path: '/satellite' },
  { icon: AlertTriangle, label: 'System Alerts', path: '/alerts' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Support', path: '/support' },
];

export default function Sidebar({ sector = 'Alpha-1', subtitle = 'Live Telemetry', showUser = false, userName = 'Com.Vaughn', userId = 'ID: 0892-X' }) {
  const location = useLocation();
  return (
    <aside style={styles.sidebar}>
      <div>
        <h3 style={styles.sectorTitle}>
          {subtitle === 'Command Center' ? 'Command Center' : `Sector ${sector}`}
        </h3>
        <span className="label" style={{ padding: '0 20px' }}>
          {subtitle === 'Command Center' ? `Sector ${sector}` : subtitle}
        </span>
        <nav style={styles.nav}>
          {menuItems.map(item => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path} style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}>
                {active && <div style={styles.activeBorder} />}
                <Icon size={18} color={active ? 'var(--cyan)' : 'var(--text-secondary)'} />
                <span style={{ color: active ? 'var(--cyan)' : 'var(--text-secondary)' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div>
        {bottomItems.map(item => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.path} style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}>
              {active && <div style={styles.activeBorder} />}
              <Icon size={18} color={active ? 'var(--cyan)' : 'var(--text-secondary)'} />
              <span style={{ color: active ? 'var(--cyan)' : 'var(--text-secondary)' }}>{item.label}</span>
            </Link>
          );
        })}
        {showUser ? (
          <div style={styles.userBox}>
            <Shield size={18} color="var(--cyan)" />
            <div>
              <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 700 }}>Commander</span>
              <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block' }}>{userId}</span>
            </div>
          </div>
        ) : (
          <div style={styles.statusBox}>
            <span className="status-dot active" />
            <div>
              <span className="mono" style={{ fontSize: '0.7rem' }}>System Status</span>
              <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--green)', display: 'block' }}>Optimal</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 210, minHeight: '100%', background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)', padding: '24px 0',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    flexShrink: 0,
  },
  sectorTitle: {
    fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--cyan)',
    padding: '0 20px', marginBottom: 4, letterSpacing: 1,
  },
  nav: { marginTop: 24, display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
    textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
    transition: 'var(--transition)', position: 'relative',
  },
  navItemActive: { background: 'rgba(0,229,255,0.06)' },
  activeBorder: {
    position: 'absolute', left: 0, top: '15%', bottom: '15%',
    width: 3, background: 'var(--cyan)', borderRadius: '0 2px 2px 0',
  },
  statusBox: {
    margin: '16px 16px 0', padding: '12px 16px',
    background: 'rgba(0,229,255,0.05)', borderRadius: 8,
    border: '1px solid rgba(0,229,255,0.1)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  userBox: {
    margin: '16px 16px 0', padding: '12px 16px',
    background: 'rgba(0,229,255,0.05)', borderRadius: 8,
    border: '1px solid rgba(0,229,255,0.1)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
};
