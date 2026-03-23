import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentWeather, getForecast } from '../services/weatherService';

const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [city, setCity] = useState('Reykjavik');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(['OSLO_SEC', 'LONDON_HUB', 'TOKYO_P4']);

  const fetchWeather = async (searchCity) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await getCurrentWeather(searchCity);
      const forecast = await getForecast(searchCity);
      setWeatherData(weather);
      setForecastData(forecast);
      setCity(searchCity);
      if (!history.includes(searchCity.toUpperCase())) {
        setHistory(prev => [searchCity.toUpperCase(), ...prev.slice(0, 4)]);
      }
    } catch (err) {
      setError(err.message || 'Calibration failed. Link unstable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  return (
    <WeatherContext.Provider value={{ 
      city, weatherData, forecastData, loading, error, history, fetchWeather 
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => useContext(WeatherContext);
