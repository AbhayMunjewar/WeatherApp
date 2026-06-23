/**
 * Maps a UVI value to its risk category, color, and recommendation details.
 */
export const getUVDetails = (uvi) => {
  const val = typeof uvi === 'number' ? uvi : parseFloat(uvi) || 0;
  if (val <= 2) {
    return {
      level: 'Low',
      color: '#22c55e', // green
      suggestion: 'Safe without sunscreen ✅',
      class: 'uv-low'
    };
  } else if (val <= 5) {
    return {
      level: 'Moderate',
      color: '#eab308', // yellow
      suggestion: 'Wear SPF 30+ ⚠️',
      class: 'uv-moderate'
    };
  } else if (val <= 7) {
    return {
      level: 'High',
      color: '#f97316', // orange
      suggestion: 'Wear SPF 50+ and a hat 🧢',
      class: 'uv-high'
    };
  } else if (val <= 10) {
    return {
      level: 'Very High',
      color: '#ef4444', // red
      suggestion: 'Avoid going out 10am–4pm ☀️🚫',
      class: 'uv-very-high'
    };
  } else {
    return {
      level: 'Extreme',
      color: '#a855f7', // purple
      suggestion: 'Stay indoors if possible 🆘',
      class: 'uv-extreme'
    };
  }
};

/**
 * Estimates a realistic UV Index based on latitude and time of day,
 * since the basic weather API endpoint does not include a UVI field.
 */
export const estimateUVI = (lat, timezoneOffset = 0) => {
  if (lat === undefined || lat === null) return 1.5; // fallback
  
  // Calculate local hour of target location
  const utcHour = new Date().getUTCHours();
  const localHour = (utcHour + (timezoneOffset / 3600) + 24) % 24;

  // UV index is 0 at night (6 PM to 6 AM local)
  if (localHour < 6 || localHour > 18) return 0;

  // Maximum possible UV is at solar noon (12 PM local)
  // It decreases towards poles (higher absolute latitude)
  const latFactor = Math.max(0.1, 1 - Math.abs(lat) / 90);
  
  // Bell curve peaked at 12 PM local
  const hourDiff = Math.abs(localHour - 12);
  const hourFactor = Math.max(0, Math.cos((hourDiff / 6) * (Math.PI / 2)));

  // Maximum potential UV at equator at noon is 12
  const estimatedVal = 12 * latFactor * hourFactor;
  
  return Math.round(estimatedVal * 10) / 10;
};
