import React from 'react';

/**
 * Global Error Boundary — catches any unhandled runtime errors in the component
 * tree and displays a safe fallback screen instead of a blank white page.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('// RUNTIME_ERROR_BOUNDARY_CAUGHT:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F2F2F2',
          fontFamily: "'Space Mono', monospace",
          padding: '40px',
        }}>
          <div style={{
            background: '#fff',
            border: '3px solid #1A1A1A',
            boxShadow: '10px 10px 0 rgba(0,0,0,0.1)',
            padding: '60px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 12px' }}>
              SYSTEM_FAULT_DETECTED
            </h1>
            <p style={{ fontSize: '12px', color: '#4A4A4A', marginBottom: '30px', lineHeight: 1.6 }}>
              An unexpected error occurred. Please return to the home screen.<br />
              <span style={{ color: '#ef4444', marginTop: '8px', display: 'block' }}>
                {this.state.error?.message}
              </span>
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '14px 30px',
                background: '#1A1A1A',
                color: 'white',
                border: 'none',
                fontFamily: "'Space Mono', monospace",
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              [ RETURN_TO_HOME ]
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
