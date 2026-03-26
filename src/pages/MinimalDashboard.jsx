import React, { useState, useEffect } from 'react';

const MinimalDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);

  useEffect(() => {
    // Simulate getting the user's location and loading weather
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Position:', position.coords);
        // Don't actually fetch yet - just test render
      }
    );
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#02040a',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1>Minimal Weather App Test</h1>
        <p>Weather Data: {weatherData ? 'Loaded' : 'Not loaded'}</p>
        <p>Air Quality: {airQuality ? 'Loaded' : 'Not loaded'}</p>
        <small>If you see this without errors, the render phase is working.</small>
      </div>
    </div>
  );
};

export default MinimalDashboard;
