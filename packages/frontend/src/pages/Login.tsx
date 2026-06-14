import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import './Login.css';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');

  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName, college || undefined);
      }
      navigate('/dashboard');
    } catch {
      // error is set in store
    }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    clearError();
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-logo-lg">PP</div>
          <h1>PrepOS</h1>
          <p>Your complete placement preparation platform</p>
        </div>
        <div className="login-features">
          {[
            { icon: '🧩', label: '20 DSA Patterns with 500+ problems' },
            { icon: '🔥', label: 'Daily streaks + spaced repetition (SM-2)' },
            { icon: '🤖', label: 'AI mock interviews & code review' },
            { icon: '📊', label: 'Company readiness score & analytics' },
          ].map(f => (
            <div key={f.label} className="login-feature">
              <span className="lf-icon">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-tabs">
            <button className={`login-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Log in</button>
            <button className={`login-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>Create account</button>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <input id="name" type="text" placeholder="Rahul Sharma" required value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
            )}
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="you@college.edu" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="college">College</label>
                <input id="college" type="text" placeholder="IIT Delhi" value={college} onChange={e => setCollege(e.target.value)} />
              </div>
            )}

            {mode === 'login' && (
              <div className="forgot-link">
                <a href="#">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create Account'}
            </button>

            <div className="divider"><span>or</span></div>

            <button type="button" className="google-btn" disabled>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
