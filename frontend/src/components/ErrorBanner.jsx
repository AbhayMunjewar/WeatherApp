import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ErrorBanner = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-banner fade-in" role="alert">
      <div className="error-content">
        <AlertTriangle size={20} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="error-close-btn" 
          aria-label="Dismiss error"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
