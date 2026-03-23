export const getSuggestion = (condition) => {
  const suggestions = {
    'Clear': 'Atmospheric density increasing. Recommend thermal stabilization.',
    'Clouds': 'Heavy particle density. High-altitude sensors may require recalibration.',
    'Rain': 'Precipitation surge detected. Deploy sub-orbital shielding.',
    'Snow': 'Major Arctic Pulse active. Monitor satellite thermal exhaust.',
    'Thunderstorm': 'Electromagnetic interference warning. Class-4 Anomaly likely.',
  };
  return suggestions[condition] || 'Environmental conditions nominal. Data stream stable.';
};
