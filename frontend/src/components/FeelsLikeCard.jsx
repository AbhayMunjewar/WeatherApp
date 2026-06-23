import React from 'react';
import { Thermometer } from 'lucide-react';

const FeelsLikeCard = ({ currentTemp, feelsLikeTemp, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card skeleton" style={{ height: '140px' }}>
        <div style={{ height: '20px', width: '60%', background: '#334155' }} />
        <div style={{ height: '30px', width: '40%', background: '#334155', marginTop: '10px' }} />
        <div style={{ height: '30px', width: '80%', background: '#334155', marginTop: '10px' }} />
      </div>
    );
  }

  if (currentTemp === undefined || feelsLikeTemp === undefined) return null;

  const actual = Math.round(currentTemp);
  const feels = Math.round(feelsLikeTemp);
  const diff = feels - actual;

  let advice = "Feels the same as the actual temperature.";
  let description = "Dress normally for the current temperature.";

  if (diff > 1) {
    advice = "Feels hotter than actual temperature 🥵";
    description = "Higher humidity is making it feel warmer. Stay hydrated and wear breathable fabrics.";
  } else if (diff < -1) {
    advice = "Feels colder than actual temperature 🥶";
    description = "Wind chill is making it feel colder. Consider wearing a windbreaker or layering up.";
  }

  return (
    <div className="card fade-in">
      <div className="card-title">
        <Thermometer size={18} />
        <span>Feels Like</span>
      </div>
      <div>
        <div className="stat-highlight">
          {feels}°C
        </div>
        <p className="stat-description" style={{ marginTop: '0.25rem' }}>
          Actual: {actual}°C
        </p>
      </div>
      <div className="feels-like-diff-msg" style={{ marginTop: '0.25rem' }}>
        <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>{advice}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeelsLikeCard;
