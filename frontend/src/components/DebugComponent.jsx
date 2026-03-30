import React, { useEffect, useState, useRef, useCallback } from 'react';

const DebugComponent = () => {
  const [logs, setLogs] = useState([]);
  const logQueueRef = useRef([]);
  const pendingUpdateRef = useRef(false);

  // Flush queued logs safely outside of render cycles
  const flushLogs = useCallback(() => {
    if (logQueueRef.current.length > 0 && !pendingUpdateRef.current) {
      pendingUpdateRef.current = true;
      setLogs(prev => {
        const updated = [...prev, ...logQueueRef.current].slice(-20);
        logQueueRef.current = [];
        pendingUpdateRef.current = false;
        return updated;
      });
    }
  }, []);

  useEffect(() => {
    // Schedule periodic flushes
    const interval = setInterval(flushLogs, 100);
    return () => clearInterval(interval);
  }, [flushLogs]);

  useEffect(() => {
    // Capture console logs with ref-based queueing (no setState during capture)
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const queueLog = (type, args) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');
      
      logQueueRef.current.push({ type, message, time: new Date().toLocaleTimeString() });
      // Trigger flush asynchronously to avoid setState during render
      Promise.resolve().then(flushLogs);
    };

    console.log = (...args) => {
      queueLog('log', args);
      originalLog(...args);
    };

    console.error = (...args) => {
      queueLog('error', args);
      originalError(...args);
    };

    console.warn = (...args) => {
      queueLog('warn', args);
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [flushLogs]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '400px',
      maxHeight: '300px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#0f0',
      padding: '1rem',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      overflowY: 'auto',
      zIndex: 9999,
      borderTop: '1px solid #0f0',
      borderLeft: '1px solid #0f0'
    }}>
      <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>DEBUG LOG</div>
      {logs.map((log, i) => (
        <div key={i} style={{ color: log.type === 'error' ? '#f00' : log.type === 'warn' ? '#ff0' : '#0f0', marginBottom: '0.25rem' }}>
          [{log.time}] {log.type}: {log.message}
        </div>
      ))}
    </div>
  );
};

export default DebugComponent;
