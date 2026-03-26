import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SearchResults from './pages/SearchResults';
import ForecastPage from './pages/ForecastPage';
import ProfilePage from './pages/ProfilePage';
import AlertsPage from './pages/AlertsPage';
import MapsPage from './pages/MapsPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import SupportPage from './pages/SupportPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  // Mock login function for redirection logic
  // The onLogin prop for LoginPage will now directly update isAuthenticated state
  // and handle localStorage internally.
  const handleLogin = (userProfile = null) => {
    localStorage.setItem('isAuthenticated', 'true');
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('userProfile');
    }
    setIsAuthenticated(true);
  };

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
            path="/forecast" 
            element={
              isAuthenticated ? <ForecastPage /> : <Navigate to="/login" />
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
          <Route 
            path="/support" 
            element={
              isAuthenticated ? <SupportPage /> : <Navigate to="/login" />
            } 
          />
        </Routes>
        <Footer />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
