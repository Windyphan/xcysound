const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  purchasedTracks: [{
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    paymentId: String
  }],
  cart: [{
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  profileImage: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user owns track
userSchema.methods.ownsTrack = function(trackId) {
  return this.purchasedTracks.some(purchase =>
    purchase.trackId.toString() === trackId.toString()
  );
};

module.exports = mongoose.model('User', userSchema);
