import React from 'react';
import { Calendar, CloudRain } from 'lucide-react';

const groupForecastByDay = (list) => {
  if (!list) return [];
  const map = {};
  
  list.forEach(item => {
    if (!item.dt_txt) return;
    const dateStr = item.dt_txt.split(' ')[0]; // yyyy-mm-dd
    if (!map[dateStr]) {
      map[dateStr] = [];
    }
    map[dateStr].push(item);
  });
  
  const daily = [];
  Object.keys(map).forEach(dateStr => {
    const dayItems = map[dateStr];
    // Find the item with dt_txt containing "12:00:00" (noon)
    let representative = dayItems.find(item => item.dt_txt.includes('12:00:00'));
    if (!representative) {
      representative = dayItems[Math.floor(dayItems.length / 2)];
    }
    
    // Find min/max temperature for this day
    let minTemp = 999;
    let maxTemp = -999;
    let maxPop = 0;
    dayItems.forEach(item => {
      const temp = item.main?.temp;
      if (temp !== undefined) {
        if (temp < minTemp) minTemp = temp;
        if (temp > maxTemp) maxTemp = temp;
      }
      const pop = item.pop || 0;
      if (pop > maxPop) maxPop = pop;
    });

    daily.push({
      ...representative,
      minTemp: minTemp === 999 ? Math.round(representative.main?.temp_min || 0) : Math.round(minTemp),
      maxTemp: maxTemp === -999 ? Math.round(representative.main?.temp_max || 0) : Math.round(maxTemp),
      maxPop: maxPop,
      dateString: dateStr
    });
  });
  
  return daily.slice(0, 5); // Return up to 5 days
};

const ForecastStrip = ({ forecastList, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card skeleton" style={{ height: '180px' }}>
        <div style={{ height: '20px', width: '40%', background: '#334155' }} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', overflow: 'hidden' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ width: '100px', height: '110px', background: '#334155', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!forecastList || forecastList.length === 0) return null;

  const dailyData = groupForecastByDay(forecastList);

  const getDayName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date().toLocaleDateString('en-US', { timeZoneName: 'short' }).split(',')[0];
    const itemDate = date.toLocaleDateString('en-US', { timeZoneName: 'short' }).split(',')[0];

    const todayDate = new Date();
    if (date.toDateString() === todayDate.toDateString()) {
      return 'Today';
    }
    
    const tomorrowDate = new Date();
    tomorrowDate.setDate(todayDate.getDate() + 1);
    if (date.toDateString() === tomorrowDate.toDateString()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card fade-in">
      <div className="card-title">
        <Calendar size={18} />
        <span>5-Day Forecast</span>
      </div>
      
      <div className="forecast-scroll-wrapper">
        {dailyData.map((item, index) => {
          const tempMax = item.maxTemp;
          const tempMin = item.minTemp;
          const cond = item.weather?.[0]?.main || 'Clear';
          const iconCode = item.weather?.[0]?.icon || '01d';
          const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
          const popPercent = Math.round(item.maxPop * 100);

          return (
            <div className="forecast-item" key={item.dateString || index}>
              <span className="forecast-day">{getDayName(item.dateString)}</span>
              <span className="forecast-date">{formatDate(item.dateString)}</span>
              <img src={iconUrl} alt={cond} className="forecast-icon" />
              <span className="forecast-temp">
                {tempMax}° / {tempMin}°
              </span>
              {popPercent > 0 ? (
                <span className="forecast-pop">
                  <CloudRain size={10} />
                  {popPercent}%
                </span>
              ) : (
                <span className="forecast-pop" style={{ color: 'transparent' }}>
                  0%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForecastStrip;
