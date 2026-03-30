import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';

/**
 * CitySearchWithSuggestions Component
 * Features:
 * - Auto-suggestions dropdown while typing
 * - Debounced API calls (300ms)
 * - Limit to 5 suggestions
 * - Click to select and fetch weather
 * - Loading state for suggestions
 */

const CitySearchWithSuggestions = ({ 
  onCitySelect, 
  isLoading = false,
  API_KEY,
  value = ''
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced fetch suggestions
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        setSuggestions([]);
        return;
      }

      const data = await response.json();
      
      // Format suggestions with city, state, country
      const formatted = data.map(item => ({
        name: item.name,
        state: item.state || '',
        country: item.country,
        lat: item.lat,
        lon: item.lon,
        displayName: `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`
      }));

      setSuggestions(formatted);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onCitySelect(suggestion.name, suggestion.lat, suggestion.lon);
    setInputValue(suggestion.displayName);
    setShowSuggestions(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && inputValue.trim()) {
        onCitySelect(inputValue.trim());
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (inputValue.trim()) {
          onCitySelect(inputValue.trim());
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={suggestionsRef}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Search 
          size={18} 
          style={{
            position: 'absolute',
            left: '1rem',
            color: '#4b5563',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          placeholder="Search for a city..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && suggestions.length > 0 && setShowSuggestions(true)}
          disabled={isLoading}
          style={{
            width: '100%',
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '0.6rem 1rem 0.6rem 2.8rem',
            color: 'white',
            outline: 'none',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'text'
          }}
        />
        {inputValue && !isLoading && (
          <button
            onClick={() => {
              setInputValue('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            style={{
              position: 'absolute',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={16} />
          </button>
        )}
        {isLoading && (
          <Loader2
            size={18}
            style={{
              position: 'absolute',
              right: '1rem',
              animation: 'spin 1s linear infinite'
            }}
          />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.5rem',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          zIndex: 1000,
          maxHeight: '280px',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
        }}>
          {loadingSuggestions ? (
            <div style={{
              padding: '1rem',
              color: '#64748b',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Finding cities...
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.name}-${suggestion.country}`}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #1e293b' : 'none',
                  cursor: 'pointer',
                  background: selectedIndex === index ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  transition: 'background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <MapPin size={16} color="#a78bfa" />
                <div>
                  <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                    {suggestion.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {suggestion.state && `${suggestion.state}, `}{suggestion.country}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showSuggestions && !loadingSuggestions && suggestions.length === 0 && inputValue.trim() && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.5rem',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          color: '#64748b',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          No cities found. Press Enter to search anyway.
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CitySearchWithSuggestions;
