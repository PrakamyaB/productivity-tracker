const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  targetHours: {
    type: Number,
    required: true,
    min: 0.5,
    max: 744, // max hours in a month
  },
  targetDays: {
    type: Number,
    min: 1,
    max: 31,
    default: null,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  achieved: {
    type: Boolean,
    default: false,
  },
  achievedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

goalSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Goal', goalSchema);
