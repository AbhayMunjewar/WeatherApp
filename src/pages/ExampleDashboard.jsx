import React, { useState, useEffect } from 'react';
import {
  CitySearchWithSuggestions,
  WeatherBackground,
  WeatherAIQuestionBox,
  WeatherSkeleton,
  LoadingSpinner
} from '../components';

/**
 * EXAMPLE: How to integrate all new weather enhancement features
 * 
 * This shows a minimal setup with all features working together.
 * You can adapt this to your existing Dashboard.jsx
 */

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const WeatherDashboardWithEnhancements = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDaytime, setIsDaytime] = useState(true);

  // Detect if current time is between sunrise and sunset
  useEffect(() => {
    if (weatherData?.sys?.sunrise && weatherData?.sys?.sunset) {
      const now = Date.now();
      const sunriseTime = weatherData.sys.sunrise * 1000;
      const sunsetTime = weatherData.sys.sunset * 1000;
      setIsDaytime(now > sunriseTime && now < sunsetTime);
    }
  }, [weatherData]);

  // Fetch current weather
  const fetchWeatherData = async (cityName, latitude = null, longitude = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let url;
      
      // Use coordinates if provided, otherwise use city name
      if (latitude && longitude) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('City not found. Please try another search.');
      }

      const data = await response.json();
      setWeatherData(data);

      // Fetch forecast for the same location
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastDataRaw = await forecastResponse.json();
      
      // Get one item per day (around noon)
      const dailyForecast = forecastDataRaw.list.filter(item => 
        item.dt_txt.includes('12:00:00')
      );
      setForecastData(dailyForecast);

    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle city selection from search suggestions
  const handleCitySelect = (cityName, latitude = null, longitude = null) => {
    if (latitude && longitude) {
      // Use coordinates if available (from suggestions)
      fetchWeatherData(cityName, latitude, longitude);
    } else {
      // Use city name
      fetchWeatherData(cityName);
    }
  };

  // Get weather condition for background
  const weatherCondition = weatherData?.weather?.[0]?.main;
  const isRaining = weatherCondition?.toLowerCase().includes('rain');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#02040a',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Background Based on Weather */}
      <WeatherBackground 
        weatherCondition={weatherCondition}
        isDaytime={isDaytime}
        isRaining={isRaining}
      />

      {/* Main Content */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem'
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '2rem'
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}
          >
            Weather Forecast
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '1rem'
            }}
          >
            Check weather conditions and get AI-powered recommendations
          </p>
        </div>

        {/* Search Bar Section */}
        <div
          style={{
            marginBottom: '2rem',
            maxWidth: '600px'
          }}
        >
          <CitySearchWithSuggestions
            onCitySelect={handleCitySelect}
            isLoading={loading}
            API_KEY={API_KEY}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: '0.75rem',
              padding: '1rem',
              color: '#fecaca',
              marginBottom: '2rem'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <WeatherSkeleton />
        ) : weatherData ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '2rem'
            }}
          >
            {/* Weather Display */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '1rem',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                padding: '2rem'
              }}
            >
              <h2
                style={{
                  fontSize: '2rem',
                  marginBottom: '1rem'
                }}
              >
                {weatherData.name}, {weatherData.sys?.country}
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '3.5rem',
                      fontWeight: '700',
                      color: '#a78bfa'
                    }}
                  >
                    {Math.round(weatherData.main?.temp)}°C
                  </div>
                  <p
                    style={{
                      fontSize: '1.25rem',
                      color: '#cbd5e1',
                      margin: '0.5rem 0 0 0'
                    }}
                  >
                    {weatherData.weather?.[0]?.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        fontWeight: '700',
                        marginBottom: '0.25rem'
                      }}
                    >
                      HUMIDITY
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                      {weatherData.main?.humidity}%
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        fontWeight: '700',
                        marginBottom: '0.25rem'
                      }}
                    >
                      WIND SPEED
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                      {weatherData.wind?.speed?.toFixed(1)} m/s
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        fontWeight: '700',
                        marginBottom: '0.25rem'
                      }}
                    >
                      FEELS LIKE
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                      {Math.round(weatherData.main?.feels_like)}°C
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        fontWeight: '700',
                        marginBottom: '0.25rem'
                      }}
                    >
                      PRESSURE
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                      {weatherData.main?.pressure} hPa
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Question Box */}
            <div>
              <WeatherAIQuestionBox
                weatherData={weatherData}
                forecastData={forecastData}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#64748b'
            }}
          >
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              🌍 Search for a city to see its weather
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Use the search bar above to find weather conditions for any location
            </p>
          </div>
        )}

        {/* Forecast Section */}
        {forecastData.length > 0 && (
          <div
            style={{
              marginTop: '3rem'
            }}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1.5rem'
              }}
            >
              5-Day Forecast
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
              }}
            >
              {forecastData.map((day, index) => {
                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(15, 23, 42, 0.4)',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      padding: '1.25rem',
                      textAlign: 'center'
                    }}
                  >
                    <p
                      style={{
                        color: '#a78bfa',
                        fontWeight: '600',
                        marginBottom: '0.75rem'
                      }}
                    >
                      {dayName}
                    </p>
                    <p
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {Math.round(day.main?.temp)}°
                    </p>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: '#94a3b8',
                        marginBottom: '0.75rem'
                      }}
                    >
                      {day.weather?.[0]?.description}
                    </p>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        display: 'flex',
                        justifyContent: 'space-around'
                      }}
                    >
                      <span>💧 {day.main?.humidity}%</span>
                      <span>💨 {day.wind?.speed?.toFixed(1)} m/s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        main > * {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WeatherDashboardWithEnhancements;
