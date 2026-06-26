import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    if (error) setError(null);
  };

  const validate = () => {
    const newErrors = {};
    if (activeTab === 'register') {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (activeTab === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        const result = await register(formData.fullName, formData.email, formData.password);
        // After registration, move to Sign In tab so user can sign in next
        switchTab('login');
        if (result && result.requiresVerification) {
          setErrors({ form: result.message || 'Please verify your email before signing in.' });
        }
      }
    } catch (err) {
      const message = err.message || (activeTab === 'login' ? 'Login failed' : 'Registration failed');
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8081/api/oauth2/authorization/google';
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setError(null);
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="secure-logo large">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z" fill="var(--primary)"/>
                <path d="M9 12L11 14L15 10" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h2>{activeTab === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p>{activeTab === 'login' ? 'Sign in to access your files' : 'Register to start storing files'}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        {errors.form && (
          <div className="form-error mb-16" style={{ textAlign: 'center' }}>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <div className="form-error">{errors.fullName}</div>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ justifyContent: 'center' }}
          >
            {loading ? (
              <div className="spinner spinner-small"></div>
            ) : activeTab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="form-divider">OR</div>

        <button className="google-signin-btn-full" onClick={handleGoogleSignIn}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
