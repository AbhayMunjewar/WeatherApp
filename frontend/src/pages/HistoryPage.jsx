import React from 'react';
import {
  Bell, Settings, ShieldAlert,
  MapPin, Clock, Calendar, Star, ChevronRight,
  Search, CloudLightning, Globe, Zap, Navigation,
  LayoutDashboard, History, PieChart, HelpCircle, Compass, Map,
  Thermometer, Wind, Droplets, Sun, CloudRain, LogOut, User, Trash2,
  Download, ChevronDown, FileJson, Table, FileCode, FileText,
  Plus, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, "");
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const SidebarItem = ({ icon: Icon, label, active = false, to = '#', onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.9rem 1.5rem',
      borderRadius: '0.75rem',
      background: active ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
      color: active ? '#a78bfa' : '#94a3b8',
      cursor: 'pointer',
      marginBottom: '0.5rem',
      transition: 'all 0.2s',
      fontWeight: active ? '600' : '500',
      borderRight: active ? '3px solid #a78bfa' : 'none',
      textDecoration: 'none'
  }}>
    {Icon && <Icon size={20} />}
    <span>{label}</span>
  </Link>
);

const HistoryCard = ({ date, city, temp, cond, icon: Icon, wind, humidity, onDelete, deleting, onEdit }) => (
  <div className="glass" style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
       <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
          <Icon size={24} color="#a78bfa" />
       </div>
       <div>
          <div style={{ fontSize: '1rem', fontWeight: '700' }}>{city}</div>
       <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{date}</div>
       {cond && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{cond}</div>}
       </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
       <Thermometer size={18} color="#f87171" />
       <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{temp}°C</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
       <Wind size={18} color="#3b82f6" />
       <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{wind} km/h</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
       <Droplets size={18} color="#60a5fa" />
       <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{humidity}%</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
      <button
        type="button"
        onClick={onEdit}
        style={{
          borderRadius: '0.75rem',
          border: '1px solid rgba(167, 139, 250, 0.4)',
          background: 'transparent',
          color: '#c084fc',
          padding: '0.45rem 0.9rem',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: 'pointer'
        }}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        style={{
          borderRadius: '0.75rem',
          border: '1px solid rgba(248, 113, 113, 0.4)',
          background: 'transparent',
          color: deleting ? '#f87171' : '#fecaca',
          padding: '0.45rem 0.9rem',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: deleting ? 'not-allowed' : 'pointer'
        }}
      >
        <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  </div>
);

const HistoryPage = () => {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showRangePicker, setShowRangePicker] = React.useState(false);
  const [rangeDraft, setRangeDraft] = React.useState({ start: '', end: '' });
  const [activeRange, setActiveRange] = React.useState({ start: '', end: '' });
  const [deletingId, setDeletingId] = React.useState(null);

  const [showExportDropdown, setShowExportDropdown] = React.useState(false);
  const exportRef = React.useRef(null);

  // Add modal states for CRUD
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editRecord, setEditRecord] = React.useState(null);
  const [modalError, setModalError] = React.useState('');
  const [validatingLocation, setValidatingLocation] = React.useState(false);

  // Forms states
  const [addForm, setAddForm] = React.useState({ city: '', startDate: '', endDate: '' });
  const [editForm, setEditForm] = React.useState({ city: '', temperature: '', description: '' });

  // Geocoding and validation
  const validateLocationAndFetchCoordinates = async (cityQuery) => {
    setValidatingLocation(true);
    setModalError('');
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityQuery)}&limit=1&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to reach geocoding service.');
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error(`Location "${cityQuery}" could not be verified. Please check spelling.`);
      }
      return {
        lat: data[0].lat,
        lon: data[0].lon,
        name: `${data[0].name}${data[0].state ? ', ' + data[0].state : ''}, ${data[0].country}`
      };
    } catch (err) {
      setModalError(err.message);
      return null;
    } finally {
      setValidatingLocation(false);
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

    const coords = await validateLocationAndFetchCoordinates(city);
    if (!coords) return;

    setValidatingLocation(true);
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
      );
      if (!weatherRes.ok) {
        throw new Error('Failed to retrieve weather for location.');
      }
      const weatherData = await weatherRes.json();
      
      const payload = {
        city: coords.name,
        temperature: weatherData.main.temp,
        description: `${weatherData.weather[0].description} (Historical Scope: ${startDate} to ${endDate})`,
        date: new Date(startDate).toISOString(),
        startDate,
        endDate,
        isCustom: true
      };

      const res = await fetch(`${API_BASE_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save weather record.');
      }

      const newRecord = {
        id: data.record._id ?? data.record.id,
        city: data.record.city,
        temperature: data.record.temperature,
        description: data.record.description,
        date: data.record.date
      };
      setHistory(prev => [newRecord, ...prev]);
      setShowAddModal(false);
      setAddForm({ city: '', startDate: '', endDate: '' });
      setStatus({ type: 'success', message: 'Custom weather record saved to database.' });
    } catch (err) {
      setModalError(err.message);
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

    let verifiedCityName = city;
    if (city.trim().toLowerCase() !== editRecord.city.trim().toLowerCase()) {
      const coords = await validateLocationAndFetchCoordinates(city);
      if (!coords) return;
      verifiedCityName = coords.name;
    }

    setValidatingLocation(true);
    try {
      const payload = {
        city: verifiedCityName,
        temperature: tempNum,
        description
      };

      const res = await fetch(`${API_BASE_URL}/update/${editRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update weather record.');
      }

      setHistory(prev => prev.map(item => item.id === editRecord.id ? {
        ...item,
        city: verifiedCityName,
        temperature: tempNum,
        description
      } : item));

      setShowEditModal(false);
      setEditRecord(null);
      setStatus({ type: 'success', message: 'Weather record updated in database.' });
    } catch (err) {
      setModalError(err.message);
    } finally {
      setValidatingLocation(false);
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

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper to trigger file download
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
    setStatus({ type: 'success', message: 'History records exported as JSON.' });
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
    setStatus({ type: 'success', message: 'History records exported as CSV.' });
    setShowExportDropdown(false);
  };

  const handleExportXML = () => {
    if (filteredHistory.length === 0) {
      setStatus({ type: 'error', message: 'No records to export.' });
      return;
    }
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<history>\n';
    filteredHistory.forEach(item => {
      xmlContent += '  <record>\n';
      xmlContent += `    <id>${item.id || ''}</id>\n`;
      xmlContent += `    <city>${escapeXml(item.city || '')}</city>\n`;
      xmlContent += `    <temperature>${item.temperature !== undefined ? item.temperature : ''}</temperature>\n`;
      xmlContent += `    <description>${escapeXml(item.description || '')}</description>\n`;
      xmlContent += `    <date>${item.date || ''}</date>\n`;
      xmlContent += '  </record>\n';
    });
    xmlContent += '</history>';
    downloadFile(xmlContent, `atmos-history-${new Date().toISOString().split('T')[0]}.xml`, 'application/xml;charset=utf-8;');
    setStatus({ type: 'success', message: 'History records exported as XML.' });
    setShowExportDropdown(false);
  };

  const handleExportMarkdown = () => {
    if (filteredHistory.length === 0) {
      setStatus({ type: 'error', message: 'No records to export.' });
      return;
    }
    let mdContent = '# Atmos Historical Weather Feed\n\n';
    mdContent += `Generated on: ${new Date().toLocaleString()}\n`;
    mdContent += `Total records exported: ${filteredHistory.length}\n\n`;
    mdContent += '| City | Temperature | Description | Date / Time | Record ID |\n';
    mdContent += '| --- | --- | --- | --- | --- |\n';
    filteredHistory.forEach(item => {
      const formattedDate = item.date ? new Date(item.date).toLocaleString() : 'N/A';
      mdContent += `| **${item.city || 'N/A'}** | ${item.temperature !== undefined ? `${item.temperature}°C` : 'N/A'} | ${item.description || 'N/A'} | ${formattedDate} | \`${item.id || ''}\` |\n`;
    });
    downloadFile(mdContent, `atmos-history-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown;charset=utf-8;');
    setStatus({ type: 'success', message: 'History records exported as Markdown.' });
    setShowExportDropdown(false);
  };

  const handleExportPDF = () => {
    if (filteredHistory.length === 0) {
      setStatus({ type: 'error', message: 'No records to export.' });
      return;
    }

    try {
      const doc = new jsPDF();
      const today = new Date();
      let cursorY = 20;

      // Header Banner
      doc.setFillColor(15, 23, 42); // Navy Slate
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('ATMOS WEATHER REPORT', 20, 26);

      // Report Info details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(167, 139, 250); // Light purple color
      doc.text('HISTORICAL WEATHER FEED', 130, 26);

      // Reset text color to dark
      doc.setTextColor(30, 41, 59);
      cursorY = 55;

      // Metadata Block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Report Details', 20, cursorY);
      cursorY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated On: ${today.toLocaleString()}`, 20, cursorY);
      doc.text(`Scope: ${activeRange.start || activeRange.end ? 'Filtered Date Range' : 'All Stored History'}`, 110, cursorY);
      cursorY += 6;
      doc.text(`Records Count: ${filteredHistory.length}`, 20, cursorY);
      if (searchTerm) {
        doc.text(`Search Keyword: "${searchTerm}"`, 110, cursorY);
      }
      cursorY += 12;

      // Draw table header line
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.5);
      doc.line(20, cursorY, 190, cursorY);
      cursorY += 6;

      // Table Headers
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const colX = {
        date: 20,
        city: 65,
        temp: 110,
        cond: 130
      };

      doc.text('Date/Time', colX.date, cursorY);
      doc.text('City / Location', colX.city, cursorY);
      doc.text('Temp', colX.temp, cursorY);
      doc.text('Conditions', colX.cond, cursorY);
      
      cursorY += 4;
      doc.line(20, cursorY, 190, cursorY);
      cursorY += 6;

      // Reset to body styling
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);

      filteredHistory.forEach((item) => {
        if (cursorY > 270) {
          doc.addPage();
          cursorY = 25;
          
          // Reprint header on new page
          doc.setFont('helvetica', 'bold');
          doc.text('Date/Time', colX.date, cursorY);
          doc.text('City / Location', colX.city, cursorY);
          doc.text('Temp', colX.temp, cursorY);
          doc.text('Conditions', colX.cond, cursorY);
          cursorY += 4;
          doc.line(20, cursorY, 190, cursorY);
          cursorY += 6;
          doc.setFont('helvetica', 'normal');
        }

        const formattedDate = item.date ? new Date(item.date).toLocaleString() : 'N/A';
        const cityStr = item.city || 'N/A';
        const tempStr = item.temperature !== undefined ? `${Math.round(item.temperature)}°C` : '--°C';
        const condStr = item.description || 'N/A';

        doc.text(formattedDate, colX.date, cursorY);
        doc.text(cityStr, colX.city, cursorY);
        doc.text(tempStr, colX.temp, cursorY);
        doc.text(condStr, colX.cond, cursorY);
        
        cursorY += 8;
      });

      doc.save(`atmos-history-${today.toISOString().split('T')[0]}.pdf`);
      setStatus({ type: 'success', message: 'History records exported as PDF.' });
      setShowExportDropdown(false);
    } catch (error) {
      console.error('PDF export failed:', error);
      setStatus({ type: 'error', message: 'Failed to export history to PDF.' });
    }
  };

  React.useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/records`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.records) {
          const normalized = [...data.records].reverse().map((entry) => ({
            id: entry._id ?? entry.id,
            city: entry.city,
            temperature: entry.temperature,
            description: entry.description,
            date: entry.date
          }));
          setHistory(normalized);
        }
      })
      .catch(() => {
        setStatus({ type: 'error', message: 'Unable to load history records. Please try again.' });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredHistory = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
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
  }, [history, searchTerm, activeRange]);

  const handleDeleteRecord = async (recordId) => {
    if (!recordId) return;
    setDeletingId(recordId);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${recordId}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete record');
      }
      setHistory((prev) => prev.filter((item) => item.id !== recordId));
      setStatus({ type: 'success', message: 'Record deleted from history.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Unable to delete that record.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleApplyRange = () => {
    if (rangeDraft.start && rangeDraft.end && rangeDraft.start > rangeDraft.end) {
      setStatus({ type: 'error', message: 'Start date must be on or before the end date.' });
      return;
    }
    setActiveRange({ ...rangeDraft });
    setShowRangePicker(false);
    if (rangeDraft.start || rangeDraft.end) {
      setStatus({ type: 'success', message: 'Date range applied to history.' });
    } else {
      setStatus({ type: '', message: '' });
    }
  };

  const handleClearRange = () => {
    setRangeDraft({ start: '', end: '' });
    setActiveRange({ start: '', end: '' });
    setStatus({ type: '', message: '' });
    setShowRangePicker(false);
  };

  const toggleRangePicker = () => {
    if (!showRangePicker) {
      setRangeDraft({ ...activeRange });
    }
    setShowRangePicker((prev) => !prev);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#02040a',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid #1e293b',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', marginBottom: '3rem', textDecoration: 'none', color: 'white' }}>
          <div style={{ width: '32px', height: '32px', background: '#a78bfa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Compass color="white" size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Outfit', margin: 0 }}>Atmos</h1>
            <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600', margin: 0 }}>MIDNIGHT LUSTER V2</p>
          </div>
        </Link>

        <div style={{ flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          <SidebarItem icon={History} label="History" active to="/history" />
          <SidebarItem icon={Bell} label="Alerts" to="/alerts" />
          <SidebarItem icon={User} label="Profile" to="/profile" />
        </div>

        <div>
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
          <SidebarItem icon={HelpCircle} label="Support" to="/support" />
          <SidebarItem icon={LogOut} label="Logout" onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userProfile');
            window.location.href = '/login';
          }} />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 4rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
           <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
                <input 
                  type="text" 
                  placeholder="Filter records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '99px',
                    padding: '0.6rem 1rem 0.6rem 2.8rem',
                    color: 'white',
                    outline: 'none',
                    width: '200px'
                  }}
                />
              </div>
           </div>
        </header>

        {status.message && (
          <div style={{
            borderRadius: '0.85rem',
            padding: '0.85rem 1rem',
            border: status.type === 'error' ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
            background: status.type === 'error' ? 'rgba(69, 10, 10, 0.45)' : 'rgba(6, 47, 25, 0.45)',
            color: status.type === 'error' ? '#fecaca' : '#bbf7d0'
          }}>
            {status.message}
          </div>
        )}

        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
             <div>
                <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>Historical Feed</h1>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>Review past Atmos phenomena and trend patterns.</p>
                {(activeRange.start || activeRange.end) && (
                  <p style={{ color: '#a78bfa', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Showing results {activeRange.start ? `from ${activeRange.start}` : ''}
                    {activeRange.start && activeRange.end ? ' ' : ''}
                    {activeRange.end ? `through ${activeRange.end}` : ''}
                  </p>
                )}
             </div>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <button
                 type="button"
                 onClick={() => {
                   setAddForm({ city: '', startDate: '', endDate: '' });
                   setModalError('');
                   setShowAddModal(true);
                 }}
                 style={{
                   background: '#10b981',
                   color: 'white',
                   border: 'none',
                   padding: '0.75rem 1.5rem',
                   borderRadius: '12px',
                   fontWeight: '600',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem',
                   cursor: 'pointer',
                   boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                   transition: 'all 0.2s'
                 }}
               >
                 <Plus size={18} /> Add Record
               </button>

               <div style={{ position: 'relative' }}>
                 <button
                   type="button"
                   onClick={toggleRangePicker}
                   style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                 >
                    <Calendar size={18} /> {(activeRange.start || activeRange.end) ? 'Adjust Range' : 'Select Range'}
                 </button>
                 {showRangePicker && (
                   <div style={{ position: 'absolute', right: 0, marginTop: '0.75rem', background: '#020617', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.25rem', width: '280px', boxShadow: '0 20px 40px rgba(2, 8, 23, 0.65)', zIndex: 10 }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>FROM</label>
                       <input
                         type="date"
                         value={rangeDraft.start}
                         onChange={(e) => setRangeDraft((prev) => ({ ...prev, start: e.target.value }))}
                         style={{
                           background: '#0f172a',
                           border: '1px solid #1e293b',
                           borderRadius: '0.75rem',
                           padding: '0.65rem 0.9rem',
                           color: 'white'
                         }}
                       />
                       <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>TO</label>
                       <input
                         type="date"
                         value={rangeDraft.end}
                         onChange={(e) => setRangeDraft((prev) => ({ ...prev, end: e.target.value }))}
                         style={{
                           background: '#0f172a',
                           border: '1px solid #1e293b',
                           borderRadius: '0.75rem',
                           padding: '0.65rem 0.9rem',
                           color: 'white'
                         }}
                       />
                       <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.5rem' }}>
                         <button
                           type="button"
                           onClick={handleClearRange}
                           style={{
                             flex: 1,
                             background: 'transparent',
                             border: '1px solid #334155',
                             borderRadius: '0.75rem',
                             color: '#cbd5f5',
                             padding: '0.55rem 0.85rem',
                             cursor: 'pointer'
                           }}
                         >
                           Clear
                         </button>
                         <button
                           type="button"
                           onClick={handleApplyRange}
                           style={{
                             flex: 1,
                             background: '#a78bfa',
                             border: 'none',
                             borderRadius: '0.75rem',
                             color: 'white',
                             fontWeight: '600',
                             padding: '0.55rem 0.85rem',
                             cursor: 'pointer'
                           }}
                         >
                           Apply
                         </button>
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Export Dropdown */}
               <div ref={exportRef} style={{ position: 'relative' }}>
                 <button
                   type="button"
                   onClick={() => setShowExportDropdown(prev => !prev)}
                   style={{
                     background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                     color: 'white',
                     border: 'none',
                     padding: '0.75rem 1.5rem',
                     borderRadius: '12px',
                     fontWeight: '600',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     cursor: 'pointer',
                     boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                     transition: 'all 0.2s'
                   }}
                 >
                   <Download size={18} /> Export Feed ({filteredHistory.length})
                   <ChevronDown size={14} style={{ transform: showExportDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                 </button>
                 {showExportDropdown && (
                   <div style={{
                     position: 'absolute',
                     right: 0,
                     marginTop: '0.75rem',
                     background: '#020617',
                     border: '1px solid #1e293b',
                     borderRadius: '1rem',
                     padding: '0.5rem 0',
                     width: '210px',
                     boxShadow: '0 20px 40px rgba(2, 8, 23, 0.65)',
                     zIndex: 10
                   }}>
                     <button
                       type="button"
                       onClick={handleExportJSON}
                       style={{
                         width: '100%',
                         textAlign: 'left',
                         background: 'transparent',
                         border: 'none',
                         color: '#e2e8f0',
                         padding: '0.75rem 1.25rem',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.75rem',
                         transition: 'background 0.2s',
                         fontSize: '0.9rem'
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                     >
                       <FileJson size={16} color="#38bdf8" /> Export as JSON
                     </button>
                     <button
                       type="button"
                       onClick={handleExportCSV}
                       style={{
                         width: '100%',
                         textAlign: 'left',
                         background: 'transparent',
                         border: 'none',
                         color: '#e2e8f0',
                         padding: '0.75rem 1.25rem',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.75rem',
                         transition: 'background 0.2s',
                         fontSize: '0.9rem'
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                     >
                       <Table size={16} color="#34d399" /> Export as CSV (Comma)
                     </button>
                     <button
                       type="button"
                       onClick={handleExportXML}
                       style={{
                         width: '100%',
                         textAlign: 'left',
                         background: 'transparent',
                         border: 'none',
                         color: '#e2e8f0',
                         padding: '0.75rem 1.25rem',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.75rem',
                         transition: 'background 0.2s',
                         fontSize: '0.9rem'
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                     >
                       <FileCode size={16} color="#fca5a5" /> Export as XML
                     </button>
                     <button
                       type="button"
                       onClick={handleExportMarkdown}
                       style={{
                         width: '100%',
                         textAlign: 'left',
                         background: 'transparent',
                         border: 'none',
                         color: '#e2e8f0',
                         padding: '0.75rem 1.25rem',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.75rem',
                         transition: 'background 0.2s',
                         fontSize: '0.9rem'
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                     >
                       <FileText size={16} color="#fb7185" /> Export as Markdown
                     </button>
                     <button
                       type="button"
                       onClick={handleExportPDF}
                       style={{
                         width: '100%',
                         textAlign: 'left',
                         background: 'transparent',
                         border: 'none',
                         color: '#e2e8f0',
                         padding: '0.75rem 1.25rem',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.75rem',
                         transition: 'background 0.2s',
                         fontSize: '0.9rem'
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                     >
                       <FileText size={16} color="#a78bfa" /> Export as PDF Report
                     </button>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
           {loading ? (
             <p style={{ color: '#64748b' }}>Loading your history...</p>
           ) : filteredHistory.length > 0 ? (
             filteredHistory.map(item => (
               <HistoryCard 
                 key={item.id}
                 date={item.date ? new Date(item.date).toLocaleString() : 'Unknown date'} 
                 city={item.city || 'Unknown location'}
                 temp={Number.isFinite(item.temperature) ? Math.round(item.temperature) : '--'} 
                 cond={item.description} 
                 icon={Sun} 
                 wind={item.wind_speed ?? 0} 
                 humidity={item.humidity ?? 0} 
                 onDelete={() => handleDeleteRecord(item.id)}
                 deleting={deletingId === item.id}
                 onEdit={() => openEditModal(item)}
               />
             ))
           ) : (
             <p style={{ color: '#64748b' }}>No search history matches the current filters.</p>
           )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}>
            <div className="glass" style={{
              width: '100%',
              maxWidth: '500px',
              padding: '2.5rem',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
              position: 'relative'
            }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>Add Custom Record</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Store a verified historical weather record in the database.</p>

              {modalError && (
                <div style={{
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  background: 'rgba(69, 10, 10, 0.45)',
                  color: '#fecaca',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreateRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>CITY / LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Nagpur, London, Paris..."
                    value={addForm.city}
                    onChange={(e) => setAddForm(prev => ({ ...prev, city: e.target.value }))}
                    disabled={validatingLocation}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '0.75rem',
                      padding: '0.65rem 0.9rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>START DATE</label>
                    <input
                      type="date"
                      value={addForm.startDate}
                      onChange={(e) => setAddForm(prev => ({ ...prev, startDate: e.target.value }))}
                      disabled={validatingLocation}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '0.75rem',
                        padding: '0.65rem 0.9rem',
                        color: 'white',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>END DATE</label>
                    <input
                      type="date"
                      value={addForm.endDate}
                      onChange={(e) => setAddForm(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={validatingLocation}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '0.75rem',
                        padding: '0.65rem 0.9rem',
                        color: 'white',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={validatingLocation}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    cursor: validatingLocation ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {validatingLocation ? 'Verifying & Saving...' : 'Save Weather Record'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editRecord && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}>
            <div className="glass" style={{
              width: '100%',
              maxWidth: '500px',
              padding: '2.5rem',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
              position: 'relative'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditRecord(null);
                }}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>Edit Weather Record</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Update the persisted weather details in the database.</p>

              {modalError && (
                <div style={{
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  background: 'rgba(69, 10, 10, 0.45)',
                  color: '#fecaca',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleUpdateRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>CITY / LOCATION</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    disabled={validatingLocation}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '0.75rem',
                      padding: '0.65rem 0.9rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>TEMPERATURE (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.temperature}
                    onChange={(e) => setEditForm(prev => ({ ...prev, temperature: e.target.value }))}
                    disabled={validatingLocation}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '0.75rem',
                      padding: '0.65rem 0.9rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>WEATHER CONDITIONS</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    disabled={validatingLocation}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '0.75rem',
                      padding: '0.65rem 0.9rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={validatingLocation}
                  style={{
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    cursor: validatingLocation ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {validatingLocation ? 'Verifying & Saving...' : 'Save Updates'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
