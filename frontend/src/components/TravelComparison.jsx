import React, { useState } from 'react';
import { fetchWeather } from '../api';

const flag = (code) => {
  if (!code) return '';
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
  } catch (e) {
    return '';
  }
};

const TravelComparison = () => {
  const [cityA, setCityA] = useState('');
  const [cityB, setCityB] = useState('');
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [errorA, setErrorA] = useState('');
  const [errorB, setErrorB] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompare = async (e) => {
    e.preventDefault();
    setErrorA('');
    setErrorB('');
    setGeneralError('');
    
    if (!cityA.trim() || !cityB.trim()) {
      setGeneralError('Please enter both city names.');
      return;
    }

    setLoading(true);
    let resA = null;
    let resB = null;
    let hasFailed = false;

    await Promise.all([
      (async () => {
        try {
          resA = await fetchWeather(cityA.trim());
        } catch (err) {
          setErrorA('City not found — try a different name');
          hasFailed = true;
        }
      })(),
      (async () => {
        try {
          resB = await fetchWeather(cityB.trim());
        } catch (err) {
          setErrorB('City not found — try a different name');
          hasFailed = true;
        }
      })()
    ]);

    if (hasFailed) {
      if (!resA && !resB) {
        setGeneralError('Unable to compare. Check city names.');
      }
      setResultA(null);
      setResultB(null);
    } else {
      setResultA(resA);
      setResultB(resB);
    }
    setLoading(false);
  };

  // Highlights computation
  const highlights = React.useMemo(() => {
    if (!resultA || !resultB) return null;

    const list = [];
    
    // Temp Highlight
    const tempA = resultA.main?.temp;
    const tempB = resultB.main?.temp;
    if (tempA !== undefined && tempB !== undefined) {
      const diff = Math.abs(tempA - tempB).toFixed(1);
      if (tempA > tempB) {
        list.push(`🌡️ ${resultA.name} is ${diff}°C warmer than ${resultB.name}`);
      } else if (tempB > tempA) {
        list.push(`🌡️ ${resultB.name} is ${diff}°C warmer than ${resultA.name}`);
      } else {
        list.push(`🌡️ Both cities have the same temperature (${Math.round(tempA)}°C)`);
      }
    }

    // Humidity Highlight
    const humA = resultA.main?.humidity;
    const humB = resultB.main?.humidity;
    if (humA !== undefined && humB !== undefined) {
      if (Math.abs(humA - humB) <= 5) {
        list.push(`💧 Similar humidity`);
      } else if (humA > humB) {
        list.push(`💧 ${resultA.name} is more humid (${humA}% vs ${humB}%)`);
      } else {
        list.push(`💧 ${resultB.name} is more humid (${humB}% vs ${humA}%)`);
      }
    }

    // Wind Highlight
    const windA = resultA.wind?.speed;
    const windB = resultB.wind?.speed;
    if (windA !== undefined && windB !== undefined) {
      const speedA = (windA * 3.6).toFixed(1);
      const speedB = (windB * 3.6).toFixed(1);
      if (windA > windB) {
        list.push(`🌬️ ${resultA.name} has stronger winds (${speedA} km/h vs ${speedB} km/h)`);
      } else if (windB > windA) {
        list.push(`🌬️ ${resultB.name} has stronger winds (${speedB} km/h vs ${speedA} km/h)`);
      } else {
        list.push(`🌬️ Both cities have similar wind speeds`);
      }
    }

    // Rain / Umbrella Check
    const checkRain = (res) => {
      const main = res.weather?.[0]?.main?.toLowerCase() || '';
      const desc = res.weather?.[0]?.description?.toLowerCase() || '';
      return main.includes('rain') || main.includes('drizzle') || main.includes('thunderstorm') || desc.includes('rain');
    };
    const rainA = checkRain(resultA);
    const rainB = checkRain(resultB);
    if (rainA && !rainB) {
      list.push(`🌂 Bring an umbrella for ${resultA.name}`);
    } else if (rainB && !rainA) {
      list.push(`🌂 Bring an umbrella for ${resultB.name}`);
    } else if (rainA && rainB) {
      list.push(`🌂 Bring an umbrella for both cities`);
    }

    return list;
  }, [resultA, resultB]);

  return (
    <section 
      className="card fade-in" 
      style={{ 
        backgroundColor: '#1e293b', 
        border: '1px solid #334155', 
        borderRadius: '16px', 
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '100%',
        marginTop: '1.5rem'
      }}
    >
      <div 
        className="card-title" 
        style={{ 
          fontSize: '1.1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#94a3b8',
          marginBottom: '1.25rem',
          fontWeight: '700'
        }}
      >
        🗺️ Compare Two Cities
      </div>

      {/* Compare Inputs Form */}
      <form onSubmit={handleCompare} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Enter City A..."
              className="search-input"
              value={cityA}
              onChange={(e) => setCityA(e.target.value)}
              disabled={loading}
              style={{ width: '100%' }}
            />
            {errorA && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '500' }}>
                {errorA}
              </p>
            )}
          </div>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Enter City B..."
              className="search-input"
              value={cityB}
              onChange={(e) => setCityB(e.target.value)}
              disabled={loading}
              style={{ width: '100%' }}
            />
            {errorB && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '500' }}>
                {errorB}
              </p>
            )}
          </div>
        </div>

        {generalError && (
          <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', fontWeight: '600' }}>
            {generalError}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '160px', alignSelf: 'center' }}
          disabled={loading}
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {/* Results Rendering */}
      {resultA && resultB && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
            {/* Card A */}
            <div 
              style={{ 
                flex: '1 1 280px', 
                backgroundColor: '#0f172a', 
                border: '1px solid #334155', 
                borderRadius: '12px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {resultA.name} {flag(resultA.sys?.country)}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                {resultA.weather?.[0]?.description}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#ffffff' }}>
                  {Math.round(resultA.main?.temp)}°C
                </span>
                <img 
                  src={`https://openweathermap.org/img/wn/${resultA.weather?.[0]?.icon || '01d'}@2x.png`} 
                  alt="weather icon" 
                  style={{ width: '60px', height: '60px' }}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p>Feels Like: <strong style={{ color: '#ffffff' }}>{Math.round(resultA.main?.feels_like)}°C</strong></p>
                <p>Humidity: <strong style={{ color: '#ffffff' }}>{resultA.main?.humidity}%</strong></p>
                <p>Wind Speed: <strong style={{ color: '#ffffff' }}>{(resultA.wind?.speed * 3.6).toFixed(1)} km/h</strong></p>
              </div>
            </div>

            {/* Card B */}
            <div 
              style={{ 
                flex: '1 1 280px', 
                backgroundColor: '#0f172a', 
                border: '1px solid #334155', 
                borderRadius: '12px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {resultB.name} {flag(resultB.sys?.country)}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                {resultB.weather?.[0]?.description}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#ffffff' }}>
                  {Math.round(resultB.main?.temp)}°C
                </span>
                <img 
                  src={`https://openweathermap.org/img/wn/${resultB.weather?.[0]?.icon || '01d'}@2x.png`} 
                  alt="weather icon" 
                  style={{ width: '60px', height: '60px' }}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p>Feels Like: <strong style={{ color: '#ffffff' }}>{Math.round(resultB.main?.feels_like)}°C</strong></p>
                <p>Humidity: <strong style={{ color: '#ffffff' }}>{resultB.main?.humidity}%</strong></p>
                <p>Wind Speed: <strong style={{ color: '#ffffff' }}>{(resultB.wind?.speed * 3.6).toFixed(1)} km/h</strong></p>
              </div>
            </div>
          </div>

          {/* Highlights Feed */}
          {highlights && highlights.length > 0 && (
            <div 
              style={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #334155', 
                borderRadius: '12px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <h4 style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                ⚡ Comparison Highlights
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                {highlights.map((highlight, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TravelComparison;
