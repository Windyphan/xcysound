const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { adminAuth } = require('../middleware/auth');
const Track = require('../models/Track');
const User = require('../models/User');
const Purchase = require('../models/Purchase');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'server/uploads/';

    if (file.fieldname === 'audioFile') {
      uploadPath += 'audio/';
    } else if (file.fieldname === 'previewFile') {
      uploadPath += 'previews/';
    } else if (file.fieldname === 'artwork') {
      uploadPath += 'artwork/';
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audioFile' || file.fieldname === 'previewFile') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for audio uploads'));
      }
    } else if (file.fieldname === 'artwork') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for artwork'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  }
});

// Get dashboard stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const totalTracks = await Track.countDocuments();
    const activeTracks = await Track.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPurchases = await Purchase.countDocuments();

    const totalRevenue = await Purchase.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentPurchases = await Purchase.find()
      .populate('user', 'username email')
      .populate('tracks.track', 'title artist price')
      .sort({ createdAt: -1 })
      .limit(10);

    const topTracks = await Track.find({ isActive: true })
      .sort({ purchaseCount: -1 })
      .limit(10)
      .select('title artist purchaseCount playCount');

    res.json({
      stats: {
        totalTracks,
        activeTracks,
        totalUsers,
        totalPurchases,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentPurchases,
      topTracks
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tracks for admin
router.get('/tracks', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (status) {
      query.isActive = status === 'active';
    }

    const tracks = await Track.find(query)
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
    console.error('Get admin tracks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload new track
router.post('/tracks', adminAuth, upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'previewFile', maxCount: 1 },
  { name: 'artwork', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      genre,
      duration,
      price,
      description,
      tags,
      previewStartTime,
      previewDuration
    } = req.body;

    if (!req.files.audioFile || !req.files.previewFile) {
      return res.status(400).json({ message: 'Audio file and preview file are required' });
    }

    const trackData = {
      title,
      artist,
      album,
      genre,
      duration: parseInt(duration),
      price: parseFloat(price),
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      audioFile: req.files.audioFile[0].filename,
      previewFile: req.files.previewFile[0].filename,
      previewStartTime: previewStartTime ? parseInt(previewStartTime) : 0,
      previewDuration: previewDuration ? parseInt(previewDuration) : 30
    };

    if (req.files.artwork) {
      trackData.artwork = req.files.artwork[0].filename;
    }

    const track = new Track(trackData);
    await track.save();

    res.status(201).json({
      message: 'Track uploaded successfully',
      track
    });
  } catch (error) {
    console.error('Upload track error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update track
router.put('/tracks/:id', adminAuth, upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'previewFile', maxCount: 1 },
  { name: 'artwork', maxCount: 1 }
]), async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const {
      title,
      artist,
      album,
      genre,
      duration,
      price,
      description,
      tags,
      previewStartTime,
      previewDuration,
      isActive
    } = req.body;

    // Update text fields
    if (title) track.title = title;
    if (artist) track.artist = artist;
    if (album) track.album = album;
    if (genre) track.genre = genre;
    if (duration) track.duration = parseInt(duration);
    if (price) track.price = parseFloat(price);
    if (description) track.description = description;
    if (tags) track.tags = tags.split(',').map(tag => tag.trim());
    if (previewStartTime !== undefined) track.previewStartTime = parseInt(previewStartTime);
    if (previewDuration !== undefined) track.previewDuration = parseInt(previewDuration);
    if (isActive !== undefined) track.isActive = isActive === 'true';

    // Update files if provided
    if (req.files.audioFile) {
      track.audioFile = req.files.audioFile[0].filename;
    }
    if (req.files.previewFile) {
      track.previewFile = req.files.previewFile[0].filename;
    }
    if (req.files.artwork) {
      track.artwork = req.files.artwork[0].filename;
    }

    await track.save();

    res.json({
      message: 'Track updated successfully',
      track
    });
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete track
router.delete('/tracks/:id', adminAuth, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    await Track.findByIdAndDelete(req.params.id);

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all purchases
router.get('/purchases', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const purchases = await Purchase.find()
      .populate('user', 'username email')
      .populate('tracks.track', 'title artist')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Purchase.countDocuments();

    res.json({
      purchases,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
