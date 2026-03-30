import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#02040a',
          color: 'white',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '1rem',
            border: '1px solid rgba(248, 113, 113, 0.3)'
          }}>
            <h1 style={{ color: '#ef4444', marginTop: 0 }}>Something went wrong</h1>
            <p>We encountered an error. Please try refreshing the page.</p>
            {this.state.error && (
              <details style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>Error Details</summary>
                {this.state.error.toString()}
                {this.state.errorInfo && (
                  <>
                    {'\n\n'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
