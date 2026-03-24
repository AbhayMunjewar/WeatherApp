import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SearchResults from './pages/SearchResults';
import ProfilePage from './pages/ProfilePage';
import AlertsPage from './pages/AlertsPage';
import MapsPage from './pages/MapsPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  // Mock login function for redirection logic
  // The onLogin prop for LoginPage will now directly update isAuthenticated state
  // and handle localStorage internally.
  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/search" 
          element={
            isAuthenticated ? <SearchResults /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/alerts" 
          element={
            isAuthenticated ? <AlertsPage /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/map" 
          element={
            isAuthenticated ? <MapsPage /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/settings" 
          element={
            isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/history" 
          element={
            isAuthenticated ? <HistoryPage /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
