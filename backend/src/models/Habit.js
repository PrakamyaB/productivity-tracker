const mongoose = require('mongoose');

const CATEGORIES = ['Study', 'Health', 'Personal', 'Work', 'Fitness', 'Mindfulness', 'Creative', 'Social', 'Other'];
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316'];

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  category: {
    type: String,
    enum: CATEGORIES,
    default: 'Personal',
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  icon: {
    type: String,
    default: '📌',
  },
  targetHoursPerDay: {
    type: Number,
    default: 1,
    min: 0,
    max: 24,
  },
  targetDaysPerWeek: {
    type: Number,
    default: 7,
    min: 1,
    max: 7,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastLoggedDate: {
    type: Date,
    default: null,
  },
  totalDaysLogged: {
    type: Number,
    default: 0,
  },
  totalHoursLogged: {
    type: Number,
    default: 0,
  },
  // Order for display
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index for user + active habits
habitSchema.index({ user: 1, isActive: 1 });
habitSchema.index({ user: 1, category: 1 });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
module.exports.CATEGORIES = CATEGORIES;
module.exports.COLORS = COLORS;
