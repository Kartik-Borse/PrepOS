import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err: Error) {
    return { error: err.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#ef4743', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100vh' }}>
          <h2 style={{ color: '#f89f1b' }}>Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#eff1f6', fontSize: 14 }}>{this.state.error}</pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: 20, padding: '8px 20px', background: '#f89f1b', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
          >
            Clear cache &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
