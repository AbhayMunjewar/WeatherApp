import React from 'react';
import { Thermometer, Wind, Droplets, Gauge, Eye, Navigation } from 'lucide-react';

const getWindDirection = (deg) => {
  if (deg === undefined || deg === null) return '';
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
};

const CurrentWeather = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card skeleton" style={{ height: '380px' }}>
        <div style={{ height: '20px', width: '50%', background: '#334155' }} />
        <div style={{ height: '60px', width: '80%', background: '#334155', margin: '20px auto' }} />
        <div style={{ height: '20px', width: '40%', background: '#334155', margin: '0 auto' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
          <div style={{ height: '40px', background: '#334155' }} />
          <div style={{ height: '40px', background: '#334155' }} />
          <div style={{ height: '40px', background: '#334155' }} />
          <div style={{ height: '40px', background: '#334155' }} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const temp = Math.round(data.main?.temp);
  const condition = data.weather?.[0]?.description || 'N/A';
  const iconCode = data.weather?.[0]?.icon || '01d';
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const windSpeedKmh = data.wind?.speed ? (data.wind.speed * 3.6).toFixed(1) : '0';
  const windDir = getWindDirection(data.wind?.deg);
  const humidity = data.main?.humidity || 0;
  const pressure = data.main?.pressure || 0;
  const visibilityKm = data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A';
  const cityName = data.name;
  const country = data.sys?.country;

  // Format current local time (adjusted by weather offset)
  const formatCityLocalTime = () => {
    const localTime = new Date();
    // Use target location timezone offset in ms
    const offsetMs = (data.timezone ?? 0) * 1000;
    // local date object in UTC shifted by offset
    const utcTime = localTime.getTime() + (localTime.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + offsetMs);
    
    return targetTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="card fade-in">
      <div className="card-title">
        <Thermometer size={18} />
        <span>Current Weather</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', textAlign: 'center' }}>
          {cityName}{country ? `, ${country}` : ''}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Local Time: {formatCityLocalTime()}
        </p>
      </div>

      <div className="current-main">
        <div className="current-temp-wrapper">
          <span className="current-temp">{temp}</span>
          <span className="temp-unit">°C</span>
        </div>
        <img src={iconUrl} alt={condition} className="current-icon" />
        <p className="current-condition">{condition}</p>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <Wind size={18} className="detail-icon" />
          <div className="detail-info">
            <span className="detail-label">Wind</span>
            <span className="detail-value">{windSpeedKmh} km/h {windDir}</span>
          </div>
        </div>

        <div className="detail-item">
          <Droplets size={18} className="detail-icon" />
          <div className="detail-info">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{humidity}%</span>
          </div>
        </div>

        <div className="detail-item">
          <Gauge size={18} className="detail-icon" />
          <div className="detail-info">
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{pressure} hPa</span>
          </div>
        </div>

        <div className="detail-item">
          <Eye size={18} className="detail-icon" />
          <div className="detail-info">
            <span className="detail-label">Visibility</span>
            <span className="detail-value">{visibilityKm} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
