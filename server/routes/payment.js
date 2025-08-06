const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const Track = require('../models/Track');
const User = require('../models/User');
const Purchase = require('../models/Purchase');

const router = express.Router();

// Add track to cart
router.post('/cart/add', auth, async (req, res) => {
  try {
    const { trackId } = req.body;

    const track = await Track.findById(trackId);
    if (!track || !track.isActive) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const user = await User.findById(req.userId);

    // Check if user already owns this track
    if (user.ownsTrack(trackId)) {
      return res.status(400).json({ message: 'You already own this track' });
    }

    // Check if track is already in cart
    const existingCartItem = user.cart.find(item =>
      item.trackId.toString() === trackId
    );

    if (existingCartItem) {
      return res.status(400).json({ message: 'Track already in cart' });
    }

    user.cart.push({ trackId });
    await user.save();

    res.json({ message: 'Track added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove track from cart
router.delete('/cart/remove/:trackId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.cart = user.cart.filter(item =>
      item.trackId.toString() !== req.params.trackId
    );
    await user.save();

    res.json({ message: 'Track removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart contents
router.get('/cart', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart.trackId');

    const cartItems = user.cart.map(item => ({
      track: item.trackId,
      addedAt: item.addedAt
    }));

    const totalAmount = cartItems.reduce((sum, item) => sum + item.track.price, 0);

    res.json({
      items: cartItems,
      totalAmount,
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment intent (Stripe)
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart.trackId');

    if (user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = user.cart.reduce((sum, item) => sum + item.track.price, 0);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.userId,
        trackIds: user.cart.map(item => item.trackId._id.toString()).join(',')
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm payment and complete purchase
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const user = await User.findById(req.userId).populate('cart.trackId');

    if (user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create purchase record
    const purchaseData = {
      user: req.userId,
      tracks: user.cart.map(item => ({
        track: item.trackId._id,
        price: item.trackId.price
      })),
      totalAmount: user.cart.reduce((sum, item) => sum + item.trackId.price, 0),
      paymentMethod: 'stripe',
      paymentId: paymentIntentId,
      paymentStatus: 'completed',
      transactionId: paymentIntent.id
    };

    const purchase = new Purchase(purchaseData);
    await purchase.save();

    // Add tracks to user's purchased tracks
    const purchasedTracks = user.cart.map(item => ({
      trackId: item.trackId._id,
      purchaseDate: new Date(),
      paymentId: paymentIntentId
    }));

    user.purchasedTracks.push(...purchasedTracks);

    // Update track purchase counts
    for (const item of user.cart) {
      await Track.findByIdAndUpdate(item.trackId._id, {
        $inc: { purchaseCount: 1 }
      });
    }

    // Clear cart
    user.cart = [];
    await user.save();

    res.json({
      message: 'Purchase completed successfully',
      purchaseId: purchase._id,
      tracks: purchasedTracks.length
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get purchase history
router.get('/purchases', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.userId })
      .populate('tracks.track')
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    console.error('Purchase history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
