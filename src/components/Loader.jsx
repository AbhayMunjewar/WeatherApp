import React from 'react';

export default function Loader() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.ring}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="24" fill="none" stroke="var(--border-color)" strokeWidth="3" />
          <circle cx="30" cy="30" r="24" fill="none" stroke="var(--cyan)" strokeWidth="3"
            strokeDasharray="40 111" strokeLinecap="round"
            style={{ animation: 'rotate 1s linear infinite', transformOrigin: '30px 30px' }} />
        </svg>
      </div>
      <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 12 }}>
        Syncing Telemetry...
      </span>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  ring: {},
};
