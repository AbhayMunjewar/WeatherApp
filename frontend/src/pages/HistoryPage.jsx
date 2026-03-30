import React from 'react';
import {
  Bell, Settings, ShieldAlert,
  MapPin, Clock, Calendar, Star, ChevronRight,
  Search, CloudLightning, Globe, Zap, Navigation,
  LayoutDashboard, History, PieChart, HelpCircle, Compass, Map,
  Thermometer, Wind, Droplets, Sun, CloudRain, LogOut, User, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, "");

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

const HistoryCard = ({ date, city, temp, cond, icon: Icon, wind, humidity, onDelete, deleting }) => (
  <div className="glass" style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.6fr)', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
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
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
               />
             ))
           ) : (
             <p style={{ color: '#64748b' }}>No search history matches the current filters.</p>
           )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
