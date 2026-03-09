import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  service: {
    type: String,
    required: true
  },
  coordinates: {
    lat: { type: Number, default: 22.57 },
    lng: { type: Number, default: 88.36 }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  distance: {
    type: String,
    default: '0 km'
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    default: 0
  },
  jobsDone: {
    type: Number,
    default: 0
  },
  about: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  hourlyRate: {
    type: Number,
    default: 300
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  reviews: [{
    userName: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;
