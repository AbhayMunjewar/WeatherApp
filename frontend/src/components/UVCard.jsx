import React from 'react';
import { Sun } from 'lucide-react';
import { getUVDetails } from '../utils/uvHelpers';

const UVCard = ({ uvi, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card skeleton" style={{ height: '140px' }}>
        <div style={{ height: '20px', width: '60%', background: '#334155' }} />
        <div style={{ height: '30px', width: '40%', background: '#334155', marginTop: '10px' }} />
        <div style={{ height: '30px', width: '80%', background: '#334155', marginTop: '10px' }} />
      </div>
    );
  }

  if (uvi === undefined || uvi === null) return null;

  const details = getUVDetails(uvi);

  return (
    <div className="card fade-in">
      <div className="card-title">
        <Sun size={18} />
        <span>UV Index</span>
      </div>
      <div>
        <span className="stat-highlight">{uvi}</span>
        <span 
          className="stat-label-tag" 
          style={{ backgroundColor: details.color, color: '#0f172a' }}
        >
          {details.level}
        </span>
      </div>
      <p className="stat-description">
        {details.suggestion}
      </p>
    </div>
  );
};

export default UVCard;
