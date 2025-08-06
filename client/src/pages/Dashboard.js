import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { FiUser, FiMusic, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loadTracks } = useApp();
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    favoriteGenres: [],
    cartItems: 0
  });
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
    loadRecentPurchases();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const loadRecentPurchases = async () => {
    try {
      const response = await fetch('/api/payments/purchases?limit=5', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRecentPurchases(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {user?.firstName}!</h1>
          <p>Here's what's happening with your music library</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FiMusic />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalPurchases}</div>
              <div className="stat-label">Tracks Owned</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiShoppingBag />
            </div>
            <div className="stat-content">
              <div className="stat-number">${stats.totalSpent}</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.favoriteGenres.length}</div>
              <div className="stat-label">Genres Explored</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiUser />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.cartItems}</div>
              <div className="stat-label">Items in Cart</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/browse" className="action-btn">
                <FiMusic />
                Browse Music
              </Link>
              <Link to="/library" className="action-btn">
                <FiShoppingBag />
                My Library
              </Link>
              <Link to="/cart" className="action-btn">
                <FiShoppingBag />
                View Cart ({stats.cartItems})
              </Link>
            </div>
          </div>

          {/* Favorite Genres */}
          {stats.favoriteGenres.length > 0 && (
            <div className="favorite-genres">
              <h2>Your Favorite Genres</h2>
              <div className="genres-list">
                {stats.favoriteGenres.map((genre, index) => (
                  <div key={index} className="genre-item">
                    <span className="genre-name">{genre.genre}</span>
                    <span className="genre-count">{genre.count} tracks</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Purchases */}
          {recentPurchases.length > 0 && (
            <div className="recent-purchases">
              <h2>Recent Purchases</h2>
              <div className="purchases-list">
                {recentPurchases.map((purchase, index) => (
                  <div key={index} className="purchase-item">
                    <div className="purchase-info">
                      <div className="purchase-tracks">
                        {purchase.tracks.map((trackPurchase, trackIndex) => (
                          <div key={trackIndex} className="track-name">
                            {trackPurchase.track.title} by {trackPurchase.track.artist}
                          </div>
                        ))}
                      </div>
                      <div className="purchase-date">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="purchase-amount">
                      ${purchase.totalAmount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/library" className="btn btn-outline">
                View All Purchases
              </Link>
            </div>
          )}

          {/* Getting Started */}
          {stats.totalPurchases === 0 && (
            <div className="getting-started">
              <h2>Getting Started</h2>
              <div className="getting-started-content">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Browse Music</h3>
                    <p>Discover amazing tracks from talented artists</p>
                    <Link to="/browse" className="btn btn-primary">
                      Start Browsing
                    </Link>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Preview & Purchase</h3>
                    <p>Listen to previews and buy your favorite tracks</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Build Your Library</h3>
                    <p>Enjoy unlimited streaming of your purchased music</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
