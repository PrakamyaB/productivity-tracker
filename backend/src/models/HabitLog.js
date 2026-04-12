const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
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
    index: true,
  },
  date: {
    type: Date,
    required: true,
    // Store as start of day UTC for consistent querying
  },
  hoursSpent: {
    type: Number,
    required: true,
    min: [0, 'Hours cannot be negative'],
    max: [24, 'Hours cannot exceed 24'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: '',
  },
  mood: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
}, {
  timestamps: true,
});

// Unique constraint: one log per habit per day per user
habitLogSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });
habitLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('HabitLog', habitLogSchema);
