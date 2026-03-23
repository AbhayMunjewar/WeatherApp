import React from 'react';

export default function History({ items = [] }) {
  return (
    <div>
      <span className="label">Recent Coordinates</span>
      <div style={styles.tags}>
        {items.map(c => (
          <span key={c} style={styles.tag} className="mono">{c}</span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  tags: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  tag: {
    fontSize: '0.65rem', padding: '6px 12px', border: '1px solid var(--border-color)',
    borderRadius: 4, color: 'var(--text-secondary)', letterSpacing: 1, cursor: 'pointer',
    transition: 'var(--transition)',
  },
};
