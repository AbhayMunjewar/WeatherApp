import React from 'react';
import { 
  Bell, ShieldAlert, Sun,
  Search, Filter, Loader2,
  ChevronRight, MapPin,
  LayoutDashboard, History, HelpCircle, Compass, Settings, LogOut, User,
  BookmarkPlus, BookmarkMinus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, "");

const ALERT_STORAGE_KEY = 'followedRegions';
const LAST_LOCATION_KEY = 'lastAlertLocation';
const LAST_FETCH_PARAMS_KEY = 'lastAlertFetchParams';
const DEFAULT_ALERT_LOCATION = 'San Francisco';
const severityColorMap = {
  extreme: '#ef4444',
  severe: '#f97316',
  high: '#f87171',
  moderate: '#fbbf24',
  minor: '#3b82f6',
  info: '#6366f1'
};

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

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just updated';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const AlertCard = ({ type, title, description, timeLabel, regions = [], color, source }) => (
  <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ padding: '0.5rem', background: `${color}15`, borderRadius: '8px' }}>
          <ShieldAlert size={24} color={color} />
        </div>
        <div>
          <span style={{ fontSize: '0.65rem', color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{type}</span>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{timeLabel}</div>
        </div>
      </div>
      <span style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
        VIEW MORE <ChevronRight size={14} />
      </span>
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>{title}</h3>
    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.5rem' }}>{description}</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
       {regions.length > 0 ? regions.map((loc, idx) => {
         const label = typeof loc === 'string' ? loc : (loc?.name || loc?.region || `Region ${idx + 1}`);
         return (
           <span key={`${label}-${idx}`} style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', background: '#02040a', borderRadius: '4px', border: '1px solid #1e293b', color: '#94a3b8', fontWeight: '700' }}>{label.toUpperCase()}</span>
         );
       }) : (
         <span style={{ fontSize: '0.65rem', color: '#475569' }}>No specific region listed</span>
       )}
    </div>
    {source && (
      <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '1rem' }}>
        Source: {source}
      </div>
    )}
  </div>
);

const AlertsPage = () => {
  const [alerts, setAlerts] = React.useState([]);
  const [activeLocation, setActiveLocation] = React.useState(DEFAULT_ALERT_LOCATION);
  const [resolvedLocation, setResolvedLocation] = React.useState(null);
  const [searchValue, setSearchValue] = React.useState('');
  const [status, setStatus] = React.useState({ type: '', message: '' });
  const [loading, setLoading] = React.useState(false);
  const [followedRegions, setFollowedRegions] = React.useState([]);
  const [manualOverride, setManualOverride] = React.useState(false);
  const latestRequestId = React.useRef(0);
  const lastFetchParams = React.useRef(null);
  const lastCoords = React.useRef(null);

  const fetchAlerts = React.useCallback(async ({ locationName, coords, persistLocation = true } = {}) => {
    if (!locationName && !coords) return;
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const query = coords
        ? `latitude=${coords.latitude}&longitude=${coords.longitude}`
        : `location=${encodeURIComponent(locationName)}`;
      const response = await fetch(`${API_BASE_URL}/alerts?${query}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to load alerts.');
      }
      if (requestId !== latestRequestId.current) {
        return;
      }
      setAlerts(payload.alerts || []);
      setResolvedLocation(payload.location);
      const resolvedName = payload.location?.name;
      const normalizedLabel = resolvedName || locationName || 'Current Location';
      setActiveLocation(normalizedLabel);
      
      if (coords) {
        lastCoords.current = coords;
      }
      
      if (persistLocation) {
        lastFetchParams.current = { locationName, coords };
        try {
          localStorage.setItem(LAST_FETCH_PARAMS_KEY, JSON.stringify({ locationName, coords }));
        } catch (storageErr) {
          console.warn('Failed to persist fetch params', storageErr);
        }
      }
      if ((payload.alerts || []).length === 0) {
        const target = resolvedName || locationName || 'this location';
        setStatus({ type: 'info', message: `No active alerts reported for ${target}.` });
      }
    } catch (err) {
      if (requestId !== latestRequestId.current) {
        return;
      }
      setStatus({ type: 'error', message: err.message || 'Failed to fetch alerts.' });
      setAlerts([]);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    const initializeAlerts = () => {
      let storedRegions = [];
      try {
        const stored = JSON.parse(localStorage.getItem(ALERT_STORAGE_KEY) || '[]');
        if (Array.isArray(stored)) {
          storedRegions = stored;
          if (stored.length) {
            setFollowedRegions(stored);
          }
        }
      } catch (err) {
        console.error('Failed to load followed regions', err);
      }

      const rawFetchParams = localStorage.getItem(LAST_FETCH_PARAMS_KEY);
      if (rawFetchParams) {
        try {
          const params = JSON.parse(rawFetchParams);
          if (params.coords && typeof params.coords.latitude === 'number' && typeof params.coords.longitude === 'number') {
            lastFetchParams.current = params;
            setActiveLocation('Current Location');
            fetchAlerts({ coords: params.coords, persistLocation: false });
            return;
          }
          if (params.locationName) {
            lastFetchParams.current = params;
            setActiveLocation(params.locationName);
            fetchAlerts({ locationName: params.locationName, persistLocation: false });
            return;
          }
        } catch (err) {
          console.error('Failed to parse stored fetch params', err);
        }
      }

      const rawLastLocation = localStorage.getItem(LAST_LOCATION_KEY);
      if (rawLastLocation) {
        try {
          const fallbackFromOldFormat = JSON.parse(rawLastLocation);
          if (typeof fallbackFromOldFormat === 'string') {
            setActiveLocation(fallbackFromOldFormat);
            fetchAlerts({ locationName: fallbackFromOldFormat, persistLocation: false });
            return;
          }
        } catch (err) {
          if (typeof rawLastLocation === 'string' && rawLastLocation.trim()) {
            setActiveLocation(rawLastLocation);
            fetchAlerts({ locationName: rawLastLocation, persistLocation: false });
            return;
          }
        }
      }

      const initialLocation = storedRegions.length ? storedRegions[0] : DEFAULT_ALERT_LOCATION;
      setActiveLocation(initialLocation);
      fetchAlerts({ locationName: initialLocation, persistLocation: false });
    };

    initializeAlerts();
  }, [fetchAlerts]);

  React.useEffect(() => {
    if (!navigator.geolocation) return;
    if (manualOverride) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchAlerts({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
      },
      (error) => {
        console.warn('Geolocation error', error);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, [fetchAlerts, manualOverride]);

  const persistFollowedRegions = (next) => {
    setFollowedRegions(next);
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(next));
  };
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      setManualOverride(true);
      setActiveLocation(trimmed);
      fetchAlerts({ locationName: trimmed });
    }
  };

  const handleFollowCurrent = () => {
    const label = resolvedLocation?.name;
    if (!label || label === 'Current Location') {
      setStatus({ type: 'error', message: 'Unable to determine the current location name. Please search for a specific city.' });
      return;
    }
    if (followedRegions.includes(label)) {
      setStatus({ type: 'info', message: `${label} is already in your followed list.` });
      return;
    }
    const next = [label, ...followedRegions];
    persistFollowedRegions(next);
    setStatus({ type: 'success', message: `${label} saved to followed regions.` });
  };

  const handleRemoveFollowed = (label) => {
    const next = followedRegions.filter((item) => item !== label);
    persistFollowedRegions(next);
    if (label === activeLocation) {
      const fallback = next[0] || DEFAULT_ALERT_LOCATION;
      setActiveLocation(fallback);
      fetchAlerts({ locationName: fallback, persistLocation: false });
    }
  };

  const handleSelectFollowed = (label) => {
    setManualOverride(true);
    setActiveLocation(label);
    fetchAlerts({ locationName: label });
  };

  const heroAlert = alerts[0];
  const heroColor = severityColorMap[heroAlert?.severity] || '#f87171';

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
          <SidebarItem icon={History} label="History" to="/history" />
          <SidebarItem icon={Bell} label="Alerts" active to="/alerts" />
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
      <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
           <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', color: '#94a3b8', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
                <input 
                  type="text" 
                  placeholder="Search location..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '99px',
                    padding: '0.6rem 1rem 0.6rem 2.8rem',
                    color: 'white',
                    outline: 'none',
                    width: '220px'
                  }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.25rem', borderRadius: '999px' }}>
                Track
              </button>
           </form>
        </header>

        {status.message && (
          <div style={{
            borderRadius: '0.85rem',
            padding: '0.85rem 1rem',
            border: status.type === 'error' ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
            background: status.type === 'error' ? 'rgba(69, 10, 10, 0.45)' : 'rgba(15, 23, 42, 0.55)',
            color: status.type === 'error' ? '#fecaca' : '#bfdbfe'
          }}>
            {status.message}
          </div>
        )}

        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderRadius: '999px',
            padding: '0.6rem 1rem',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            background: 'rgba(15, 23, 42, 0.65)',
            color: '#bfdbfe',
            width: 'fit-content'
          }}>
            <Loader2 className="animate-spin" size={18} /> Fetching latest alerts...
          </div>
        )}

        {/* Hero Alert */}
        <section style={{ 
          background: 'radial-gradient(ellipse at center, rgba(153, 27, 27, 0.4) 0%, rgba(2, 4, 10, 0) 70%)',
          padding: '4rem',
          borderRadius: '2rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          marginBottom: '3rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ef4444',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '700',
            marginBottom: '2rem'
          }}>
            <ShieldAlert size={14} /> {(heroAlert?.severity || 'Info').toUpperCase()} WARNING
            <span style={{ fontWeight: '400', opacity: 0.8, marginLeft: '0.5rem' }}>{formatRelativeTime(heroAlert?.start)}</span>
          </div>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: '700', lineHeight: '1.1', maxWidth: '800px', marginBottom: '1.5rem' }}>
            {heroAlert ? heroAlert.event : 'No active alerts'} <br/>
            <span style={{ color: heroColor }}>{resolvedLocation?.name || activeLocation}</span>
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '700px', lineHeight: '1.6', marginBottom: '3rem' }}>
            {heroAlert ? heroAlert.description : 'We will notify you as soon as new advisories are published for this region. Try tracking another city to see localized warnings.'}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
             <button className="btn-primary" style={{ background: '#ef4444', border: 'none', padding: '1rem 2rem' }} onClick={handleFollowCurrent}>
               <BookmarkPlus size={18} /> Follow Region
             </button>
             <button className="btn-secondary" style={{ padding: '1rem 2rem' }} onClick={() => {
               if (lastCoords.current) {
                 fetchAlerts({ coords: lastCoords.current, persistLocation: false });
               } else if (resolvedLocation?.name && resolvedLocation.name !== 'Current Location') {
                 fetchAlerts({ locationName: resolvedLocation.name, persistLocation: false });
               } else if (activeLocation && activeLocation !== 'Current Location') {
                 fetchAlerts({ locationName: activeLocation, persistLocation: false });
               }
             }}>
               {loading ? <Loader2 className="animate-spin" size={18} /> : 'Refresh Alerts'}
             </button>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '3rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                 Active Advisories {resolvedLocation?.name ? `for ${resolvedLocation.name}` : ''}
               </h2>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                  {alerts.length} alerts <Filter size={16} />
               </div>
            </div>

            {loading ? (
              <p style={{ color: '#64748b' }}>Pulling the latest alert feed...</p>
            ) : alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <AlertCard
                  key={`${alert.event}-${index}`}
                  type={alert.severity || 'Info'}
                  title={alert.event || 'Weather Alert'}
                  description={alert.description || 'Refer to local authority guidance for more details.'}
                  timeLabel={`Updated ${formatRelativeTime(alert.start)}`}
                  regions={alert.regions || []}
                  color={severityColorMap[alert.severity] || '#94a3b8'}
                  source={alert.source}
                />
              ))
            ) : (
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed #1e293b' }}>
                <p style={{ color: '#94a3b8' }}>No alerts at this moment. Track another place or refresh.</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={18} color="#3b82f6" /> Followed Regions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {followedRegions.length > 0 ? followedRegions.map((region) => (
                    <div key={region} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e293b', borderRadius: '0.85rem', padding: '0.75rem 1rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectFollowed(region)}
                        style={{ background: 'transparent', border: 'none', textAlign: 'left', color: 'white', fontWeight: region === activeLocation ? '700' : '500', cursor: 'pointer' }}
                      >
                        {region}
                        {region === activeLocation && <span style={{ marginLeft: '0.5rem', color: '#22d3ee', fontSize: '0.75rem' }}>active</span>}
                      </button>
                      <button type="button" onClick={() => handleRemoveFollowed(region)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                        <BookmarkMinus size={16} />
                      </button>
                    </div>
                  )) : (
                    <p style={{ color: '#64748b' }}>Follow a location to pin it here for one-tap monitoring.</p>
                  )}
                </div>
                <button style={{ width: '100%', marginTop: '2rem', background: '#1e293b', border: 'none', padding: '0.85rem', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '0.85rem' }} onClick={handleFollowCurrent}>
                  <BookmarkPlus size={16} /> Save Current Region
                </button>
             </div>

             <div className="glass" style={{ padding: '2.5rem', position: 'relative' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>48-Hour Outlook</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', marginBottom: '2rem' }}>
                   Active front will push through by early morning tomorrow, followed by significantly cooler temperatures and clearing skies. High pressure builds in for a calm weekend.
                </p>
                <div style={{ display: 'flex', gap: '2rem' }}>
                   <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>PRECIP.</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>85%</div>
                   </div>
                   <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>WIND GUSTS</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>45 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>mph</span></div>
                   </div>
                </div>
                <Sun size={60} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', top: '1rem', right: '1rem' }} />
             </div>

             <div style={{ 
               height: '240px', 
               background: 'url("https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=800&auto=format&fit=crop")', 
               backgroundSize: 'cover',
               borderRadius: '1.5rem',
               position: 'relative',
               overflow: 'hidden'
             }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                <span style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'rgba(0,0,0,0.8)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.2)' }}>
                  LIVE SAT MAP
                </span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlertsPage;
