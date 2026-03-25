import React from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Settings, ShieldAlert,
  MapPin, Clock, Calendar, Star, ChevronRight,
  Search, CloudLightning, Globe, Zap, Navigation,
  LayoutDashboard, History, PieChart, HelpCircle, Compass, Map,
  Thermometer, Wind, Droplets, Sun, CloudRain, LogOut
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

const HistoryCard = ({ date, city, temp, cond, icon: Icon, wind, humidity }) => (
  <div className="glass" style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.5fr)', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
       <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
          <Icon size={24} color="#a78bfa" />
       </div>
       <div>
          <div style={{ fontSize: '1rem', fontWeight: '700' }}>{city}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{date}</div>
       </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
       <Thermometer size={18} color="#f87171" />
       <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{temp}Â°C</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
       <Wind size={18} color="#3b82f6" />
       <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{wind} km/h</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
       <Droplets size={18} color="#60a5fa" />
       <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{humidity}%</span>
    </div>
    <div style={{ textAlign: 'right' }}>
       <ChevronRight size={18} color="#1e293b" cursor="pointer" />
    </div>
  </div>
);

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    fetch('http://127.0.0.1:5000/records')
      .then(res => res.json())
      .then(data => {
        if(data && data.records) {
          setHistory(data.records.reverse());
        }
      })
      .catch(console.error);
  }, []);

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
        </div>

        <div>
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
          <SidebarItem icon={HelpCircle} label="Support" />
          <SidebarItem icon={LogOut} label="Logout" onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem('isAuthenticated');
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
              <User size={20} cursor="pointer" onClick={() => navigate('/profile')} />
           </div>
        </header>

        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
             <div>
                <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>Historical Feed</h1>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>Review past Atmos phenomena and trend patterns.</p>
             </div>
             <button style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} /> Select Range
             </button>
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
           {history.length > 0 ? history.map(item => (
             <HistoryCard 
               key={item.id} 
               date={new Date(item.date).toLocaleString()} 
               city={item.city}
               temp={Math.round(item.temperature)} 
               cond={item.description} 
               icon={Sun} 
               wind={0} 
               humidity={0} 
             />
           )) : (
             <p style={{ color: '#64748b' }}>No search history found.</p>
           )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
