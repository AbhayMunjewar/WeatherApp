import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Navigation, Search, User, Filter,
  ChevronRight, Thermometer, Droplets, MapPin,
  LayoutDashboard, History, PieChart, HelpCircle, Compass,
  Plus, Minus, RefreshCw, Layers, Settings, LogOut
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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

const MapsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('radar');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#02040a',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid #1e293b',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
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

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Map Visualization Container */}
        <div style={{ flex: 1, position: 'relative', background: '#02040a' }}>
           {/* Radar Mockup Body */}
           <div style={{ 
             position: 'absolute', 
             inset: 0, 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             background: 'radial-gradient(circle at center, #0a0a1a 0%, #02040a 100%)'
           }}>
              {/* Radar Circles */}
              <div style={{ 
                width: '600px', 
                height: '600px', 
                border: '1px solid rgba(139, 92, 246, 0.1)', 
                borderRadius: '50%', 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                 <div style={{ width: '400px', height: '400px', border: '1px solid rgba(139, 92, 246, 0.05)', borderRadius: '50%' }} />
                 <div style={{ width: '200px', height: '200px', border: '1px solid rgba(139, 92, 246, 0.05)', borderRadius: '50%' }} />
                 
                 {/* Pulses */}
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   style={{ position: 'absolute', top: '30%', left: '35%', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)', borderRadius: '50%' }}
                 />
                 <div style={{ position: 'absolute', top: '40%', left: '42%', width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 15px #ef4444' }} />
                 
                 <motion.div 
                   animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                   transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                   style={{ position: 'absolute', top: '55%', right: '40%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)', borderRadius: '50%' }}
                 />
                 <div style={{ position: 'absolute', top: '65%', right: '48%', width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 15px #3b82f6' }} />
              </div>
           </div>

           {/* Location Search Floating Card */}
           <div style={{ position: 'absolute', top: '2rem', left: '2rem', width: '320px', zIndex: 10 }}>
              <div className="glass" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <div style={{ color: '#3b82f6' }}><Navigation size={20} /></div>
                       <div>
                          <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>CURRENT LOCATION</div>
                          <div style={{ fontSize: '1rem', fontWeight: '700' }}>San Francisco, CA</div>
                       </div>
                    </div>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                       <Search size={18} color="#64748b" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Map Mode Toggles */}
           <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
              <div style={{ 
                background: 'rgba(2, 4, 10, 0.8)', 
                padding: '0.4rem', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid #1e293b' 
              }}>
                 {['Radar', 'Satellite', 'Temp'].map((mode) => (
                   <button
                     key={mode}
                     onClick={() => setActiveTab(mode.toLowerCase())}
                     style={{
                       padding: '0.5rem 1.5rem',
                       borderRadius: '8px',
                       border: 'none',
                       background: activeTab === mode.toLowerCase() ? '#8b5cf6' : 'transparent',
                       color: activeTab === mode.toLowerCase() ? 'white' : '#64748b',
                       fontSize: '0.85rem',
                       fontWeight: '600',
                       cursor: 'pointer',
                       transition: 'all 0.2s'
                     }}
                   >
                     {mode}
                   </button>
                 ))}
              </div>
           </div>

           {/* Legend Card */}
           <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', width: '240px', zIndex: 10 }}>
              <div className="glass" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
                 <h4 style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '1px' }}>PRECIPITATION LEGEND</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%' }} />
                       <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8' }}>LIGHT RAIN</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <div style={{ width: '12px', height: '12px', background: '#eab308', borderRadius: '50%' }} />
                       <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8' }}>MODERATE</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }} />
                       <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8' }}>HEAVY IMPACT</span>
                    </div>
                 </div>
                 
                 <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>
                       <span>VISIBILITY RANGE</span>
                       <span style={{ color: 'white' }}>10KM</span>
                    </div>
                    <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px' }}>
                       <div style={{ width: '60%', height: '100%', background: '#a78bfa', borderRadius: '2px' }} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Bottom Control Bar */}
           <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.8)', 
                backdropFilter: 'blur(10px)',
                padding: '0.75rem 2.5rem', 
                borderRadius: '99px', 
                border: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '2.5rem'
              }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Live Radar Feed</span>
                 </div>
                 <div style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={14} /> Updated 2m ago
                 </div>
                 <button style={{ 
                   background: 'transparent', 
                   border: 'none', 
                   color: 'white', 
                   fontWeight: '700', 
                   fontSize: '0.85rem', 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '0.5rem',
                   cursor: 'pointer' 
                 }}>
                    <RefreshCw size={16} color="#a78bfa" /> SYNC
                 </button>
              </div>
           </div>

           {/* Zoom Controls */}
           <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 10 }}>
              <button style={{ width: '40px', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                 <Plus size={20} />
              </button>
              <button style={{ width: '40px', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                 <Minus size={20} />
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default MapsPage;
