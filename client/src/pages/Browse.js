import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import TrackCard from '../components/TrackCard';
import { FiSearch, FiFilter } from 'react-icons/fi';
import './Browse.css';

const Browse = () => {
  const { loadTracks, searchTracks } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: searchParams.get('genre') || '',
    artist: '',
    priceRange: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);

  // Mock data for all tracks
  const getAllMockTracks = () => {
    return [
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
      },
      {
        _id: '9',
        title: 'Cyber Dreams',
        artist: 'Digital Prophet',
        album: 'Matrix Sound',
        genre: 'Synthwave',
        duration: 312,
        price: 2.19,
        artwork: null,
        playCount: 11240,
        purchaseCount: 287
      },
      {
        _id: '10',
        title: 'Ocean Waves',
        artist: 'Nature Sounds',
        album: 'Peaceful Mind',
        genre: 'Ambient',
        duration: 420,
        price: 0.99,
        artwork: null,
        playCount: 5670,
        purchaseCount: 89
      },
      {
        _id: '11',
        title: 'Retro Nights',
        artist: 'Neon Rider',
        album: 'Highway Dreams',
        genre: 'Synthwave',
        duration: 256,
        price: 1.89,
        artwork: null,
        playCount: 9876,
        purchaseCount: 203
      },
      {
        _id: '12',
        title: 'Digital Heart',
        artist: 'Cyber Love',
        album: 'Electric Romance',
        genre: 'Pop',
        duration: 189,
        price: 2.49,
        artwork: null,
        playCount: 16540,
        purchaseCount: 445
      }
    ];
  };

  useEffect(() => {
    loadMockData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, searchParams]);

  const loadMockData = () => {
    const allTracks = getAllMockTracks();

    // Extract unique genres and artists for filters
    const uniqueGenres = [...new Set(allTracks.map(track => track.genre))];
    const uniqueArtists = [...new Set(allTracks.map(track => track.artist))];

    setGenres(uniqueGenres);
    setArtists(uniqueArtists);

    // Apply initial filters
    applyFilters(allTracks);
  };

  const applyFilters = (allTracks = null) => {
    setLoading(true);

    let filteredTracks = allTracks || getAllMockTracks();

    // Apply genre filter from URL params or state
    const genreFilter = searchParams.get('genre') || filters.genre;
    if (genreFilter) {
      filteredTracks = filteredTracks.filter(track =>
        track.genre.toLowerCase() === genreFilter.toLowerCase()
      );
    }

    // Apply artist filter
    if (filters.artist) {
      filteredTracks = filteredTracks.filter(track =>
        track.artist.toLowerCase().includes(filters.artist.toLowerCase())
      );
    }

    // Apply price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.includes('+')
        ? [parseFloat(filters.priceRange), Infinity]
        : filters.priceRange.split('-').map(parseFloat);

      filteredTracks = filteredTracks.filter(track =>
        track.price >= min && (max ? track.price <= max : true)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTracks = filteredTracks.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album?.toLowerCase().includes(query) ||
        track.genre.toLowerCase().includes(query)
      );
    }

    setTracks(filteredTracks);
    setPagination({
      currentPage: 1,
      totalPages: Math.ceil(filteredTracks.length / 20),
      total: filteredTracks.length
    });
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    const data = await searchTracks(searchQuery, {
      page: pagination.currentPage,
      limit: 20,
      ...filters
    });
    setTracks(data.tracks || []);
    setPagination({
      currentPage: pagination.currentPage,
      totalPages: data.totalPages || 1,
      total: data.total || 0
    });
    setLoading(false);
  };

  const loadFilteredTracks = async () => {
    setLoading(true);
    const params = {
      page: pagination.currentPage,
      limit: 20,
      ...filters
    };

    const data = await loadTracks(params);
    setTracks(data.tracks || []);
    setPagination({
      currentPage: pagination.currentPage,
      totalPages: data.totalPages || 1,
      total: data.total || 0
    });
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
    handleSearch();
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(filterType, value);
    } else {
      newSearchParams.delete(filterType);
    }
    setSearchParams(newSearchParams);

    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPagination({ ...pagination, currentPage: 1 });
    loadFilteredTracks();
  };

  return (
    <div className="browse">
      <div className="browse-header">
        <div className="container">
          <h1>Browse Music</h1>
          <p>Discover amazing tracks from talented artists</p>
        </div>
      </div>

      <div className="browse-content">
        <div className="container">
          {/* Search Bar */}
          <div className="search-section">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-group">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search for tracks, artists, or albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="clear-search"
                  >
                    ×
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary search-btn">
                Search
              </button>
            </form>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filters-header">
              <FiFilter /> Filters
            </div>
            <div className="filters-grid">
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="filter-select"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              <select
                value={filters.artist}
                onChange={(e) => handleFilterChange('artist', e.target.value)}
                className="filter-select"
              >
                <option value="">All Artists</option>
                {artists.map(artist => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
              </select>

              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Prices</option>
                <option value="0-1">$0 - $1</option>
                <option value="1-5">$1 - $5</option>
                <option value="5-10">$5 - $10</option>
                <option value="10+">$10+</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="results-section">
            <div className="results-header">
              <h2>
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Tracks'}
              </h2>
              <p>{pagination.total} tracks found</p>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading tracks...</p>
              </div>
            ) : (
              <>
                {tracks.length > 0 ? (
                  <div className="tracks-grid">
                    {tracks.map(track => (
                      <TrackCard key={track._id} track={track} />
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <h3>No tracks found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="btn btn-outline"
                    >
                      Previous
                    </button>

                    <div className="page-numbers">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page =>
                          page === 1 ||
                          page === pagination.totalPages ||
                          Math.abs(page - pagination.currentPage) <= 2
                        )
                        .map(page => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`page-btn ${page === pagination.currentPage ? 'active' : ''}`}
                          >
                            {page}
                          </button>
                        ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="btn btn-outline"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;

