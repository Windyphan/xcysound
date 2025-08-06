import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiShoppingCart, FiUser, FiMusic, FiHome, FiSearch } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, cart } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FiMusic className="brand-icon" />
          XcySound
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-item">
            <FiHome /> Home
          </Link>
          <Link to="/browse" className="navbar-item">
            <FiSearch /> Browse
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/library" className="navbar-item">
                Library
              </Link>
              <Link to="/dashboard" className="navbar-item">
                <FiUser /> Dashboard
              </Link>
              <Link to="/cart" className="navbar-item cart-link">
                <FiShoppingCart />
                {cart.length > 0 && (
                  <span className="cart-badge">{cart.length}</span>
                )}
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="navbar-item admin-link">
                  Admin
                </Link>
              )}
              <div className="user-menu">
                <span className="username">{user?.username}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="navbar-item">
                Login
              </Link>
              <Link to="/register" className="navbar-item register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
