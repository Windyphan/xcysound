const express = require('express');
const { auth } = require('../middleware/auth');
const Track = require('../models/Track');
const User = require('../models/User');

const router = express.Router();

// Get all tracks (public - with preview only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, genre, artist } = req.query;
    const query = { isActive: true };

    // Build search query
    if (search) {
      query.$text = { $search: search };
    }
    if (genre) {
      query.genre = new RegExp(genre, 'i');
    }
    if (artist) {
      query.artist = new RegExp(artist, 'i');
    }

    const tracks = await Track.find(query)
      .select('-audioFile') // Don't expose full audio file path to public
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Track.countDocuments(query);

    res.json({
      tracks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get track details
router.get('/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track || !track.isActive) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Return track without full audio file path for non-owners
    const trackData = track.toObject();
    delete trackData.audioFile;

    res.json(trackData);
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stream preview (public)
router.get('/:id/preview', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track || !track.isActive) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Update play count
    track.playCount += 1;
    await track.save();

    // Return preview file path or serve file directly
    res.json({ previewUrl: `/uploads/previews/${track.previewFile}` });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stream full track (requires ownership)
router.get('/:id/stream', auth, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track || !track.isActive) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const user = await User.findById(req.userId);

    // Check if user owns the track
    if (!user.ownsTrack(track._id)) {
      return res.status(403).json({ message: 'Purchase required to access full track' });
    }

    // Return full audio file URL
    res.json({ audioUrl: `/uploads/audio/${track.audioFile}` });
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's purchased tracks
router.get('/user/library', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedTracks.trackId');

    const library = user.purchasedTracks.map(purchase => ({
      track: purchase.trackId,
      purchaseDate: purchase.purchaseDate,
      paymentId: purchase.paymentId
    }));

    res.json(library);
  } catch (error) {
    console.error('Library error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search tracks
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const tracks = await Track.find({
      $text: { $search: query },
      isActive: true
    })
    .select('-audioFile')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ score: { $meta: 'textScore' } });

    const total = await Track.countDocuments({
      $text: { $search: query },
      isActive: true
    });

    res.json({
      tracks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      query
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get genres
router.get('/meta/genres', async (req, res) => {
  try {
    const genres = await Track.distinct('genre', { isActive: true });
    res.json(genres);
  } catch (error) {
    console.error('Genres error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get artists
router.get('/meta/artists', async (req, res) => {
  try {
    const artists = await Track.distinct('artist', { isActive: true });
    res.json(artists);
  } catch (error) {
    console.error('Artists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
