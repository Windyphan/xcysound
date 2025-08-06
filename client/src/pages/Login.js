import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success(`Login successful! Welcome ${result.user.firstName}!`);
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Invalid credentials. Try demo@xcysound.com / demo123');
    }

    setLoading(false);
  };

  const quickLogin = async (email, password) => {
    setFormData({ email, password });
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success(`Login successful! Welcome ${result.user.firstName}!`);
      navigate('/dashboard');
    } else {
      toast.error('Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your music library</p>
        </div>

        {/* Demo Credentials Banner */}
        <div className="demo-banner">
          <h4>🎵 Try Demo Accounts:</h4>
          <div className="demo-accounts">
            <button
              onClick={() => quickLogin('demo@xcysound.com', 'demo123')}
              className="demo-btn user-demo"
              disabled={loading}
            >
              👤 Demo User
              <small>demo@xcysound.com / demo123</small>
            </button>
            <button
              onClick={() => quickLogin('admin@xcysound.com', 'admin123')}
              className="demo-btn admin-demo"
              disabled={loading}
            >
              👑 Admin User
              <small>admin@xcysound.com / admin123</small>
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>Or login manually</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
