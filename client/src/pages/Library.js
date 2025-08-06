import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FiMusic, FiDownload, FiPlay, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Library.css';

const Library = () => {
  const { user, playTrack } = useApp();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLibrary, setFilteredLibrary] = useState([]);

  useEffect(() => {
    loadLibrary();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = library.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLibrary(filtered);
    } else {
      setFilteredLibrary(library);
    }
  }, [searchQuery, library]);

  const loadLibrary = async () => {
    try {
      const response = await fetch('/api/user/library', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLibrary(data.tracks || []);
        setFilteredLibrary(data.tracks || []);
      }
    } catch (error) {
      console.error('Failed to load library:', error);
      toast.error('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    // Play full version since user owns it
    playTrack(track, false);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading your library...</p>
      </div>
    );
  }

  return (
    <div className="library">
      <div className="container">
        <div className="library-header">
          <h1>
            <FiMusic /> My Music Library
          </h1>
          <p>Your purchased tracks - {library.length} songs</p>
        </div>

        {library.length === 0 ? (
          <div className="empty-library">
            <div className="empty-library-icon">🎵</div>
            <h2>Your library is empty</h2>
            <p>Start building your music collection by purchasing tracks</p>
            <a href="/browse" className="btn btn-primary">
              Browse Music
            </a>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="library-search">
              <div className="search-input-group">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search your library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="clear-search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Library Stats */}
            <div className="library-stats">
              <div className="stat">
                <span className="stat-number">{library.length}</span>
                <span className="stat-label">Total Tracks</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {new Set(library.map(track => track.artist)).size}
                </span>
                <span className="stat-label">Artists</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {new Set(library.map(track => track.genre)).size}
                </span>
                <span className="stat-label">Genres</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {Math.floor(library.reduce((sum, track) => sum + track.duration, 0) / 60)}
                </span>
                <span className="stat-label">Minutes</span>
              </div>
            </div>

            {/* Track List */}
            <div className="library-tracks">
              {filteredLibrary.length === 0 ? (
                <div className="no-results">
                  <p>No tracks found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="tracks-list">
                  <div className="tracks-header">
                    <span className="col-title">Title</span>
                    <span className="col-artist">Artist</span>
                    <span className="col-album">Album</span>
                    <span className="col-genre">Genre</span>
                    <span className="col-duration">Duration</span>
                    <span className="col-purchased">Purchased</span>
                    <span className="col-actions">Actions</span>
                  </div>

                  {filteredLibrary.map((track, index) => (
                    <div key={track._id} className="track-row">
                      <div className="track-main">
                        <div className="track-artwork">
                          {track.artwork ? (
                            <img src={`/uploads/artwork/${track.artwork}`} alt={track.title} />
                          ) : (
                            <div className="artwork-placeholder">🎵</div>
                          )}
                        </div>
                        <div className="track-info">
                          <div className="track-title">{track.title}</div>
                          <div className="track-artist-mobile">{track.artist}</div>
                        </div>
                      </div>
                      <span className="col-artist">{track.artist}</span>
                      <span className="col-album">{track.album || 'N/A'}</span>
                      <span className="col-genre">
                        <span className="genre-tag">{track.genre}</span>
                      </span>
                      <span className="col-duration">{formatDuration(track.duration)}</span>
                      <span className="col-purchased">
                        {track.purchaseDate ? formatDate(track.purchaseDate) : 'N/A'}
                      </span>
                      <div className="col-actions">
                        <button
                          onClick={() => handlePlayTrack(track)}
                          className="action-btn play-btn"
                          title="Play Track"
                        >
                          <FiPlay />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Library;
