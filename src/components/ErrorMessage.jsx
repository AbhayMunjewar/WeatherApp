import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message = 'Connection lost. Retrying uplink...' }) {
  return (
    <div style={styles.wrapper}>
      <AlertTriangle size={20} color="var(--red)" />
      <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--red)' }}>{message}</span>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
    background: 'rgba(255,23,68,0.06)', border: '1px solid rgba(255,23,68,0.2)',
    borderRadius: 6,
  },
};
