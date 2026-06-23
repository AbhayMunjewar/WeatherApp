/**
 * Maps OpenWeather AQI levels (1-5) to descriptions, colors, and emoji tags.
 */
export const getAQIDetails = (aqi) => {
  const level = Number(aqi) || 1;
  switch (level) {
    case 1:
      return {
        label: 'Good 🟢',
        color: '#22c55e',
        desc: 'Air quality is satisfactory, and air pollution poses little or no risk.'
      };
    case 2:
      return {
        label: 'Fair 🟡',
        color: '#eab308',
        desc: 'Air quality is acceptable; however, sensitive groups should be aware.'
      };
    case 3:
      return {
        label: 'Moderate 🟠',
        color: '#f97316',
        desc: 'Members of sensitive groups may experience health effects.'
      };
    case 4:
      return {
        label: 'Poor 🔴',
        color: '#ef4444',
        desc: 'Everyone may begin to experience health effects; sensitive groups more seriously.'
      };
    case 5:
      return {
        label: 'Very Poor 🟣',
        color: '#a855f7',
        desc: 'Health alert: everyone may experience more serious health effects.'
      };
    default:
      return {
        label: 'Unknown',
        color: '#64748b',
        desc: 'No AQI details available.'
      };
  }
};
