import React from 'react';
import { CloudRain } from 'lucide-react';

const UmbrellaAlert = ({ forecastList, isLoading }) => {
  if (isLoading || !forecastList || forecastList.length === 0) return null;

  // We check the upcoming 12 hours (first 4 items, since each is a 3-hour step)
  const checkItems = forecastList.slice(0, 4);
  
  let needsUmbrella = false;
  let precType = 'rain/snow';
  let triggerTime = '';
  let highestPop = 0;

  for (let i = 0; i < checkItems.length; i++) {
    const item = checkItems[i];
    const pop = item.pop || 0;
    const condMain = item.weather?.[0]?.main?.toLowerCase() || '';
    const condDesc = item.weather?.[0]?.description?.toLowerCase() || '';
    
    if (pop > highestPop) {
      highestPop = pop;
    }

    if (pop > 0.4 || condMain.includes('rain') || condMain.includes('snow') || condMain.includes('drizzle') || condMain.includes('thunderstorm') || condDesc.includes('rain') || condDesc.includes('snow')) {
      needsUmbrella = true;
      precType = condMain.includes('snow') ? 'snow ❄️' : 'rain 🌧️';
      
      // Calculate how many hours from now
      const dateText = item.dt_txt; // format: "2026-06-22 18:00:00"
      if (dateText) {
        try {
          const forecastTime = new Date(dateText.replace(' ', 'T'));
          const diffMs = forecastTime.getTime() - Date.now();
          const diffHrs = Math.max(0, Math.round(diffMs / 3600000));
          if (diffHrs === 0) {
            triggerTime = 'right now';
          } else {
            triggerTime = `in about ${diffHrs} hour${diffHrs > 1 ? 's' : ''}`;
          }
        } catch (e) {
          triggerTime = 'soon';
        }
      } else {
        triggerTime = 'soon';
      }
      break;
    }
  }

  if (!needsUmbrella) return null;

  return (
    <div className="umbrella-alert fade-in">
      <CloudRain size={20} />
      <div>
        <strong>Umbrella Alert:</strong> Looks like there is a probability of {precType} {triggerTime} (precip. chance: {Math.round(highestPop * 100)}%). Don't forget your umbrella or raincoat! ☔
      </div>
    </div>
  );
};

export default UmbrellaAlert;
