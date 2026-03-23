import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Suggestion({ text = '' }) {
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sparkles size={16} color="var(--amber)" />
        <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700 }}>AI Strategist:</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

const styles = {
  card: {
    padding: 16, background: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: 8,
  },
};
