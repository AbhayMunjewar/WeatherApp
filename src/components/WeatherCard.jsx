import React from 'react';
import { CloudSnow, Cloud, Sun, CloudRain } from 'lucide-react';

const iconMap = { snow: CloudSnow, cloud: Cloud, sun: Sun, rain: CloudRain };

export default function WeatherCard({ city = 'Reykjavik', temp = -4, condition = 'Heavy Arctic Pulse', icon = 'snow' }) {
  const Icon = iconMap[icon] || Cloud;
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <span className="label">Live Telemetry:</span>
          <p className="mono" style={{ fontSize: '0.8rem', marginTop: 2 }}>{city}</p>
        </div>
        <Icon size={24} color="var(--cyan)" />
      </div>
      <div style={styles.temp}>{temp}°</div>
      <p className="mono" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{condition}</p>
    </div>
  );
}

const styles = {
  card: {
    padding: 20, background: 'linear-gradient(135deg, rgba(0,229,255,0.08), var(--bg-card))',
    border: '1px solid rgba(0,229,255,0.15)', borderRadius: 8,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  temp: {
    fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 900,
    color: 'var(--cyan)', lineHeight: 1, margin: '8px 0 12px',
  },
};
