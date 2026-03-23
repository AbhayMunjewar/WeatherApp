const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Mock data for demo if no API key is provided
const mockWeather = (city) => ({
  name: city,
  main: { temp: -4.2, humidity: 68, pressure: 1012 },
  weather: [{ main: 'Clear', description: 'Heavy Arctic Pulse' }],
  wind: { speed: 22 },
  coord: { lat: 64.1265, lon: -21.8174 }
});

const mockForecast = (city) => ({
  list: [
    { dt_txt: '2024-05-22 12:00:00', main: { temp: -2 }, weather: [{ main: 'Clouds' }] },
    { dt_txt: '2024-05-23 12:00:00', main: { temp: 4 }, weather: [{ main: 'Rain' }] },
    { dt_txt: '2024-05-24 12:00:00', main: { temp: 6 }, weather: [{ main: 'Clear' }] }
  ]
});

export const getCurrentWeather = async (city) => {
  if (!API_KEY) {
    console.warn('VITE_WEATHER_API_KEY missing - using demo data');
    return new Promise(resolve => setTimeout(() => resolve(mockWeather(city)), 800));
  }
  const response = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);
  if (!response.ok) throw new Error('Data sync failure');
  return response.json();
};

export const getForecast = async (city) => {
  if (!API_KEY) {
    return new Promise(resolve => setTimeout(() => resolve(mockForecast(city)), 1000));
  }
  const response = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);
  if (!response.ok) throw new Error('Forecast link error');
  return response.json();
};
