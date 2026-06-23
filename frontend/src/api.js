const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, "");

/**
 * Fetch current weather data from OpenWeather.
 * Supports string query (city name) or {lat, lon} coordinate object.
 */
export const fetchWeather = async (query) => {
  let url;
  if (typeof query === 'object' && query.lat !== undefined && query.lon !== undefined) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${API_KEY}&units=metric`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch current weather data. Check city name spelling.');
  }
  return res.json();
};

/**
 * Fetch 5-day / 3-hour forecast from OpenWeather.
 * Supports string query (city name) or {lat, lon} coordinate object.
 */
export const fetchForecast = async (query) => {
  let url;
  if (typeof query === 'object' && query.lat !== undefined && query.lon !== undefined) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&appid=${API_KEY}&units=metric`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch forecast details.');
  }
  return res.json();
};

/**
 * Fetch Air Quality Index from OpenWeather using latitude and longitude.
 */
export const fetchAQI = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch Air Quality details.');
  }
  return res.json();
};

/**
 * Perform reverse geocoding to find city name from coordinates.
 */
export const reverseGeocode = async (lat, lon) => {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get location name from coordinates.');
  }
  const data = await res.json();
  if (data && data.length > 0) {
    return data[0]; // Returns { name: '...', state: '...', country: '...' }
  }
  return { name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})` };
};

/**
 * Fetch geocode data (lat, lon) directly by city name query.
 */
export const geocodeCity = async (cityQuery) => {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityQuery)}&limit=1&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to geocode location.');
  }
  const data = await res.json();
  if (!data || data.length === 0) {
    throw new Error(`Location "${cityQuery}" could not be found. Please check your spelling.`);
  }
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: `${data[0].name}${data[0].state ? ', ' + data[0].state : ''}, ${data[0].country}`
  };
};

/**
 * Fetch YouTube Videos for a location and weather topic.
 */
export const fetchYouTubeVideos = async (locationQuery) => {
  if (!YOUTUBE_API_KEY) {
    return []; // Return empty if no YouTube API key set
  }
  const query = encodeURIComponent(`${locationQuery} weather forecast tourism`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${query}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.warn('YouTube search API error:', errorData);
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error('Failed to fetch YouTube videos:', err);
    return [];
  }
};

/**
 * CRUD: Fetch all weather records from database.
 */
export const fetchHistoryRecords = async () => {
  const url = `${API_BASE_URL}/records`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch weather records from database.');
  }
  const data = await res.json();
  return data.records || [];
};

/**
 * CRUD: Create/save a weather record into database.
 */
export const createHistoryRecord = async (payload) => {
  const url = `${API_BASE_URL}/save`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create record in database.');
  }
  return data.record;
};

/**
 * CRUD: Update a weather record in database.
 */
export const updateHistoryRecord = async (id, payload) => {
  const url = `${API_BASE_URL}/update/${id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update record in database.');
  }
  return data;
};

/**
 * CRUD: Delete a weather record from database.
 */
export const deleteHistoryRecord = async (id) => {
  const url = `${API_BASE_URL}/delete/${id}`;
  const res = await fetch(url, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete record from database.');
  }
  return data;
};

/**
 * Fetch Pollen / Allergy forecast data from Google Pollen API.
 */
export const fetchPollen = async (lat, lon) => {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API Key is not configured in .env.');
  }
  const url = `https://pollen.googleapis.com/v1/forecast:lookup?location.longitude=${lon}&location.latitude=${lat}&days=1&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch pollen data.');
  }
  return res.json();
};
