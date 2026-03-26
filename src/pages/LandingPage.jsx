import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wind, ShieldCheck, Globe, Activity, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page-container" style={{
      background: 'radial-gradient(circle at top, #1a1a2e 0%, #02040a 60%)',
      minHeight: '100vh',
      color: 'white',
      overflowX: 'hidden'
    }}>
      {/* Navbar with only Login/Sign Up */}
      <nav style={{
        padding: '1.5rem 4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        width: '100%',
        zIndex: 100,
        background: 'rgba(2, 4, 10, 0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontWeight: '700', fontSize: '1.5rem', fontFamily: 'Outfit' }}>Atmos</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'transparent', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '99px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          padding: '10rem 2rem 5rem 2rem',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <span style={{ 
          color: '#8b5cf6', 
          backgroundColor: 'rgba(139, 92, 246, 0.1)', 
          padding: '0.4rem 1rem', 
          borderRadius: '99px',
          fontSize: '0.75rem',
          fontWeight: '600',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          display: 'inline-block',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          PRECISION REFINED
        </span>
        
        <h1 style={{ 
          fontSize: '4.5rem', 
          lineHeight: '1.1', 
          marginBottom: '1.5rem',
          fontFamily: 'Outfit',
          fontWeight: '700'
        }}>
          Precision in <br/>
          <span style={{ 
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #f472b6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Every Breeze
          </span>
        </h1>
        
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '1.1rem', 
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 3rem auto'
        }}>
          Harness the power of Atmos intelligence. Atmos provides hyper-local clarity for your environment with editorial elegance.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign Up Now
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="btn-secondary"
          >
            Login to Portal
          </button>
        </div>
      </motion.section>

      {/* Featured Radar Background Mockup */}
      <div style={{
        margin: '5rem auto',
        width: '90%',
        maxWidth: '1200px',
        height: '400px',
        borderRadius: '2rem',
        background: 'url("https://images.unsplash.com/photo-1534088568595-a066f710b721?q=80&w=2000&auto=format&fit=crop") center/cover no-repeat',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent, #02040a 100%)',
          zIndex: 1
        }} />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '300px',
            height: '300px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '50%',
            position: 'relative',
            zIndex: 2
          }}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '1px',
            height: '150px',
            background: 'linear-gradient(to top, #3b82f6, transparent)',
            transformOrigin: 'top'
          }} />
        </motion.div>
      </div>

      {/* Mastery Section */}
      <section style={{ padding: '8rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'Outfit' }}>Atmos Mastery</h2>
        <p style={{ color: '#94a3b8', maxWidth: '500px', marginBottom: '4rem' }}>
          Deep integration of radar, air analytics, and predictive modelling wrapped in a translucent glass interface.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {/* Radar Card */}
          <div className="glass" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
             <Activity color="#3b82f6" size={32} style={{ marginBottom: '1.5rem' }} />
             <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Real-time Radar</h3>
             <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
               Experience zero-latency Atmos scanning. Our NEXRAD-integrated visualization brings every storm cell into sharp focus.
             </p>
             <button style={{ 
               marginTop: '2rem', 
               color: '#3b82f6', 
               background: 'transparent', 
               border: 'none', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '0.5rem',
               fontWeight: '600',
               cursor: 'pointer'
             }}>
               Explore the Map <ArrowRight size={16} />
             </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass" style={{ padding: '2rem' }}>
               <Wind color="#f472b6" size={24} style={{ marginBottom: '1rem' }} />
               <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Air Quality Alerts</h3>
               <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                 Instant notifications on PM2.5 levels and allergens. Stay informed.
               </p>
            </div>
            <div className="glass" style={{ padding: '2rem' }}>
               <ShieldCheck color="#a78bfa" size={24} style={{ marginBottom: '1rem' }} />
               <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Personalized Forecasts</h3>
               <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                 Intelligence tailored to your lifestyle. We map the sky to your calendar.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '6rem 4rem', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '4rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {[
          { label: 'ACTIVE USERS', value: '12M+' },
          { label: 'SYNC LATENCY', value: '0.5s' },
          { label: 'COUNTRIES', value: '180+' },
          { label: 'GLOBAL MONITORING', value: '24/7' }
        ].map((stat, i) => (
          <div key={i}>
            <div style={{ fontSize: '3rem', fontWeight: '700', fontFamily: 'Outfit' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', letterSpacing: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '4rem', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: '#02040a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Atmos</div>
          <p style={{ color: '#64748b', fontSize: '0.75rem' }}>© 2024 Atmos. Precision redefined.</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>PRIVACY POLICY</span>
          <span>TERMS OF SERVICE</span>
          <span>HELP CENTER</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Globe size={18} color="#94a3b8" />
          <Activity size={18} color="#94a3b8" />
          <Wind size={18} color="#94a3b8" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
