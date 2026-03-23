import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AtmosphericData from './pages/AtmosphericData';
import SatelliteFeed from './pages/SatelliteFeed';
import SystemAlerts from './pages/SystemAlerts';
import Settings from './pages/Settings';
import Support from './pages/Support';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/atmospheric" element={<AtmosphericData />} />
      <Route path="/satellite" element={<SatelliteFeed />} />
      <Route path="/alerts" element={<SystemAlerts />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/support" element={<Support />} />
    </Routes>
  );
}

export default App;
