import React from 'react';
import { 
  User, Bell, Settings, Edit2, ShieldAlert, 
  MapPin, Clock, Calendar, Star, ChevronRight, 
  Search, CloudLightning, Globe, Zap, Navigation,
  LayoutDashboard, History, PieChart, HelpCircle, Compass, Map
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, active = false, to = '#' }) => (
  <Link 
    to={to}
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Outfit', margin: 0 }}>Atmospheric</h1>
            <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600', margin: 0 }}>MIDNIGHT LUSTER V2</p>
          </div>
        </Link>

        <div style={{ flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          <SidebarItem icon={History} label="History" to="/history" />
          <SidebarItem icon={Bell} label="Alerts" to="/alerts" />
        </div>

        <div>
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
          <SidebarItem icon={HelpCircle} label="Support" />
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
                  <img src="https://ui-avatars.com/api/?name=Alex+Rivers&background=a78bfa&color=fff" alt="Profile" />
              </div>
           </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 350px) minmax(0, 1fr)', gap: '3rem' }}>
          {/* Left Column: User Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1.5rem auto' }}>
                <img 
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6' }} 
                />
                <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#3b82f6', borderRadius: '50%', padding: '4px' }}>
                  <ShieldAlert size={16} color="white" />
                </div>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>Alex Rivers</h1>
              <p style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '1.5rem' }}>PREMIUM MEMBER</p>
              
              <button 
                className="btn-primary" 
                style={{ width: '100%', background: '#a78bfa', color: 'white', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}
              >
                <Edit2 size={16} /> Edit Profile
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2rem 1rem 0 1rem' }}>
                <div>
                   <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>12</div>
                   <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600' }}>ALERTS</div>
                </div>
                <div>
                   <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>8</div>
                   <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600' }}>CITIES</div>
                </div>
                <div>
                   <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>342</div>
                   <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600' }}>POINTS</div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={18} color="#3b82f6" /> Pinned Locations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'Reykjavík', temp: '2°C', icon: CloudLightning },
                  { name: 'Oslo', temp: '-4°C', icon: Zap }
                ].map((loc) => (
                  <div key={loc.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#02040a', borderRadius: '1rem', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <loc.icon size={20} color="#60a5fa" />
                       <div>
                         <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{loc.name}</div>
                         <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{loc.temp} • Light Snow</div>
                       </div>
                    </div>
                    <ChevronRight size={18} color="#475569" />
                  </div>
                ))}
                <button style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  borderRadius: '1rem', 
                  border: '1px dashed #1e293b', 
                  background: 'transparent', 
                  color: '#64748b', 
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  + Add New Location
                </button>
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginTop: '1.5rem' }}>Aura Glaze Pro</h2>
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
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700', cursor: 'pointer' }}>VIEW ALL</span>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#a78bfa', borderRadius: '50%', marginTop: '0.4rem', boxShadow: '0 0 10px #a78bfa' }} />
                    <div>
                       <div style={{ fontWeight: '600' }}>New Forecast Alert Set</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Today, 2:40 PM</div>
                       <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #1e293b', background: '#02040a', borderRadius: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                          You enabled "Aurora Visibility" notifications for <span style={{ color: '#3b82f6' }}>Abisko, Sweden</span>.
                       </div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#64748b', borderRadius: '50%', marginTop: '0.4rem' }} />
                    <div>
                       <div style={{ fontWeight: '600' }}>Map Style Updated</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Yesterday, 9:15 PM</div>
                       <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', border: '1px solid #1e293b', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>DARK NOCTURNAL</span>
                          <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', border: '1px solid #1e293b', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700', opacity: 0.5 }}>SATELLITE</span>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
