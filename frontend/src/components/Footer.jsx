import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Built by Abhay Munjewar</h3>
          <p className="footer-description">
            PM Accelerator is a product management training program that helps aspiring and 
            early-career PMs land their dream roles through mentorship, real-world projects, 
            and a strong community.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/alerts">Alerts</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul className="footer-links">
            <li><a href="https://github.com/AbhayMunjewar/WeatherApp" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="/settings">Settings</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Atmos Weather App. All rights reserved.</p>
        <p>Made with ❤️ by <strong>Abhay Munjewar</strong></p>
      </div>
    </footer>
  );
}

export default Footer;
