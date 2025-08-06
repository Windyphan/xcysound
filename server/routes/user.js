const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Track = require('../models/Track');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('purchasedTracks.trackId', 'title artist artwork price');

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().isLength({ min: 1 }).trim(),
  body('lastName').optional().isLength({ min: 1 }).trim(),
  body('username').optional().isLength({ min: 3, max: 20 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, username } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken (if being updated)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    const updatedUser = await User.findById(req.userId).select('-password');
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's library (purchased tracks)
router.get('/library', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const user = await User.findById(req.userId);

    let purchasedTrackIds = user.purchasedTracks.map(p => p.trackId);

    let query = { _id: { $in: purchasedTrackIds } };

    if (search) {
      query.$text = { $search: search };
    }

    const tracks = await Track.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Track.countDocuments(query);

    // Add purchase information to each track
    const tracksWithPurchaseInfo = tracks.map(track => {
      const purchaseInfo = user.purchasedTracks.find(p =>
        p.trackId.toString() === track._id.toString()
      );
      return {
        ...track.toObject(),
        purchaseDate: purchaseInfo?.purchaseDate,
        paymentId: purchaseInfo?.paymentId
      };
    });

    res.json({
      tracks: tracksWithPurchaseInfo,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedTracks.trackId');

    const totalPurchases = user.purchasedTracks.length;
    const totalSpent = user.purchasedTracks.reduce((sum, purchase) => {
      return sum + (purchase.trackId?.price || 0);
    }, 0);

    // Get favorite genres based on purchases
    const genreCounts = {};
    user.purchasedTracks.forEach(purchase => {
      if (purchase.trackId?.genre) {
        genreCounts[purchase.trackId.genre] = (genreCounts[purchase.trackId.genre] || 0) + 1;
      }
    });

    const favoriteGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    res.json({
      totalPurchases,
      totalSpent: totalSpent.toFixed(2),
      favoriteGenres,
      joinDate: user.createdAt,
      cartItems: user.cart.length
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
