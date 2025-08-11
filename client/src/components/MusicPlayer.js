import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX } from 'react-icons/fi';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const { currentTrack, isPlaying, isPreviewMode, user, dispatch } = useApp();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentTrack && isPlaying) {
      loadTrackAudio();
    }
  }, [currentTrack, isPlaying, isPreviewMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [dispatch]);

  const loadTrackAudio = async () => {
    if (!currentTrack) return;

    try {
      let url;
      if (isPreviewMode) {
        // Load preview
        const response = await fetch(`/api/music/${currentTrack._id}/preview`);
        const data = await response.json();
        url = data.previewUrl;
      } else {
        // Load full track (requires ownership)
        const response = await fetch(`/api/music/${currentTrack._id}/stream`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          url = data.audioUrl;
        } else {
          // Fallback to preview if full track access denied
          const previewResponse = await fetch(`/api/music/${currentTrack._id}/preview`);
          const previewData = await previewResponse.json();
          url = previewData.previewUrl;
          dispatch({ type: 'SET_PREVIEW_MODE', payload: true });
        }
      }

      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to load track audio:', error);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    dispatch({ type: 'SET_PLAYING', payload: !isPlaying });
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const closePlayer = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    dispatch({ type: 'SET_CURRENT_TRACK', payload: null });
    dispatch({ type: 'SET_PLAYING', payload: false });
    setCurrentTime(0);
    setDuration(0);
  };

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={audioUrl}
        volume={volume}
        onPlay={() => dispatch({ type: 'SET_PLAYING', payload: true })}
        onPause={() => dispatch({ type: 'SET_PLAYING', payload: false })}
      />

      <div className="player-content">
        {/* Track Info */}
        <div className="player-track-info">
          <div className="player-track-artwork">
            {currentTrack.artwork ? (
              <img src={`/uploads/artwork/${currentTrack.artwork}`} alt={currentTrack.title} />
            ) : (
              <div className="player-artwork-placeholder">🎵</div>
            )}
          </div>
          <div className="player-track-details">
            <div className="player-track-title">{currentTrack.title}</div>
            <div className="player-track-artist">{currentTrack.artist}</div>
            {isPreviewMode && (
              <div className="player-preview-badge">Preview Mode</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="player-controls">
          <div className="control-buttons">
            <button className="control-btn">
              <FiSkipBack />
            </button>
            <button className="play-pause-btn" onClick={togglePlayPause}>
              {isPlaying ? <FiPause /> : <FiPlay />}
            </button>
            <button className="control-btn">
              <FiSkipForward />
            </button>
          </div>

          <div className="progress-section">
            <span className="time-current">{formatTime(currentTime)}</span>
            <div className="progress-bar" onClick={handleSeek}>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <span className="time-duration">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Close */}
        <div className="player-extras">
          <div className="volume-control">
            <button onClick={toggleMute} className="volume-btn">
              {isMuted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
          <button onClick={closePlayer} className="close-btn">
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
