import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, ShieldAlert, CloudLightning, Wind, Sun, 
  Map, Navigation, Search, User, Filter, 
  ChevronRight, Thermometer, Droplets, MapPin,
  LayoutDashboard, History, PieChart, HelpCircle, Compass, Settings
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

const AlertCard = ({ type, title, description, time, location, color }) => (
  <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ padding: '0.5rem', background: `${color}15`, borderRadius: '8px' }}>
          <ShieldAlert size={24} color={color} />
        </div>
        <div>
          <span style={{ fontSize: '0.65rem', color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{type}</span>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Updated {time} ago</div>
        </div>
      </div>
      <span style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
        VIEW MORE <ChevronRight size={14} />
      </span>
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>{title}</h3>
    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.5rem' }}>{description}</p>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
       {location.map(loc => (
         <span key={loc} style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', background: '#02040a', borderRadius: '4px', border: '1px solid #1e293b', color: '#64748b', fontWeight: '700' }}>{loc.toUpperCase()}</span>
       ))}
    </div>
  </div>
);

const AlertsPage = () => {
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
          <SidebarItem icon={Bell} label="Alerts" active to="/alerts" />
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
                onClick={() => navigate('/profile')} 
                style={{ width: '32px', height: '32px', background: '#e2e8f0', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }}
              >
                  <img src="https://ui-avatars.com/api/?name=Alex+Rivers&background=a78bfa&color=fff" alt="Profile" />
              </div>
           </div>
        </header>

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
            <ShieldAlert size={14} /> CRITICAL WARNING
            <span style={{ fontWeight: '400', opacity: 0.8, marginLeft: '0.5rem' }}>Active for 4h 12m</span>
          </div>
          
          <h1 style={{ fontSize: '4.5rem', fontWeight: '700', lineHeight: '1.1', maxWidth: '800px', marginBottom: '1.5rem' }}>
            Extreme Thunderstorm <br/>
            <span style={{ color: '#f87171' }}>Supercell Watch</span>
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', lineHeight: '1.6', marginBottom: '3rem' }}>
            A dangerous weather system is moving eastward. High potential for large hail, damaging winds up to 80mph, and isolated tornadoes. Residents should seek shelter immediately.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
             <button className="btn-primary" style={{ background: '#ef4444', border: 'none', padding: '1rem 2rem' }}>VIEW LIVE RADAR</button>
             <button className="btn-secondary" style={{ padding: '1rem 2rem' }}>Safety Protocols</button>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '3rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Active Advisories</h2>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                  Filter by Severity <Filter size={16} />
               </div>
            </div>

            <AlertCard 
              type="WARNING"
              title="Flash Flood Warning: Downtown Metro"
              description="Rapid water rise expected in low-lying areas. Total accumulation of 4-6 inches likely by midnight."
              time="12m"
              location={['midtown', 'river district']}
              color="#ef4444"
            />
            <AlertCard 
              type="ADVISORY"
              title="Dense Fog Advisory"
              description="Visibility reduced to less than 1/4 mile. Hazardous driving conditions on coastal highways."
              time="2 hours"
              location={['coastal way', 'south bridge']}
              color="#3b82f6"
            />
             <AlertCard 
              type="UPDATE"
              title="Excessive Heat Watch Expiring"
              description="Temperatures returning to seasonal normals. Cooling centers will close at 8:00 PM tonight."
              time="5 hours"
              location={['tri-county area']}
              color="#fbbf24"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={18} color="#3b82f6" /> Impacted Regions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   {[
                     { name: 'West Hamilton', status: 'Severe Risk: High', color: '#ef4444' },
                     { name: 'Oak Creek Basin', status: 'Flood Potential: Extreme', color: '#ef4444' },
                     { name: 'Silverton Heights', status: 'Wind Warning: Active', color: '#ef4444' },
                     { name: 'South Shore', status: 'Visibility: Low', color: '#3b82f6' }
                   ].map(region => (
                     <div key={region.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{region.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{region.status}</div>
                        </div>
                        <div style={{ width: '8px', height: '8px', background: region.color, borderRadius: '50%' }} />
                     </div>
                   ))}
                </div>
                <button style={{ width: '100%', marginTop: '2.5rem', background: '#1e293b', border: 'none', padding: '0.85rem', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '0.85rem' }}>
                  Show All Regions
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
