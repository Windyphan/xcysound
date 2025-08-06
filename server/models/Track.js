const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  album: {
    type: String,
    trim: true,
    maxlength: 100
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    maxlength: 500
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  // File paths
  audioFile: {
    type: String,
    required: true // Full track file
  },
  previewFile: {
    type: String,
    required: true // Preview clip (30-60 seconds)
  },
  artwork: {
    type: String, // Album/track artwork image
    default: null
  },
  // Metadata
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  playCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  // Preview settings
  previewStartTime: {
    type: Number,
    default: 0 // Start time for preview in seconds
  },
  previewDuration: {
    type: Number,
    default: 30 // Preview duration in seconds
  }
}, {
  timestamps: true
});

// Index for search functionality
trackSchema.index({
  title: 'text',
  artist: 'text',
  album: 'text',
  genre: 'text',
  tags: 'text'
});

// Virtual for formatted price
trackSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for formatted duration
trackSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

module.exports = mongoose.model('Track', trackSchema);
