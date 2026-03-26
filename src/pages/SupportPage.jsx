import React from 'react';
import {
  HelpCircle, Phone, Mail, MessageSquare, LifeBuoy,
  LayoutDashboard, History, PieChart, Compass, Settings, LogOut,
  User
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
    }}
  >
    {Icon && <Icon size={20} />}
    <span>{label}</span>
  </Link>
);

const SupportCard = ({ icon: Icon, title, description, action }) => (
  <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(167, 139, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
      <Icon size={24} color="#a78bfa" />
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>{title}</h3>
    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>{description}</p>
    {action}
  </div>
);

const SupportPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#02040a', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', marginBottom: '3rem', textDecoration: 'none', color: 'white' }}>
          <div style={{ width: '32px', height: '32px', background: '#a78bfa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Compass color="white" size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Outfit', margin: 0 }}>Atmos</h1>
            <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600', margin: 0 }}>WEATHER INTELLIGENCE</p>
          </div>
        </Link>

        <div style={{ flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          <SidebarItem icon={History} label="History" to="/history" />
          <SidebarItem icon={PieChart} label="Alerts" to="/alerts" />
          <SidebarItem icon={User} label="Profile" to="/profile" />
        </div>

        <div>
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
          <SidebarItem icon={HelpCircle} label="Support" active to="/support" />
          <SidebarItem icon={LogOut} label="Logout" onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userProfile');
            window.location.href = '/login';
          }} />
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#64748b', letterSpacing: '0.2em', fontSize: '0.7rem', fontWeight: '700' }}>ATMOS SUPPORT CENTER</p>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginTop: '0.5rem' }}>How can we help?</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', padding: '0.85rem 1.5rem', borderRadius: '999px', fontWeight: '600', cursor: 'pointer' }}
          >
            Back to Atmos
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <SupportCard
            icon={Phone}
            title="Call Us"
            description="Speak with an Atmos specialist for urgent weather assistance."
            action={
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>+1 (800) 555-0120</p>
                <button 
                  onClick={() => window.location.href = 'tel:+18005550120'}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '999px', border: 'none', background: '#a78bfa', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Call Now
                </button>
              </div>
            }
          />
          <SupportCard
            icon={Mail}
            title="Email Support"
            description="Detailed reports, feature requests, or billing questions."
            action={
              <button 
                onClick={() => window.location.href = 'mailto:support@atmos.app'}
                style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '999px', border: 'none', background: '#a78bfa', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              >
                support@atmos.app
              </button>
            }
          />
          <SupportCard
            icon={MessageSquare}
            title="Live Chat"
            description="Chat with our success team inside the Atmos workspace."
            action={
              <button 
                onClick={() => alert('Live chat is available 7am - 11pm weekdays PST')}
                style={{ marginTop: '1.5rem', display: 'inline-block', padding: '0.4rem 1.2rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: '600' }}
              >
                Weekdays 7am - 11pm
              </button>
            }
          />
          <SupportCard
            icon={LifeBuoy}
            title="Knowledge Base"
            description="Guides for connecting sensors, reading insights, and automation."
            action={
              <button 
                onClick={() => window.open('https://docs.atmos.app', '_blank')}
                style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              >
                Open Library
              </button>
            }
          />
        </section>

        <section style={{ background: 'rgba(15,23,42,0.5)', borderRadius: '2rem', padding: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>Community & Escalations</h2>
          <p style={{ color: '#94a3b8', maxWidth: '640px', lineHeight: 1.6 }}>
            Monitor live incidents, subscribe to outage notices, and escalate enterprise tickets.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
            <button 
              onClick={() => window.open('https://status.atmos.app', '_blank')}
              style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Status dashboard
            </button>
            <button 
              onClick={() => alert('View past incidents at status.atmos.app/history')}
              style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Incident history
            </button>
            <button 
              onClick={() => alert('Submit your escalation at support.atmos.app/escalations')}
              style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Submit escalation
            </button>
            <button 
              onClick={() => window.open('https://forum.atmos.app', '_blank')}
              style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Developers forum
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SupportPage;
