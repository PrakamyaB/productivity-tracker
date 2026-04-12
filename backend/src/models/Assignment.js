const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '', maxlength: 1000 },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'], default: 'pending' },
  type: { type: String, enum: ['assignment', 'project', 'lab', 'presentation', 'quiz', 'other'], default: 'assignment' },
  grade: { type: Number, default: null, min: 0, max: 100 },
  maxMarks: { type: Number, default: 100 },
  xpReward: { type: Number, default: 50 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

assignmentSchema.index({ user: 1, dueDate: 1 });
module.exports = mongoose.model('Assignment', assignmentSchema);
