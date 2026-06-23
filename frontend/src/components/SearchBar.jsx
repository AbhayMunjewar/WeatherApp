import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';

const SearchBar = ({ onSearch, onGeolocate, recentCities, onRemoveCity, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-box">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search city, zip code, or landmark..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading || !query.trim()}
        >
          Search
        </button>
        <button
          type="button"
          onClick={onGeolocate}
          className="btn btn-secondary"
          title="Detect my location"
          disabled={isLoading}
        >
          <MapPin size={18} />
          <span>Locate</span>
        </button>
      </form>

      {recentCities && recentCities.length > 0 && (
        <div className="chips-container">
          <span className="chips-label">Recent searches:</span>
          {recentCities.map((city, index) => (
            <div 
              key={`${city}-${index}`} 
              className="chip"
              onClick={() => !isLoading && onSearch(city)}
            >
              <span>{city}</span>
              <button
                type="button"
                className="chip-remove"
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering search
                  onRemoveCity(city);
                }}
                title={`Remove ${city}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
