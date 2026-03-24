import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Settings, Edit2, ShieldAlert, 
  MapPin, Clock, Calendar, Star, ChevronRight, 
  Search, CloudLightning, Globe, Zap, Navigation,
  LayoutDashboard, History, PieChart, HelpCircle, Compass, Map,
  Eye, EyeOff, Thermometer, Wind, CheckCircle2
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

const SettingsPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [units, setUnits] = useState({ temp: 'celsius', wind: 'mph' });

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
          <SidebarItem icon={Map} label="Map" to="/map" />
          <SidebarItem icon={History} label="History" to="/history" />
          <SidebarItem icon={Bell} label="Alerts" to="/alerts" />
        </div>

        <div>
          <SidebarItem icon={Settings} label="Settings" active to="/settings" />
          <SidebarItem icon={HelpCircle} label="Support" />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 4rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
           <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', alignItems: 'center' }}>
              <User size={20} cursor="pointer" onClick={() => navigate('/profile')} />
           </div>
        </header>

        <section style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '1rem' }}>Settings</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
            Tailor your atmospheric experience. Adjust how Aura Glaze Night visualizes the nocturnal world for you.
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
          {/* Account Settings */}
          <div className="glass" style={{ padding: '2.5rem' }}>
             <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={20} color="#a78bfa" /> Account Settings
             </h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase' }}>EMAIL ADDRESS</label>
                   <input 
                      type="text" 
                      defaultValue="luna.voyager@midnight.com"
                      style={{ width: '100%', background: '#02040a', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.85rem 1rem', color: 'white', outline: 'none' }}
                   />
                </div>
                <div style={{ position: 'relative' }}>
                   <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase' }}>PASSWORD</label>
                   <input 
                      type={showPassword ? "text" : "password"}
                      defaultValue="••••••••••••••••"
                      style={{ width: '100%', background: '#02040a', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.85rem 1rem', color: 'white', outline: 'none' }}
                   />
                   <div 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '1rem', top: '2.8rem', color: '#64748b', cursor: 'pointer' }}
                   >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                   </div>
                </div>
             </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.85rem 2rem', borderRadius: '99px', fontWeight: '600', cursor: 'pointer' }}>Update Profile</button>
             </div>
          </div>

          {/* Display */}
          <div className="glass" style={{ padding: '2.5rem' }}>
             <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Globe size={20} color="#3b82f6" /> Display
             </h3>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Dark Mode</span>
                <div style={{ width: '48px', height: '24px', background: '#3b82f6', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                   <div style={{ position: 'absolute', right: '4px', top: '4px', width: '16px', height: '16px', background: 'white', borderRadius: '50%' }} />
                </div>
             </div>
             <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                   <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Map Opacity</span>
                   <span style={{ color: '#3b82f6', fontWeight: '600' }}>75%</span>
                </div>
                <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', position: 'relative' }}>
                   <div style={{ width: '75%', height: '100%', background: '#3b82f6', borderRadius: '2px' }} />
                   <div style={{ position: 'absolute', left: '75%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }} />
                </div>
             </div>
             <div style={{ color: '#64748b' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase' }}>INTERFACE VERSION</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#a78bfa', marginTop: '0.25rem' }}>V2.4.0-GLAZE</div>
             </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '2rem', marginBottom: '5rem' }}>
           {/* Weather Units */}
           <div className="glass" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Thermometer size={20} color="#f87171" /> Weather Units
              </h3>
              <div style={{ marginBottom: '2rem' }}>
                 <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase' }}>TEMPERATURE</div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#02040a', borderRadius: '12px', padding: '0.3rem', border: '1px solid #1e293b' }}>
                    <div onClick={() => setUnits({...units, temp: 'celsius'})} style={{ padding: '0.75rem', textAlign: 'center', borderRadius: '8px', background: units.temp === 'celsius' ? 'rgba(30, 41, 59, 0.8)' : 'transparent', color: units.temp === 'celsius' ? '#a78bfa' : '#64748b', cursor: 'pointer', fontWeight: '600' }}>Celsius</div>
                    <div onClick={() => setUnits({...units, temp: 'fahrenheit'})} style={{ padding: '0.75rem', textAlign: 'center', borderRadius: '8px', background: units.temp === 'fahrenheit' ? 'rgba(30, 41, 59, 0.8)' : 'transparent', color: units.temp === 'fahrenheit' ? '#a78bfa' : '#64748b', cursor: 'pointer', fontWeight: '600' }}>Fahrenheit</div>
                 </div>
              </div>
              <div>
                 <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase' }}>WIND SPEED</div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#02040a', borderRadius: '12px', padding: '0.3rem', border: '1px solid #1e293b' }}>
                    <div onClick={() => setUnits({...units, wind: 'kmh'})} style={{ padding: '0.75rem', textAlign: 'center', borderRadius: '8px', background: units.wind === 'kmh' ? 'rgba(30, 41, 59, 0.8)' : 'transparent', color: units.wind === 'kmh' ? '#3b82f6' : '#64748b', cursor: 'pointer', fontWeight: '600' }}>km/h</div>
                    <div onClick={() => setUnits({...units, wind: 'mph'})} style={{ padding: '0.75rem', textAlign: 'center', borderRadius: '8px', background: units.wind === 'mph' ? 'rgba(30, 41, 59, 0.8)' : 'transparent', color: units.wind === 'mph' ? '#3b82f6' : '#64748b', cursor: 'pointer', fontWeight: '600' }}>mph</div>
                 </div>
              </div>
           </div>

           {/* Push Notifications */}
           <div className="glass" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={20} color="#a78bfa" /> Push Notifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 {[
                   { title: 'Precipitation Alerts', desc: 'Get notified 15 mins before rain starts', color: '#3b82f6', icon: CloudLightning, active: true },
                   { title: 'Storm Warnings', desc: 'Critical alerts for local severe weather', color: '#ef4444', icon: ShieldAlert, active: true },
                   { title: 'Daily Briefing', desc: 'Morning summary of the night ahead', color: '#64748b', icon: Zap, active: false }
                 ].map((item) => (
                   <div key={item.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '1rem', border: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                         <div style={{ width: '40px', height: '40px', background: `${item.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <item.icon color={item.color} size={20} />
                         </div>
                         <div>
                            <div style={{ fontWeight: '600' }}>{item.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{item.desc}</div>
                         </div>
                      </div>
                      <div style={{ width: '40px', height: '20px', background: item.active ? '#a78bfa' : '#1e293b', borderRadius: '10px', position: 'relative', cursor: 'pointer' }}>
                         <div style={{ position: 'absolute', [item.active ? 'right' : 'left']: '3px', top: '3px', width: '14px', height: '14px', background: 'white', borderRadius: '50%' }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Banner */}
        <div style={{ 
          height: '300px', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: 'linear-gradient(to bottom, transparent, #02040a), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop")',
          borderRadius: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '4rem',
          marginBottom: '5rem'
        }}>
           <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>Experience the Atmosphere</h2>
           <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Aura Glaze Night uses hyper-local satellite data.</p>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid #1e293b', padding: '4rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Outfit', marginBottom: '1rem' }}>Aura Glaze Night</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>© 2024 AURA GLAZE NIGHT. ALL RIGHTS RESERVED.</div>
           </div>
           <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.7rem', color: '#64748b', fontWeight: '700', letterSpacing: '1px' }}>
              <span>PRIVACY POLICY</span>
              <span>TERMS OF SERVICE</span>
              <span>COOKIE SETTINGS</span>
              <span>LEGAL NOTICE</span>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default SettingsPage;
