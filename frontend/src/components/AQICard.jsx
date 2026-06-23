import React from 'react';
import { Wind } from 'lucide-react';
import { getAQIDetails } from '../utils/aqiHelpers';

const AQICard = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card skeleton" style={{ height: '140px' }}>
        <div style={{ height: '20px', width: '60%', background: '#334155' }} />
        <div style={{ height: '30px', width: '40%', background: '#334155', marginTop: '10px' }} />
        <div style={{ height: '30px', width: '80%', background: '#334155', marginTop: '10px' }} />
      </div>
    );
  }

  if (!data || !data.list || data.list.length === 0) return null;

  const aqiVal = data.list[0].main?.aqi || 1;
  const pm2_5 = data.list[0].components?.pm2_5 || 0;
  const pm10 = data.list[0].components?.pm10 || 0;
  const details = getAQIDetails(aqiVal);

  return (
    <div className="card fade-in">
      <div className="card-title">
        <Wind size={18} />
        <span>Air Quality Index</span>
      </div>
      <div>
        <span className="stat-highlight">{aqiVal}</span>
        <span 
          className="stat-label-tag" 
          style={{ backgroundColor: details.color, color: '#0f172a' }}
        >
          {details.label}
        </span>
      </div>
      
      <p className="stat-description" style={{ marginBottom: '0.5rem' }}>
        {details.desc}
      </p>

      <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>PM2.5:</span>{' '}
          <strong style={{ color: pm2_5 > 25 ? '#ef4444' : 'var(--text-primary)' }}>
            {pm2_5.toFixed(1)} μg/m³
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>PM10:</span>{' '}
          <strong style={{ color: pm10 > 50 ? '#ef4444' : 'var(--text-primary)' }}>
            {pm10.toFixed(1)} μg/m³
          </strong>
        </div>
      </div>
    </div>
  );
};

export default AQICard;
