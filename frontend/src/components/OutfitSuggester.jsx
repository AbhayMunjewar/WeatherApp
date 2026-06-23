import React from 'react';

const OutfitSuggester = ({ temp, pop = 0, condition = '' }) => {
  // If temp is undefined or null (e.g. while data is loading)
  if (temp === undefined || temp === null) {
    return (
      <div className="card skeleton" style={{ minHeight: '140px' }}>
        <div style={{ height: '20px', width: '50%', background: '#334155', borderRadius: '4px' }} />
        <div style={{ height: '30px', width: '70%', background: '#334155', borderRadius: '4px', margin: '20px auto' }} />
        <div style={{ height: '15px', width: '90%', background: '#334155', borderRadius: '4px', margin: '0 auto' }} />
      </div>
    );
  }

  let outfit = '';
  let tip = '';

  // Logic rules
  if (temp > 35) {
    outfit = "👕 Light clothing";
    tip = "Stay hydrated, avoid direct sun";
  } else if (temp > 28 && pop > 0.4) {
    outfit = "👕 Light clothes + 🌂 Umbrella";
    tip = "Humid and rainy";
  } else if (temp > 28) {
    outfit = "👕 Light clothing";
    tip = "Hot and clear";
  } else if (temp > 20 && pop > 0.4) {
    outfit = "🧥 Light jacket + 🌂 Umbrella";
    tip = "Cool and wet";
  } else if (temp > 20) {
    outfit = "🧥 Light jacket";
    tip = "Mild weather";
  } else if (temp > 10) {
    outfit = "🧣 Warm jacket + scarf";
    tip = "Getting cold";
  } else {
    outfit = "🧥 Heavy coat + 🧣 scarf + 🧤 gloves";
    tip = "Very cold outside";
  }

  // Background color shifts subtly:
  // blue tint for cold (< 10°C), orange tint for hot (> 30°C), neutral for in-between
  let cardBg = '#1e293b'; // neutral
  let borderHighlight = '#334155';
  
  if (temp < 10) {
    cardBg = '#1c263d'; // blue tint
    borderHighlight = '#2563eb';
  } else if (temp > 30) {
    cardBg = '#2d221e'; // orange tint
    borderHighlight = '#ea580c';
  }

  return (
    <div 
      className="card fade-in outfit-suggester-card" 
      style={{ 
        backgroundColor: cardBg,
        border: `1px solid ${borderHighlight}`,
        transition: 'background-color 0.5s ease, border-color 0.5s ease',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div 
        className="card-title" 
        style={{ 
          fontSize: '0.95rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#94a3b8',
          marginBottom: '1rem',
          fontWeight: '600'
        }}
      >
        What to Wear Today
      </div>
      
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.75rem',
          padding: '10px 0'
        }}
      >
        <span 
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#ffffff',
            display: 'block',
            lineHeight: '1.2'
          }}
        >
          {outfit}
        </span>
        <span 
          style={{ 
            fontSize: '0.85rem', 
            color: '#cbd5e1',
            fontWeight: '500'
          }}
        >
          {tip}
        </span>
      </div>
    </div>
  );
};

export default OutfitSuggester;
