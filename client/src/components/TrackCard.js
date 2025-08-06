import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FiPlay, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './TrackCard.css';

const TrackCard = ({ track }) => {
  const { user, isAuthenticated, addToCart, playTrack, cart } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const isInCart = cart.some(item => item.track._id === track._id);
  const isOwned = user?.purchasedTracks?.some(purchase =>
    purchase.trackId === track._id
  );

  const handlePlayPreview = async () => {
    // Play the track
    playTrack(track, true);

    // Update play count locally for immediate feedback
    track.playCount = (track.playCount || 0) + 1;

    // In a real app, you would make an API call here:
    // try {
    //   await fetch(`/api/music/${track._id}/play`, {
    //     method: 'POST',
    //     credentials: 'include'
    //   });
    // } catch (error) {
    //   console.error('Failed to update play count:', error);
    // }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add tracks to cart');
      return;
    }

    if (isOwned) {
      toast.info('You already own this track');
      return;
    }

    if (isInCart) {
      toast.info('Track already in cart');
      return;
    }

    setIsLoading(true);
    const result = await addToCart(track._id);

    if (result.success) {
      toast.success('Track added to cart!');
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="track-card">
      <div className="track-artwork">
        {track.artwork ? (
          <img
            src={`/uploads/artwork/${track.artwork}`}
            alt={track.title}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="artwork-placeholder" style={{display: track.artwork ? 'none' : 'flex'}}>
          🎵
        </div>

        <div className="track-overlay">
          <button
            className="play-btn"
            onClick={handlePlayPreview}
            title="Play Preview"
          >
            <FiPlay />
          </button>
        </div>
      </div>

      <div className="track-info">
        <h3 className="track-title">{track.title}</h3>
        <p className="track-artist">{track.artist}</p>
        {track.album && <p className="track-album">{track.album}</p>}

        <div className="track-meta">
          <span className="track-genre">{track.genre}</span>
          <span className="track-duration">{formatDuration(track.duration)}</span>
        </div>

        <div className="track-actions">
          <div className="track-price">${track.price.toFixed(2)}</div>

          {isOwned ? (
            <button className="btn btn-owned" disabled>
              Owned
            </button>
          ) : (
            <button
              className={`btn btn-cart ${isInCart ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={isLoading}
            >
              <FiShoppingCart />
              {isLoading ? 'Adding...' : isInCart ? 'In Cart' : 'Add to Cart'}
            </button>
          )}
        </div>

        <div className="track-stats">
          <span>🎧 {track.playCount || 0}</span>
          <span>💿 {track.purchaseCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
