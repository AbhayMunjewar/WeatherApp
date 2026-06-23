import React, { useState, useEffect, useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import { 
  CloudSun, Search, MapPin, Download, Plus, Trash2, Edit2, 
  Video, Map as MapIcon, Database, Calendar, FileJson, Table, 
  FileCode, FileText, ChevronDown, Check, X, AlertTriangle, Eye
} from 'lucide-react';

import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import FeelsLikeCard from './components/FeelsLikeCard';
import UVCard from './components/UVCard';
import SunriseSunset from './components/SunriseSunset';
import AQICard from './components/AQICard';
import UmbrellaAlert from './components/UmbrellaAlert';
import ForecastStrip from './components/ForecastStrip';
import OutfitSuggester from './components/OutfitSuggester';
import PollenCard from './components/PollenCard';
import TravelComparison from './components/TravelComparison';
import ErrorBanner from './components/ErrorBanner';

import { 
  fetchWeather, fetchForecast, fetchAQI, reverseGeocode, 
  geocodeCity, fetchYouTubeVideos, fetchHistoryRecords, 
  createHistoryRecord, updateHistoryRecord, deleteHistoryRecord 
} from './api';

import { estimateUVI } from './utils/uvHelpers';

function App() {
  // Weather & stats states
  const [cityQuery, setCityQuery] = useState('New York');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search history chips
  const [recentCities, setRecentCities] = useState([]);

  // YouTube videos
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  
  // Database CRUD states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // CRUD Search/Filter states
  const [dbSearch, setDbSearch] = useState('');
  const [rangeDraft, setRangeDraft] = useState({ start: '', end: '' });
  const [activeRange, setActiveRange] = useState({ start: '', end: '' });
  
  // CRUD Modals states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [modalError, setModalError] = useState('');
  const [validatingLocation, setValidatingLocation] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportRef = useRef(null);

  // Form inputs
  const [addForm, setAddForm] = useState({ city: '', startDate: '', endDate: '' });
  const [editForm, setEditForm] = useState({ city: '', temperature: '', description: '' });

  // Load recent searches & DB records on mount
  useEffect(() => {
    // 1. Load recent searches
    const storedRecent = localStorage.getItem('atmos_recent_cities');
    if (storedRecent) {
      setRecentCities(JSON.parse(storedRecent));
    } else {
      setRecentCities(['New York', 'London', 'Tokyo']);
    }

    // 2. Load DB logs
    loadHistory();
  }, []);

  // Fetch weather data when cityQuery changes
  useEffect(() => {
    if (cityQuery) {
      getWeatherData(cityQuery);
    }
  }, [cityQuery]);

  // Click outside to close export dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch main weather services
  const getWeatherData = async (query) => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch current weather
      const currentRes = await fetchWeather(query);
      setWeatherData(currentRes);
      
      const { lat, lon } = currentRes.coord;
      const verifiedName = currentRes.name;

      // 2. Add to search chips history
      updateRecentCities(verifiedName);

      // 3. Fetch Forecast and AQI in parallel
      const [forecastRes, aqiRes, ytVideos] = await Promise.all([
        fetchForecast(query),
        fetchAQI(lat, lon),
        fetchYouTubeVideos(verifiedName)
      ]);

      setForecastData(forecastRes);
      setAqiData(aqiRes);
      setYoutubeVideos(ytVideos);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Geolocate logic
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get name
          const geoInfo = await reverseGeocode(latitude, longitude);
          // Fetch weather using coordinate query format
          const currentRes = await fetchWeather({ lat: latitude, lon: longitude });
          setWeatherData(currentRes);
          
          const verifiedName = currentRes.name || geoInfo.name;
          updateRecentCities(verifiedName);

          const [forecastRes, aqiRes, ytVideos] = await Promise.all([
            fetchForecast({ lat: latitude, lon: longitude }),
            fetchAQI(latitude, longitude),
            fetchYouTubeVideos(verifiedName)
          ]);

          setForecastData(forecastRes);
          setAqiData(aqiRes);
          setYoutubeVideos(ytVideos);
        } catch (err) {
          setError(err.message || 'Failed to resolve geolocated weather details.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation permission error:', err);
        setError('Location access denied. Please type city name manually.');
        setLoading(false);
      }
    );
  };

  // Recent searches list manager
  const updateRecentCities = (cityName) => {
    setRecentCities(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== cityName.toLowerCase());
      const updated = [cityName, ...filtered].slice(0, 5); // limit to 5
      localStorage.setItem('atmos_recent_cities', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveRecentCity = (cityName) => {
    setRecentCities(prev => {
      const updated = prev.filter(c => c.toLowerCase() !== cityName.toLowerCase());
      localStorage.setItem('atmos_recent_cities', JSON.stringify(updated));
      return updated;
    });
  };

  // ==================== CRUD DATABASE LOGS ====================

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const records = await fetchHistoryRecords();
      const normalized = [...records].reverse().map((entry) => ({
        id: entry._id ?? entry.id,
        city: entry.city,
        temperature: entry.temperature,
        description: entry.description,
        date: entry.date,
        startDate: entry.startDate,
        endDate: entry.endDate
      }));
      setHistory(normalized);
    } catch (err) {
      console.warn('Backend history fetch failed. Using LocalStorage fallback:', err);
      const local = localStorage.getItem('atmos_db_history');
      if (local) {
        setHistory(JSON.parse(local));
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setModalError('');
    const { city, startDate, endDate } = addForm;

    if (!city.trim() || !startDate || !endDate) {
      setModalError('All fields are required.');
      return;
    }

    if (startDate > endDate) {
      setModalError('Start Date must be on or before End Date.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (startDate > todayStr || endDate > todayStr) {
      setModalError('Dates cannot be in the future.');
      return;
    }

    setValidatingLocation(true);
    try {
      // 1. Geocode location to verify it exists
      const coords = await geocodeCity(city);
      
      // 2. Fetch temperature from OpenWeather
      const weatherRes = await fetchWeather({ lat: coords.lat, lon: coords.lon });
      const currentTemp = weatherRes.main.temp;
      const currentDesc = weatherRes.weather[0].description;

      const payload = {
        city: coords.name,
        temperature: currentTemp,
        description: `${currentDesc} (Logged Scope: ${startDate} to ${endDate})`,
        date: new Date(startDate).toISOString(),
        startDate,
        endDate
      };

      let newRecord;
      try {
        const saved = await createHistoryRecord(payload);
        newRecord = {
          id: saved._id ?? saved.id,
          city: saved.city,
          temperature: saved.temperature,
          description: saved.description,
          date: saved.date,
          startDate: saved.startDate,
          endDate: saved.endDate
        };
      } catch (dbErr) {
        console.warn('Backend save failed. Saving to LocalStorage instead.', dbErr);
        // Fallback save locally
        newRecord = {
          id: 'local_' + Date.now(),
          ...payload
        };
        const updatedLocal = [newRecord, ...history];
        localStorage.setItem('atmos_db_history', JSON.stringify(updatedLocal));
      }

      setHistory(prev => [newRecord, ...prev]);
      setShowAddModal(false);
      setAddForm({ city: '', startDate: '', endDate: '' });
      setStatus({ type: 'success', message: 'Record added successfully.' });
    } catch (err) {
      setModalError(err.message || 'Validation failed. Check city name.');
    } finally {
      setValidatingLocation(false);
    }
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    setModalError('');
    const { city, temperature, description } = editForm;

    if (!city.trim() || temperature === '' || !description.trim()) {
      setModalError('All fields are required.');
      return;
    }

    const tempNum = Number(temperature);
    if (isNaN(tempNum) || tempNum < -80 || tempNum > 60) {
      setModalError('Please enter a valid temperature between -80°C and 60°C.');
      return;
    }

    setValidatingLocation(true);
    try {
      let verifiedCityName = city;
      // Geocode only if the city name changed
      if (city.trim().toLowerCase() !== editRecord.city.trim().toLowerCase()) {
        const coords = await geocodeCity(city);
        verifiedCityName = coords.name;
      }

      const payload = {
        city: verifiedCityName,
        temperature: tempNum,
        description
      };

      let isLocal = String(editRecord.id).startsWith('local_');
      if (!isLocal) {
        try {
          await updateHistoryRecord(editRecord.id, payload);
        } catch (dbErr) {
          console.warn('Backend update failed. Editing locally.', dbErr);
          isLocal = true;
        }
      }

      const updatedHistory = history.map(item => item.id === editRecord.id ? {
        ...item,
        city: verifiedCityName,
        temperature: tempNum,
        description
      } : item);

      if (isLocal) {
        localStorage.setItem('atmos_db_history', JSON.stringify(updatedHistory));
      }

      setHistory(updatedHistory);
      setShowEditModal(false);
      setEditRecord(null);
      setStatus({ type: 'success', message: 'Record updated successfully.' });
    } catch (err) {
      setModalError(err.message || 'Failed to update record.');
    } finally {
      setValidatingLocation(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!recordId) return;
    setStatus({ type: '', message: '' });
    
    const isLocal = String(recordId).startsWith('local_');
    try {
      if (!isLocal) {
        try {
          await deleteHistoryRecord(recordId);
        } catch (dbErr) {
          console.warn('Backend delete failed. Deleting locally.', dbErr);
        }
      }
      
      const updatedHistory = history.filter((item) => item.id !== recordId);
      localStorage.setItem('atmos_db_history', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setStatus({ type: 'success', message: 'Record deleted successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Unable to delete that record.' });
    }
  };

  const openEditModal = (record) => {
    setEditRecord(record);
    setEditForm({
      city: record.city || '',
      temperature: record.temperature !== undefined ? String(record.temperature) : '',
      description: record.description || ''
    });
    setModalError('');
    setShowEditModal(true);
  };

  // Helper date formats for display
  const formatDateString = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter history records based on search query and date ranges
  const filteredHistory = useMemo(() => {
    const query = dbSearch.trim().toLowerCase();
    const startMs = activeRange.start ? new Date(`${activeRange.start}T00:00:00`).getTime() : null;
    const endMs = activeRange.end ? new Date(`${activeRange.end}T23:59:59`).getTime() : null;

    return history.filter((item) => {
      const text = `${item.city ?? ''} ${item.description ?? ''}`.toLowerCase();
      const matchesSearch = query ? text.includes(query) : true;
      const parsedTime = item.date ? new Date(item.date).getTime() : NaN;
      const recordMs = Number.isFinite(parsedTime) ? parsedTime : null;
      
      if ((startMs !== null || endMs !== null) && recordMs === null) {
        return false;
      }
      let inRange = true;
      if (recordMs !== null && startMs !== null) {
        inRange = recordMs >= startMs;
      }
      if (inRange && recordMs !== null && endMs !== null) {
        inRange = recordMs <= endMs;
      }
      return matchesSearch && inRange;
    });
  }, [history, dbSearch, activeRange]);

  const handleApplyRange = () => {
    if (rangeDraft.start && rangeDraft.end && rangeDraft.start > rangeDraft.end) {
      setStatus({ type: 'error', message: 'Start date must be on or before the end date.' });
      return;
    }
    setActiveRange({ start: rangeDraft.start, end: rangeDraft.end });
    setStatus({ type: 'success', message: 'Date filter applied.' });
  };

  const handleClearRange = () => {
    setRangeDraft({ start: '', end: '' });
    setActiveRange({ start: '', end: '' });
    setStatus({ type: 'success', message: 'Filters cleared.' });
  };

  // ==================== EXPORT DATA LOGS ====================

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const handleExportJSON = () => {
    if (filteredHistory.length === 0) {
      setStatus({ type: 'error', message: 'No records to export.' });
      return;
    }
    const content = JSON.stringify(filteredHistory, null, 2);
    downloadFile(content, `atmos-history-${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8;');
    setStatus({ type: 'success', message: 'Exported as JSON.' });
    setShowExportDropdown(false);
  };

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      setStatus({ type: 'error', message: 'No records to export.' });
      return;
    }
    const headers = ['ID', 'City', 'Temperature (°C)', 'Description', 'Date/Time'];
    const rows = filteredHistory.map(item => [
      item.id || '',
      item.city || '',
      item.temperature !== undefined ? item.temperature : '',
      item.description || '',
      item.date ? new Date(item.date).toLocaleString() : ''
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    downloadFile(csvContent, `atmos-history-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    setStatus({ type: 'success', message: 'Exported as CSV.' });
    setShowExportDropdown(false);
  };

  const handleExportXML = () => {
    if (filteredHistory.length === 0) {
      setStatus({ type: 'error', message: 'No records to export.' });
      return;
    }
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<history>\n';
    filteredHistory.forEach(item => {
      xml += '  <record>\n';
      xml += `    <id>${item.id || ''}</id>\n`;
      xml += `    <city>${escapeXml(item.city || '')}</city>\n`;
      xml += `    <temperature>${item.temperature !== undefined ? item.temperature : ''}</temperature>\n`;
      xml += `    <description>${escapeXml(item.description || '')}</description>\n`;
      xml += `    <date>${item.date || ''}</date>\n`;
      xml += '  </record>\n';
    });
    xml += '</history>';
    downloadFile(xml, `atmos-history-${new Date().toISOString().split('T')[0]}.xml`, 'application/xml;charset=utf-8;');
    setStatus({ type: 'success', message: 'Exported as XML.' });
    setShowExportDropdown(false);
  };

  const handleExportMarkdown = () => {
    if (filteredHistory.length === 0) {
      setStatus({ type: 'error', message: 'No records to export.' });
      return;
    }
    let md = '# Atmos Historical Weather Database Report\n\n';
    md += `Generated: ${new Date().toLocaleString()}\n`;
    md += `Records Exported: ${filteredHistory.length}\n\n`;
    md += '| Location | Temp (°C) | Description / Metadata | Date Logged |\n';
    md += '| --- | --- | --- | --- |\n';
    filteredHistory.forEach(item => {
      md += `| **${item.city}** | ${item.temperature}°C | ${item.description} | ${formatDateString(item.date)} |\n`;
    });
    downloadFile(md, `atmos-history-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown;charset=utf-8;');
    setStatus({ type: 'success', message: 'Exported as Markdown.' });
    setShowExportDropdown(false);
  };

  const handleExportPDF = () => {
    if (filteredHistory.length === 0) {
      setStatus({ type: 'error', message: 'No records to export.' });
      return;
    }
    try {
      const doc = new jsPDF();
      let cursorY = 20;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate navy
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('ATMOS WEATHER HISTORY REPORT', 15, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(56, 189, 248); // accent color sky blue
      doc.text('PREMIUM HISTORICAL FEED DATA LOGS', 15, 32);

      cursorY = 55;
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Report Details', 15, cursorY);
      cursorY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, cursorY);
      doc.text(`Total Records: ${filteredHistory.length}`, 110, cursorY);
      
      cursorY += 15;

      // Table columns
      const colX = { date: 15, city: 55, temp: 110, cond: 130 };
      doc.setFont('helvetica', 'bold');
      doc.text('Date Logged', colX.date, cursorY);
      doc.text('Location', colX.city, cursorY);
      doc.text('Temp', colX.temp, cursorY);
      doc.text('Description / Log details', colX.cond, cursorY);

      cursorY += 4;
      doc.setDrawColor(203, 213, 225);
      doc.line(15, cursorY, 195, cursorY);
      cursorY += 8;

      doc.setFont('helvetica', 'normal');
      filteredHistory.forEach((item, index) => {
        if (cursorY > 275) {
          doc.addPage();
          cursorY = 20;
          
          doc.setFont('helvetica', 'bold');
          doc.text('Date Logged', colX.date, cursorY);
          doc.text('Location', colX.city, cursorY);
          doc.text('Temp', colX.temp, cursorY);
          doc.text('Description / Log details', colX.cond, cursorY);
          cursorY += 4;
          doc.line(15, cursorY, 195, cursorY);
          cursorY += 8;
          doc.setFont('helvetica', 'normal');
        }

        const dateStr = formatDateString(item.date);
        const cityStr = item.city || 'N/A';
        const tempStr = item.temperature !== undefined ? `${Math.round(item.temperature)}°C` : '--°C';
        const condStr = item.description || 'N/A';

        // Clip long string for descriptions
        const clippedCond = condStr.length > 35 ? condStr.substring(0, 32) + '...' : condStr;

        doc.text(dateStr, colX.date, cursorY);
        doc.text(cityStr, colX.city, cursorY);
        doc.text(tempStr, colX.temp, cursorY);
        doc.text(clippedCond, colX.cond, cursorY);
        
        cursorY += 8;
      });

      doc.save(`atmos-history-${new Date().toISOString().split('T')[0]}.pdf`);
      setStatus({ type: 'success', message: 'Exported as PDF.' });
      setShowExportDropdown(false);
    } catch (error) {
      console.error('PDF export failed:', error);
      setStatus({ type: 'error', message: 'Failed to export history as PDF.' });
    }
  };

  // Google Map Embed url
  const googleMapEmbedUrl = useMemo(() => {
    if (weatherData && weatherData.coord) {
      const { lat, lon } = weatherData.coord;
      return `https://www.google.com/maps?q=${lat},${lon}&z=11&output=embed`;
    }
    return '';
  }, [weatherData]);

  // Estimate UV index
  const estimatedUVIVal = useMemo(() => {
    if (weatherData && weatherData.coord) {
      return estimateUVI(weatherData.coord.lat, weatherData.timezone ?? 0);
    }
    return 1.5; // fallback default
  }, [weatherData]);

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="header">
        <h1>
          <CloudSun size={32} color="#38bdf8" />
          Atmos <span>Weather</span>
        </h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
          Tech Internship Assessment
        </span>
      </header>

      {/* Global Inline Dismissible Error Banner */}
      <ErrorBanner message={error} onClose={() => setError('')} />

      {/* Search Input & Locating */}
      <SearchBar 
        onSearch={getWeatherData} 
        onGeolocate={handleGeolocate} 
        recentCities={recentCities}
        onRemoveCity={handleRemoveRecentCity}
        isLoading={loading}
      />

      {/* Main Dashboard Panel */}
      <main className="dashboard-grid">
        {/* Left Column: Primary current details & Map */}
        <section className="left-panel">
          <CurrentWeather data={weatherData} isLoading={loading} />

          {/* Map Preview */}
          <div className="card fade-in">
            <div className="card-title">
              <MapIcon size={18} />
              <span>Location Map</span>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: '250px' }} />
            ) : googleMapEmbedUrl ? (
              <div className="map-embed-wrapper">
                <iframe
                  title="Google Map Location Embed"
                  src={googleMapEmbedUrl}
                  allowFullScreen
                />
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Map unavailable. Search a location to display details.
              </p>
            )}
          </div>
        </section>

        {/* Right Column: Advanced Stats, Skeletons, Forecast, Outfits */}
        <section className="right-panel">
          {/* Umbrella Alert (Rain/Snow check) */}
          <UmbrellaAlert 
            forecastList={forecastData?.list} 
            isLoading={loading} 
          />

          {/* 2-Column secondary details grid */}
          <div className="grid-2col">
            <FeelsLikeCard 
              currentTemp={weatherData?.main?.temp} 
              feelsLikeTemp={weatherData?.main?.feels_like} 
              isLoading={loading}
            />

            <UVCard 
              uvi={estimatedUVIVal} 
              isLoading={loading}
            />

            <AQICard 
              data={aqiData} 
              isLoading={loading}
            />

            <SunriseSunset 
              sunrise={weatherData?.sys?.sunrise} 
              sunset={weatherData?.sys?.sunset} 
              timezone={weatherData?.timezone}
              isLoading={loading}
            />

            <PollenCard 
              lat={weatherData?.coord?.lat}
              lon={weatherData?.coord?.lon}
            />
          </div>

          {/* 5-Day Forecast Strips */}
          <ForecastStrip 
            forecastList={forecastData?.list} 
            isLoading={loading} 
          />

          <OutfitSuggester 
            temp={weatherData?.main?.temp} 
            pop={forecastData?.list?.[0]?.pop}
            condition={weatherData?.weather?.[0]?.main}
          />
        </section>
      </main>

      {/* Travel Weather Comparison section */}
      <TravelComparison />

      {/* Curated YouTube clips */}
      {youtubeVideos.length > 0 && !loading && (
        <section className="card fade-in" style={{ marginTop: '1rem' }}>
          <div className="card-title">
            <Video size={18} color="#ef4444" />
            <span>Curated YouTube Videos — {weatherData?.name}</span>
          </div>
          <div className="yt-clips-grid" style={{ marginTop: '0.5rem' }}>
            {youtubeVideos.map((video, idx) => (
              <div className="yt-clip-card" key={video.id?.videoId || idx}>
                <div className="yt-iframe-wrapper">
                  <iframe
                    title={video.snippet?.title || 'YouTube clip'}
                    src={`https://www.youtube.com/embed/${video.id?.videoId}`}
                    allowFullScreen
                  />
                </div>
                <h4 className="yt-clip-title" title={video.snippet?.title}>
                  {video.snippet?.title}
                </h4>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== DATABASE CRUD TABLE & LOGGING ==================== */}
      <section className="card fade-in" style={{ marginTop: '1.5rem', minHeight: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--accent)" />
            Historical Weather Database Feed
          </h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search filter input */}
            <div className="search-input-wrapper" style={{ width: '220px' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                style={{ padding: '0.45rem 1rem 0.45rem 2rem', fontSize: '0.85rem' }}
                placeholder="Filter by city..."
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
              />
            </div>

            {/* Log Query button */}
            <button 
              onClick={() => {
                setModalError('');
                setAddForm({ city: '', startDate: '', endDate: '' });
                setShowAddModal(true);
              }}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              Log Query
            </button>

            {/* Export Dropdown */}
            <div className="export-dropdown" ref={exportRef}>
              <button 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <Download size={16} />
                Export
                <ChevronDown size={14} />
              </button>
              
              {showExportDropdown && (
                <div className="dropdown-menu">
                  <button onClick={handleExportJSON} className="dropdown-item">
                    <FileJson size={14} /> JSON
                  </button>
                  <button onClick={handleExportCSV} className="dropdown-item">
                    <Table size={14} /> CSV (Delimited)
                  </button>
                  <button onClick={handleExportXML} className="dropdown-item">
                    <FileCode size={14} /> XML
                  </button>
                  <button onClick={handleExportMarkdown} className="dropdown-item">
                    <FileText size={14} /> Markdown
                  </button>
                  <button onClick={handleExportPDF} className="dropdown-item">
                    <FileText size={14} color="#ef4444" /> PDF Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date filter pickers */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', background: '#0f172a', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Date Range Filter:</span>
          <input
            type="date"
            className="search-input"
            style={{ width: '135px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            value={rangeDraft.start}
            onChange={(e) => setRangeDraft(prev => ({ ...prev, start: e.target.value }))}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>to</span>
          <input
            type="date"
            className="search-input"
            style={{ width: '135px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            value={rangeDraft.end}
            onChange={(e) => setRangeDraft(prev => ({ ...prev, end: e.target.value }))}
          />
          <button 
            onClick={handleApplyRange} 
            className="btn btn-primary" 
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
          >
            Apply
          </button>
          {(activeRange.start || activeRange.end) && (
            <button 
              onClick={handleClearRange} 
              className="btn btn-secondary" 
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: '#ef4444' }}
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Status notification inside database container */}
        {status.message && (
          <div 
            style={{ 
              marginTop: '1rem', 
              padding: '0.6rem 1rem', 
              borderRadius: '0.5rem', 
              fontSize: '0.85rem', 
              background: status.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: status.type === 'success' ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
              color: status.type === 'success' ? '#86efac' : '#fca5a5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{status.message}</span>
            <button 
              onClick={() => setStatus({ type: '', message: '' })} 
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Database List / Table */}
        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading weather records...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No records found. Click "+ Log Query" to add one!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date Logged</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Temp (°C)</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Details / Description</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((record) => (
                  <tr 
                    key={record.id} 
                    style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.5)', transition: 'background 0.2s' }}
                    className="history-row"
                  >
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {formatDateString(record.date)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>
                      {record.city}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                      {Math.round(record.temperature)}°C
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.description}>
                      {record.description}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditModal(record)}
                          style={{ background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer', padding: '0.2rem' }}
                          title="Edit Record"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.2rem' }}
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        © {new Date().getFullYear()} Atmos Weather App Dashboard. Built with pure custom styling. All rights reserved.
      </footer>

      {/* ==================== CREATE MODAL ==================== */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '420px', maxWidth: '90%', background: '#1e293b', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Log Location Query</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '500' }}>City / Location Name</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="e.g., Paris, Tokyo..."
                  value={addForm.city}
                  onChange={(e) => setAddForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '500' }}>Start Date</label>
                  <input
                    type="date"
                    className="search-input"
                    value={addForm.startDate}
                    onChange={(e) => setAddForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '500' }}>End Date</label>
                  <input
                    type="date"
                    className="search-input"
                    value={addForm.endDate}
                    onChange={(e) => setAddForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {modalError && (
                <div style={{ color: '#fca5a5', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.35rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>{modalError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  disabled={validatingLocation}
                >
                  {validatingLocation ? 'Verifying location...' : 'Save to DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT MODAL ==================== */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '420px', maxWidth: '90%', background: '#1e293b', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Update Weather Record</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditRecord(null);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '500' }}>City / Location Name</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="e.g., Paris..."
                  value={editForm.city}
                  onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '500' }}>Temperature (°C)</label>
                <input
                  type="number"
                  step="any"
                  className="search-input"
                  placeholder="e.g., 22.5"
                  value={editForm.temperature}
                  onChange={(e) => setEditForm(prev => ({ ...prev, temperature: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '500' }}>Description / Log metadata</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="e.g., overcast clouds..."
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {modalError && (
                <div style={{ color: '#fca5a5', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.35rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>{modalError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditRecord(null);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  disabled={validatingLocation}
                >
                  {validatingLocation ? 'Verifying location...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
