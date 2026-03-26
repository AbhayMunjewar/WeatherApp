import React, { useEffect, useMemo, useState } from 'react';
import {
  User, Bell, Settings, Edit2, ShieldAlert,
  MapPin, Clock, Calendar, Star, ChevronRight,
  Search, CloudLightning, Globe, Zap, Navigation,
  LayoutDashboard, History, PieChart, HelpCircle, Compass, Map, LogOut, Loader2,
  Plus, X, Trash2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
const PIN_STORAGE_KEY = 'pinnedLocations';

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

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [pinnedLocations, setPinnedLocations] = useState([]);
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPinCity, setNewPinCity] = useState('');
  const [pinStatus, setPinStatus] = useState({ type: '', message: '' });
  const [pinLoading, setPinLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [suggestedLocation, setSuggestedLocation] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) setUserProfile(JSON.parse(stored));
    } catch (err) {
      console.error('Unable to read stored profile', err);
    }
  }, []);

  useEffect(() => {
    try {
      const storedPins = localStorage.getItem(PIN_STORAGE_KEY);
      if (storedPins) {
        const parsed = JSON.parse(storedPins);
        if (Array.isArray(parsed)) {
          setPinnedLocations(parsed);
        }
      }
    } catch (err) {
      console.error('Unable to read pinned locations', err);
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        setHistoryError('');
        const response = await fetch(`${API_BASE_URL}/records`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Unable to load recent records.');
        }
        const payload = await response.json();
        const records = Array.isArray(payload.records) ? payload.records : [];
        if (records.length > 0) {
          const latest = records[0];
          setSuggestedLocation({
            city: latest.city,
            description: latest.description,
            temperature: latest.temperature,
            date: latest.date,
          });
        } else {
          setSuggestedLocation(null);
        }
        const timeline = records.slice(0, 3).map((record, index) => ({
          id: `${record._id}-${index}`,
          title: `Saved forecast for ${record.city}`,
          timestamp: new Date(record.date).toLocaleString(),
          details: `Captured ${Math.round(record.temperature)} °C with "${record.description}" conditions.`,
          accent: index === 0 ? '#a78bfa' : '#64748b'
        }));
        setActivities(timeline);
      } catch (err) {
        setHistoryError(err.message);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const persistPinnedLocations = (next) => {
    setPinnedLocations(next);
    try {
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error('Unable to write pinned locations', err);
    }
  };

  const resetPinStatus = () => setPinStatus({ type: '', message: '' });

  const handleAddPinnedLocation = async (e) => {
    e.preventDefault();
    resetPinStatus();
    const cityInput = newPinCity.trim();
    if (!cityInput) {
      setPinStatus({ type: 'error', message: 'Please provide a city name.' });
      return;
    }
    try {
      setPinLoading(true);
      const response = await fetch(`${API_BASE_URL}/weather/${encodeURIComponent(cityInput)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to fetch weather for that city.');
      }
      const entry = {
        id: (globalThis.crypto?.randomUUID?.() || String(Date.now())),
        city: data.city,
        description: data.description,
        temperature: data.temperature,
        date: data.date,
      };
      persistPinnedLocations([entry, ...pinnedLocations.filter((loc) => loc.city !== entry.city)]);
      setPinStatus({ type: 'success', message: `${entry.city} pinned to your profile.` });
      setNewPinCity('');
      setShowPinForm(false);
    } catch (err) {
      setPinStatus({ type: 'error', message: err.message || 'Unable to pin location.' });
    } finally {
      setPinLoading(false);
    }
  };

  const handleUnpinLocation = (locationId) => {
    const next = pinnedLocations.filter((loc) => loc.id !== locationId);
    persistPinnedLocations(next);
  };

  const avatarUrl = useMemo(() => {
    const nameForAvatar = userProfile?.name || 'Atmos User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=a78bfa&color=fff`;
  }, [userProfile?.name]);

  const membershipLabel = userProfile?.created_at
    ? `Member since ${new Date(userProfile.created_at).toLocaleDateString()}`
    : 'Active Member';

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
          <SidebarItem icon={Bell} label="Alerts" to="/alerts" />
          <SidebarItem icon={User} label="Profile" active to="/profile" />
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
           <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
                <input 
                  type="text" 
                  placeholder="Search..."
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
              <div 
                style={{ width: '32px', height: '32px', background: '#e2e8f0', borderRadius: '50%', overflow: 'hidden', border: '2px solid #a78bfa' }}
              >
                  <img src={avatarUrl} alt="Profile" />
              </div>
           </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 350px) minmax(0, 1fr)', gap: '3rem' }}>
          {/* Left Column: User Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1.5rem auto' }}>
                <img 
                  src={avatarUrl}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6' }} 
                />
                <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#3b82f6', borderRadius: '50%', padding: '4px' }}>
                  <ShieldAlert size={16} color="white" />
                </div>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>{userProfile?.name || 'Atmos Explorer'}</h1>
              <p style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.75rem' }}>{membershipLabel.toUpperCase()}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{userProfile?.email || 'Connect an email via Settings'}</p>
              
              <button 
                className="btn-primary" 
                style={{ width: '100%', background: '#a78bfa', color: 'white', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}
              >
                <Edit2 size={16} /> Edit Profile
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2rem 1rem 0 1rem' }}>
                {[{label:'Saved Cities', value: activities.length}, {label:'Pinned Spots', value: pinnedLocations.length}, {label:'Alerts', value: 0}].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600' }}>{stat.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={18} color="#3b82f6" /> Pinned Locations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => { setShowPinForm((prev) => !prev); resetPinStatus(); }}
                  style={{ 
                    padding: '0.85rem',
                    borderRadius: '0.85rem',
                    border: '1px dashed #1e293b',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} /> {showPinForm ? 'Cancel' : 'Add New Location'}
                </button>

                {showPinForm && (
                  <form onSubmit={handleAddPinnedLocation} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '1px' }}>CITY OR ZIP</label>
                    <input
                      type="text"
                      value={newPinCity}
                      onChange={(e) => setNewPinCity(e.target.value)}
                      placeholder="e.g. Lisbon, PT"
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '0.75rem',
                        padding: '0.85rem 1rem',
                        color: 'white',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={pinLoading}
                      className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: pinLoading ? 0.85 : 1 }}
                    >
                      {pinLoading && <Loader2 className="animate-spin" size={18} />}
                      Pin Location
                    </button>
                  </form>
                )}

                {pinStatus.message && (
                  <div style={{
                    borderRadius: '0.85rem',
                    padding: '0.85rem 1rem',
                    border: pinStatus.type === 'error' ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                    background: pinStatus.type === 'error' ? 'rgba(69, 10, 10, 0.4)' : 'rgba(5, 46, 22, 0.4)',
                    color: pinStatus.type === 'error' ? '#fecaca' : '#bbf7d0'
                  }}>
                    {pinStatus.message}
                  </div>
                )}

                {pinnedLocations.length > 0 ? (
                  pinnedLocations.map((loc) => (
                    <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#02040a', borderRadius: '1rem', border: '1px solid #1e293b', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Navigation size={20} color="#60a5fa" />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{loc.city}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {Number.isFinite(loc.temperature) ? `${Math.round(loc.temperature)} °C` : 'N/A'} · {loc.description || 'No description'}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.2rem' }}>
                            Last updated {loc.date ? new Date(loc.date).toLocaleString() : 'recently'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnpinLocation(loc.id)}
                        style={{
                          border: '1px solid rgba(248, 113, 113, 0.4)',
                          color: '#fecaca',
                          background: 'transparent',
                          borderRadius: '0.75rem',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <X size={14} /> Unpin
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', borderRadius: '1rem', border: '1px dashed #1e293b', color: '#94a3b8', textAlign: 'center' }}>
                    {suggestedLocation ? (
                      <>Pin your latest search ({suggestedLocation.city}) to access it faster.</>
                    ) : (
                      <>You have not pinned any locations yet. Use "Add New Location" to get started.</>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Activity & Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
              <div className="glass" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CloudLightning color="#ef4444" size={24} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>ACTIVE NOW</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginTop: '1.5rem' }}>Severe Storm Warning</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem', lineHeight: '1.5' }}>
                  High wind gusts expected in the Northern Coast area over the next 12 hours.
                </p>
                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                   View Warning Details <ChevronRight size={16} />
                </div>
              </div>

              <div className="glass" style={{ padding: '2.5rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(225deg, rgba(30, 27, 75, 0.4), rgba(2, 4, 10, 0.4))' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star color="#3b82f6" fill="#3b82f6" size={20} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginTop: '1.5rem' }}>Atmos Pro</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem', lineHeight: '1.5' }}>
                  Your subscription is active until Dec 2024. Thank you for being a part of the night sky.
                </p>
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px' }}>
                     <div style={{ width: '80%', height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', marginTop: '0.5rem' }}>284 DAYS REMAINING</div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '2.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock size={22} color="#a78bfa" /> Recent Activity
                  </h3>
                  <span
                    onClick={() => navigate('/history')}
                    style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700', cursor: 'pointer' }}
                  >
                    VIEW HISTORY
                  </span>
               </div>

               {loadingHistory ? (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                   <Loader2 className="animate-spin" size={20} />
                   Loading your latest weather saves...
                 </div>
               ) : historyError ? (
                 <div style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(248, 113, 113, 0.3)', background: 'rgba(69, 10, 10, 0.4)', color: '#fecaca' }}>
                   {historyError}
                 </div>
               ) : activities.length === 0 ? (
                 <div style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px dashed #1e293b', textAlign: 'center', color: '#94a3b8' }}>
                   You have not saved any locations yet. Head to the dashboard and search for a city to start tracking.
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   {activities.map((activity) => (
                     <div key={activity.id} style={{ display: 'flex', gap: '1.5rem' }}>
                       <div style={{ width: '12px', height: '12px', background: activity.accent, borderRadius: '50%', marginTop: '0.4rem', boxShadow: `0 0 10px ${activity.accent}` }} />
                       <div>
                          <div style={{ fontWeight: '600' }}>{activity.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{activity.timestamp}</div>
                          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #1e293b', background: '#02040a', borderRadius: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                            {activity.details}
                          </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
