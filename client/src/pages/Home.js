import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TrackCard from '../components/TrackCard';
import './Home.css';

const Home = () => {
  const { loadTracks, isAuthenticated } = useApp();
  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load mock data instead of making API call
    loadMockTracks();
  }, []);

  const loadMockTracks = () => {
    // Mock featured tracks data
    const mockTracks = [
      {
        _id: '1',
        title: 'Neon Dreams',
        artist: 'Synthwave Collective',
        album: 'Digital Horizons',
        genre: 'Electronic',
        duration: 245,
        price: 1.99,
        artwork: null,
        playCount: 15420,
        purchaseCount: 342
      },
      {
        _id: '2',
        title: 'Midnight Drive',
        artist: 'RetroWave',
        album: 'Night City',
        genre: 'Synthwave',
        duration: 198,
        price: 2.49,
        artwork: null,
        playCount: 8930,
        purchaseCount: 156
      },
      {
        _id: '3',
        title: 'Pink Sunset',
        artist: 'Vaporwave Vibes',
        album: 'Aesthetic Dreams',
        genre: 'Vaporwave',
        duration: 223,
        price: 1.79,
        artwork: null,
        playCount: 12680,
        purchaseCount: 278
      },
      {
        _id: '4',
        title: 'Electric Love',
        artist: 'Cyber Romance',
        album: 'Digital Hearts',
        genre: 'Pop',
        duration: 187,
        price: 2.99,
        artwork: null,
        playCount: 23450,
        purchaseCount: 567
      },
      {
        _id: '5',
        title: 'Neon Lights',
        artist: 'Future Bass',
        album: 'City Glow',
        genre: 'Electronic',
        duration: 234,
        price: 2.29,
        artwork: null,
        playCount: 18720,
        purchaseCount: 423
      },
      {
        _id: '6',
        title: 'Pink Paradise',
        artist: 'Dream Pop',
        album: 'Cotton Candy',
        genre: 'Dream Pop',
        duration: 201,
        price: 1.99,
        artwork: null,
        playCount: 9840,
        purchaseCount: 198
      },
      {
        _id: '7',
        title: 'Dark Wave',
        artist: 'Shadow Synth',
        album: 'Black Mirror',
        genre: 'Dark Synth',
        duration: 267,
        price: 2.79,
        artwork: null,
        playCount: 14560,
        purchaseCount: 321
      },
      {
        _id: '8',
        title: 'Rose Gold',
        artist: 'Ambient Dreams',
        album: 'Soft Glow',
        genre: 'Ambient',
        duration: 298,
        price: 1.49,
        artwork: null,
        playCount: 7230,
        purchaseCount: 145
      }
    ];

    setFeaturedTracks(mockTracks);
    setLoading(false);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div>
            <h1>Discover Amazing Music</h1>
            <p>Stream previews, purchase tracks, and build your personal music library with the hottest tracks in electronic, synthwave, and ambient music.</p>
            <div className="hero-buttons">
              <Link to="/browse" className="btn btn-primary">
                Browse Music
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-secondary">
                  Get Started
                </Link>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="music-notes">
              <span>♪</span>
              <span>♫</span>
              <span>♪</span>
              <span>♫</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose XcySound?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎵</div>
              <h3>Preview First</h3>
              <p>Listen to 30-60 second previews of any track before purchasing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Secure Payments</h3>
              <p>Safe and secure payment processing with Stripe integration</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Enjoy your music on any device - desktop, tablet, or mobile</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Discovery</h3>
              <p>Search and filter by artist, genre, or track name</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tracks */}
      <section className="featured-tracks">
        <div className="container">
          <h2>Featured Tracks</h2>
          {loading ? (
            <div className="loading">Loading featured tracks...</div>
          ) : (
            <div className="tracks-grid">
              {featuredTracks.map(track => (
                <TrackCard key={track._id} track={track} />
              ))}
            </div>
          )}
          <div className="see-more">
            <Link to="/browse" className="btn btn-outline">
              Browse All Music
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
