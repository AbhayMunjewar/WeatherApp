import React from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import { formatUnixTime, getGoldenHourRange } from '../utils/formatTime';

const SunriseSunset = ({ sunrise, sunset, timezone, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card skeleton" style={{ height: '220px' }}>
        <div style={{ height: '20px', width: '60%', background: '#334155' }} />
        <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
          <div style={{ height: '40px', flex: 1, background: '#334155' }} />
          <div style={{ height: '40px', flex: 1, background: '#334155' }} />
        </div>
        <div style={{ height: '30px', width: '100%', background: '#334155', marginTop: '15px' }} />
        <div style={{ height: '40px', width: '100%', background: '#334155', marginTop: '15px' }} />
      </div>
    );
  }

  if (!sunrise || !sunset) return null;

  const sunriseStr = formatUnixTime(sunrise, timezone);
  const sunsetStr = formatUnixTime(sunset, timezone);
  const goldenHour = getGoldenHourRange(sunrise, sunset, timezone);

  // Calculate daylight percentage
  const nowUnix = Math.floor(Date.now() / 1000);
  let progressPct = 0;
  let label = '';
  
  if (nowUnix < sunrise) {
    progressPct = 0;
    label = 'Before sunrise 🌃';
  } else if (nowUnix > sunset) {
    progressPct = 100;
    label = 'After sunset 🌌';
  } else {
    progressPct = Math.min(100, Math.max(0, Math.round(((nowUnix - sunrise) / (sunset - sunrise)) * 100)));
    label = `${progressPct}% of daylight hours elapsed ☀️`;
  }

  return (
    <div className="card fade-in">
      <div className="card-title">
        <Sunrise size={18} />
        <span>Sun & Moon</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sunrise size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sunrise</div>
            <div style={{ fontSize: '1rem', fontWeight: '700' }}>{sunriseStr}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sunset size={24} color="#ec4899" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sunset</div>
            <div style={{ fontSize: '1rem', fontWeight: '700' }}>{sunsetStr}</div>
          </div>
        </div>
      </div>

      <div className="daylight-visual-container">
        <div 
          className="daylight-progress-bar" 
          style={{ width: `${progressPct}%` }}
        />
        <div className="daylight-text">{label}</div>
      </div>

      <div className="golden-hour-info">
        <div className="golden-hour-item">
          <span className="golden-hour-label">Morning Golden Hour:</span>
          <span className="golden-hour-val">{goldenHour.morning}</span>
        </div>
        <div className="golden-hour-item">
          <span className="golden-hour-label">Evening Golden Hour:</span>
          <span className="golden-hour-val">{goldenHour.evening}</span>
        </div>
      </div>
    </div>
  );
};

export default SunriseSunset;
