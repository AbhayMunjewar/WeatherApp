import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SearchBar';
import { MessageSquare, Shield, Send, ExternalLink, BookOpen, Satellite } from 'lucide-react';

const chatMessages = [
  {
    sender: 'ai', name: 'ECHO-1', time: '09:42:11',
    text: 'Commander, Atmospheric AI "ECHO-1" standing by. I can assist with orbital mechanics, sensor calibration, or weather data interpretation. State your query.',
  },
  {
    sender: 'user', name: 'COMMANDER', time: '09:43:05',
    text: 'Recalibrate Sector 7-G thermal sensors. Noticing 2.4% drift in infrared data.',
  },
  {
    sender: 'ai', name: 'ECHO-1', time: '09:43:12',
    text: 'Initializing recalibration sequence for Sector 7-G. High-altitude particulate matter detected, suggesting minor sensor occlusion. Would you like a drone inspection?',
  },
];

const docs = [
  { title: 'Manual Sensor Override', desc: 'How to bypass automated atmospheric filters when manual verification is required in Sector 7.' },
  { title: 'Solar Flare Shielding', desc: 'Emergency protocols for protecting satellite instrumentation during Class X flares.' },
  { title: 'Data Encryption Reset', desc: 'Standard procedure for rotating quantum keys across the global command network.' },
];

export default function Support() {
  const [message, setMessage] = useState('');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar sector="7-G Alpha" subtitle="Command Center" showUser userId="ID: 0892-X" />
        <main style={styles.main}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.pageTitle}>Support Command</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span className="status-dot active" />
                <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Direct Uplink Active · System Latency: 14ms
                </span>
              </div>
            </div>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.7rem' }}>Emergency Protocol</button>
          </div>

          <div style={styles.grid}>
            {/* Chat Panel */}
            <div className="card" style={styles.chatCard}>
              <div style={styles.chatHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={16} color="var(--cyan)" />
                  <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Direct Comms Link</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="status-dot active" />
                  <span className="status-dot" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
                </div>
              </div>

              <div style={styles.chatBody}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.sender === 'ai' && (
                      <div style={styles.aiAvatar}>
                        <Shield size={16} color="var(--cyan)" />
                      </div>
                    )}
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{
                        ...styles.msgBubble,
                        ...(msg.sender === 'user' ? styles.userBubble : styles.aiBubble),
                        borderLeft: msg.sender === 'ai' ? '3px solid var(--cyan)' : 'none',
                      }}>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{msg.text}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.sender === 'user' && <span style={{ fontSize: '0.7rem' }}>👤</span>}
                        <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                          {msg.name} · {msg.time}
                        </span>
                      </div>
                    </div>
                    {msg.sender === 'user' && (
                      <div style={styles.userAvatar}>
                        <span style={{ fontSize: '0.7rem' }}>👤</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={styles.chatInput}>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: 16, flex: 1 }}
                  placeholder="Transmit Command..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <button style={styles.sendBtn}>
                  <Send size={18} color="var(--bg-primary)" />
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div style={styles.rightCol}>
              {/* System Status */}
              <div className="card" style={styles.statusCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Shield size={16} color="var(--cyan)" />
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: 1 }}>System Status</h4>
                </div>
                {[
                  { name: 'Orbital Grid Alpha', status: 'Optimal', color: 'var(--green)', icon: '📡' },
                  { name: 'Atmospheric Feed', status: 'Recalibrating', color: 'var(--amber)', icon: '📊' },
                  { name: 'Ground Stations', status: 'Optimal', color: 'var(--green)', icon: '⭐' },
                ].map(s => (
                  <div key={s.name} style={styles.statusRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{s.icon}</span>
                      <span className="mono" style={{ fontSize: '0.75rem' }}>{s.name}</span>
                    </div>
                    <span className="mono" style={{ fontSize: '0.65rem', color: s.color, fontWeight: 600 }}>{s.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>

              {/* Command Documentation */}
              <div className="card" style={styles.docsCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <BookOpen size={16} color="var(--cyan)" />
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: 1 }}>Command Documentation</h4>
                </div>
                {docs.map(d => (
                  <div key={d.title} style={styles.docRow}>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{d.title}</h5>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{d.desc}</p>
                    </div>
                    <ExternalLink size={14} color="var(--text-dim)" style={{ flexShrink: 0, cursor: 'pointer' }} />
                  </div>
                ))}
                <button style={styles.archiveBtn}>View Full Command Archive</button>
              </div>

              {/* Hardware Status */}
              <div className="card" style={styles.hardwareCard}>
                <div style={styles.hardwareVisual}>
                  <Satellite size={40} color="var(--cyan)" style={{ opacity: 0.6 }} />
                </div>
                <div style={styles.hardwareInfo}>
                  <span className="label" style={{ color: 'var(--cyan)' }}>Hardware Status</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, marginTop: 4, display: 'block' }}>
                    Orbital Array O1-A Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  main: { flex: 1, padding: 24, overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: 2 },
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 },
  chatCard: { padding: 0, display: 'flex', flexDirection: 'column' },
  chatHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(0,229,255,0.03)',
  },
  chatBody: { flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 20, minHeight: 300 },
  msgRow: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  aiAvatar: {
    width: 36, height: 36, borderRadius: 8, background: 'rgba(0,229,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: 8, background: 'rgba(0,229,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  msgBubble: { padding: '12px 16px', borderRadius: 8 },
  aiBubble: { background: 'rgba(0,229,255,0.05)' },
  userBubble: { background: 'var(--bg-input)' },
  chatInput: {
    display: 'flex', gap: 8, padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 6, background: 'var(--cyan)',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'var(--transition)',
  },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  statusCard: { padding: 20 },
  statusRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border-color)',
  },
  docsCard: { padding: 20 },
  docRow: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid var(--border-color)',
  },
  archiveBtn: {
    width: '100%', marginTop: 16, padding: '10px',
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    background: 'var(--bg-input)', border: '1px solid var(--border-color)',
    borderRadius: 4, color: 'var(--text-secondary)', cursor: 'pointer',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  hardwareCard: { padding: 0, overflow: 'hidden' },
  hardwareVisual: {
    height: 100, background: 'linear-gradient(135deg, #0a1628, #1a3050)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  hardwareInfo: { padding: 16 },
};
