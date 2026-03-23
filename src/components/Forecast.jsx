import React from 'react';

export default function Forecast({ forecast = [] }) {
  return (
    <div>
      <span className="label">5-Day Orbital Projection</span>
      <div style={styles.list}>
        {forecast.map(f => (
          <div key={f.day} style={styles.item}>
            <span className="mono" style={{ fontSize: '0.7rem', width: 60 }}>{f.day}</span>
            <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
            <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>{f.high}</span>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{f.low}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 },
  item: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6,
  },
};
