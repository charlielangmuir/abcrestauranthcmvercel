import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.email}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg, #f5f5f5)',
      padding: '20px',
      gap: 24
    }}>
      <img 
        src="../../public/android-chrome-192x192.png" 
        alt="ABC Restaurant Logo" 
        style={{
          width: 120,
          height: 120,
          objectFit: 'contain',
          borderRadius: 60
        }}
      />

      <div className="card" style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 className="pageTitle" style={{ fontSize: 24, marginBottom: 6 }}>
            ABC Restaurant HCM
          </h1>
          <p className="subtle">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--muted)',
              marginBottom: 6
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid var(--border, #ddd)',
                borderRadius: 6,
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: 'var(--bg, #fff)',
                transition: 'border-color 0.2s'
              }}
              placeholder="your.email@example.com"
              required
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary, #2563eb)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border, #ddd)'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--muted)',
              marginBottom: 6
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid var(--border, #ddd)',
                borderRadius: 6,
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: 'var(--bg, #fff)',
                transition: 'border-color 0.2s'
              }}
              placeholder="••••••••"
              required
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary, #2563eb)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border, #ddd)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="iconBtn"
            style={{
              width: '100%',
              marginTop: 8,
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg 
                  style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a 
            href="#" 
            className="subtle"
            style={{ 
              fontSize: 13,
              textDecoration: 'none',
              color: 'var(--primary, #2563eb)',
              fontWeight: 600
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Forgot password?
          </a>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;