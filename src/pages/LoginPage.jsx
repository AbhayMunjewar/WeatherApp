import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Chrome, ShieldAlert } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, handle authentication here
    onLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #1a1a2e 0%, #02040a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontFamily: 'Outfit', fontWeight: '700', marginBottom: '0.5rem' }}>Aura Glaze</h1>
        <p style={{ color: '#94a3b8', letterSpacing: '2px', fontSize: '0.9rem' }}>Atmospheric Precision</p>
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Toggle Login/Signup */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '0.4rem',
          borderRadius: '99px',
          display: 'flex',
          marginBottom: '2.5rem'
        }}>
          {['login', 'signup'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                borderRadius: '99px',
                background: activeTab === tab ? '#a78bfa' : 'transparent',
                color: activeTab === tab ? 'white' : '#94a3b8',
                fontWeight: '600',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {tab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              color: '#94a3b8', 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              marginBottom: '0.75rem',
              letterSpacing: '1px'
            }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="email" 
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.75rem',
                  padding: '0.85rem 1rem 0.85rem 3rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>PASSWORD</label>
              <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Forgot Password?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="password" 
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.75rem',
                  padding: '0.85rem 1rem 0.85rem 3rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '2rem' }}
          >
            Enter Aura
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0', color: '#475569' }}>
          <div style={{ height: '1px', flex: 1, background: '#1e293b' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>CONTINUE WITH</span>
          <div style={{ height: '1px', flex: 1, background: '#1e293b' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem', 
            borderRadius: '0.75rem', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            <Chrome size={20} /> GOOGLE
          </button>
          <button style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem', 
            borderRadius: '0.75rem', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            iOS
          </button>
        </div>
      </motion.div>

      <button 
        onClick={() => window.history.back()}
        style={{ 
          marginTop: '3rem', 
          background: 'transparent', 
          border: 'none', 
          color: '#64748b', 
          fontSize: '0.8rem', 
          fontWeight: '600', 
          cursor: 'pointer' 
        }}
      >
        ← BACK TO FORECASTS
      </button>

      <footer style={{ marginTop: 'auto', padding: '2rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#475569' }}>
         <span style={{ fontWeight: '700', color: 'white' }}>Aura Glaze</span>
         <div style={{ display: 'flex', gap: '1.5rem' }}>
           <span>PRIVACY POLICY</span>
           <span>TERMS OF SERVICE</span>
           <span>COOKIE SETTINGS</span>
           <span>HELP CENTER</span>
         </div>
         <span>© 2024 AURA GLAZE. ATMOSPHERIC PRECISION.</span>
      </footer>
    </div>
  );
};

export default LoginPage;
