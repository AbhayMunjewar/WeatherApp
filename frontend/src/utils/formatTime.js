/**
 * Formats a Unix timestamp with a timezone offset to local HH:MM AM/PM format of the target city.
 * Shift to UTC representing local time in target city, then extract UTC hours/minutes.
 */
export const formatUnixTime = (unix, offsetSeconds) => {
  if (unix === undefined || unix === null || isNaN(unix)) return 'N/A';
  const shiftedDate = new Date((unix + offsetSeconds) * 1000);
  const hours = shiftedDate.getUTCHours();
  const minutes = shiftedDate.getUTCMinutes();
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Calculates golden hours based on sunrise and sunset Unix timestamps.
 * Morning: Sunrise to 30 mins after sunrise.
 * Evening: 30 mins before sunset to Sunset.
 */
export const getGoldenHourRange = (sunriseUnix, sunsetUnix, offsetSeconds) => {
  if (!sunriseUnix || !sunsetUnix) return { morning: 'N/A', evening: 'N/A' };
  
  const morningStart = formatUnixTime(sunriseUnix, offsetSeconds);
  const morningEnd = formatUnixTime(sunriseUnix + 1800, offsetSeconds); // +30 minutes
  
  const eveningStart = formatUnixTime(sunsetUnix - 1800, offsetSeconds); // -30 minutes
  const eveningEnd = formatUnixTime(sunsetUnix, offsetSeconds);
  
  return {
    morning: `${morningStart} – ${morningEnd}`,
    evening: `${eveningStart} – ${eveningEnd}`
  };
};
