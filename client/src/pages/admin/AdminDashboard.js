import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiMusic, FiDollarSign, FiShoppingBag, FiTrendingUp, FiPlus } from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTracks: 0,
    activeTracks: 0,
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0
  });
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentPurchases(data.recentPurchases || []);
        setTopTracks(data.topTracks || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your music streaming platform</p>
          <Link to="/admin/upload" className="btn btn-primary">
            <FiPlus /> Upload New Track
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon music">
              <FiMusic />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalTracks}</div>
              <div className="stat-label">Total Tracks</div>
              <div className="stat-sublabel">{stats.activeTracks} active</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon users">
              <FiUsers />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Registered Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purchases">
              <FiShoppingBag />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalPurchases}</div>
              <div className="stat-label">Total Purchases</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content">
          {/* Recent Purchases */}
          <div className="admin-section">
            <h2>Recent Purchases</h2>
            <div className="purchases-table">
              {recentPurchases.length === 0 ? (
                <p className="no-data">No recent purchases</p>
              ) : (
                <div className="table-container">
                  <div className="table-header">
                    <span>User</span>
                    <span>Tracks</span>
                    <span>Amount</span>
                    <span>Date</span>
                  </div>
                  {recentPurchases.map((purchase, index) => (
                    <div key={index} className="table-row">
                      <div className="user-info">
                        <div className="user-name">{purchase.user?.username}</div>
                        <div className="user-email">{purchase.user?.email}</div>
                      </div>
                      <div className="purchase-tracks">
                        {purchase.tracks.map((track, trackIndex) => (
                          <div key={trackIndex} className="track-name">
                            {track.track?.title}
                          </div>
                        ))}
                      </div>
                      <div className="purchase-amount">
                        {formatCurrency(purchase.totalAmount)}
                      </div>
                      <div className="purchase-date">
                        {formatDate(purchase.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Tracks */}
          <div className="admin-section">
            <h2>Top Performing Tracks</h2>
            <div className="top-tracks">
              {topTracks.length === 0 ? (
                <p className="no-data">No track data available</p>
              ) : (
                <div className="tracks-grid">
                  {topTracks.map((track, index) => (
                    <div key={track._id} className="track-card">
                      <div className="track-rank">#{index + 1}</div>
                      <div className="track-info">
                        <div className="track-title">{track.title}</div>
                        <div className="track-artist">{track.artist}</div>
                      </div>
                      <div className="track-stats">
                        <div className="stat">
                          <FiShoppingBag />
                          <span>{track.purchaseCount} sales</span>
                        </div>
                        <div className="stat">
                          <FiTrendingUp />
                          <span>{track.playCount} plays</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <Link to="/admin/upload" className="action-card">
                <FiPlus />
                <span>Upload Track</span>
              </Link>
              <Link to="/admin/tracks" className="action-card">
                <FiMusic />
                <span>Manage Tracks</span>
              </Link>
              <Link to="/admin/users" className="action-card">
                <FiUsers />
                <span>Manage Users</span>
              </Link>
              <Link to="/admin/purchases" className="action-card">
                <FiShoppingBag />
                <span>View Purchases</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
