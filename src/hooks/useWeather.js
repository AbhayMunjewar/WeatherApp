import { useWeather } from '../context/WeatherContext';

export default function useWeatherHook() {
  const context = useWeather();
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
