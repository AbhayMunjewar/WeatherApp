import React, { useState, useEffect } from 'react';
import { fetchPollen } from '../api';

const getPollenDisplay = (value) => {
  const val = Number(value) || 1;
  switch (val) {
    case 1:
      return { label: "Low", text: "Good day to be outdoors", color: "#22c55e", emoji: "🟢" };
    case 2:
      return { label: "Moderate", text: "Sensitive individuals take care", color: "#eab308", emoji: "🟡" };
    case 3:
      return { label: "High", text: "Limit outdoor exposure", color: "#f97316", emoji: "🟠" };
    case 4:
      return { label: "Very High", text: "Stay indoors if possible", color: "#ef4444", emoji: "🔴" };
    case 5:
      return { label: "Extreme", text: "Avoid outdoors, take medication", color: "#a855f7", emoji: "🟣" };
    default:
      return { label: "Low", text: "Good day to be outdoors", color: "#22c55e", emoji: "🟢" };
  }
};

const PollenCard = ({ lat, lon }) => {
  const [pollenData, setPollenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lat === undefined || lat === null || lon === undefined || lon === null) {
      return;
    }

    let isMounted = true;
    const getPollenData = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await fetchPollen(lat, lon);
        if (isMounted) {
          setPollenData(data);
        }
      } catch (err) {
        console.warn("Google Pollen API failed to fetch:", err);
        if (isMounted) {
          setPollenData(null);
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getPollenData();
    return () => {
      isMounted = false;
    };
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="card skeleton" style={{ minHeight: '180px', borderRadius: '16px', padding: '20px' }}>
        <div style={{ height: '20px', width: '60%', background: '#334155', borderRadius: '4px', marginBottom: '15px' }} />
        <div style={{ height: '25px', width: '100%', background: '#334155', borderRadius: '4px', marginBottom: '10px' }} />
        <div style={{ height: '25px', width: '100%', background: '#334155', borderRadius: '4px', marginBottom: '10px' }} />
        <div style={{ height: '25px', width: '100%', background: '#334155', borderRadius: '4px' }} />
      </div>
    );
  }

  // Render subtle grey unavailable card if key missing, call failed, or pollenData is null
  if (error || !pollenData) {
    return (
      <div 
        className="card fade-in" 
        style={{ 
          backgroundColor: '#1e293b', 
          border: '1px solid #475569', 
          borderRadius: '16px', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '160px'
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
            alignSelf: 'flex-start',
            fontWeight: '600'
          }}
        >
          Pollen & Allergy Index
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>
          Pollen data unavailable for this region
        </p>
      </div>
    );
  }

  const dailyInfo = pollenData?.dailyInfo?.[0];
  const pollenTypeInfo = dailyInfo?.pollenTypeInfo || [];
  const healthRecommendations = dailyInfo?.healthRecommendations || [];
  const firstRecommendation = healthRecommendations[0];

  const getPollenItem = (typeKey) => {
    const item = pollenTypeInfo.find(
      t => t.pollenType?.toUpperCase() === typeKey || t.displayName?.toUpperCase() === typeKey
    );
    
    const value = item?.indexInfo?.value || 1;
    const category = item?.indexInfo?.category || 'Low';
    const display = getPollenDisplay(value);

    return { value, category, display };
  };

  const tree = getPollenItem('TREE');
  const grass = getPollenItem('GRASS');
  const weed = getPollenItem('WEED');

  const rows = [
    { label: "🌳 Tree Pollen", data: tree },
    { label: "🌾 Grass Pollen", data: grass },
    { label: "🌿 Weed Pollen", data: weed }
  ];

  return (
    <div 
      className="card fade-in" 
      style={{ 
        backgroundColor: '#1e293b', 
        border: '1px solid #334155', 
        borderRadius: '16px', 
        padding: '20px',
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
        Pollen & Allergy Index
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {rows.map((row, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: idx < 2 ? '1px solid #334155' : 'none',
              paddingBottom: idx < 2 ? '0.5rem' : '0'
            }}
          >
            <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '500' }}>
              {row.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span 
                style={{ 
                  backgroundColor: row.data.display.color, 
                  color: '#0f172a',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}
              >
                {row.data.category}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }} title={row.data.display.text}>
                {row.data.display.emoji}
              </span>
            </div>
          </div>
        ))}
      </div>

      {firstRecommendation && (
        <div 
          style={{ 
            marginTop: '1rem', 
            paddingTop: '0.75rem', 
            borderTop: '1px solid #334155',
            fontSize: '0.8rem', 
            color: '#94a3b8', 
            fontStyle: 'italic',
            lineHeight: '1.4'
          }}
        >
          💡 {firstRecommendation}
        </div>
      )}
    </div>
  );
};

export default PollenCard;
