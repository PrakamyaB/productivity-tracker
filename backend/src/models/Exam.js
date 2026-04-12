const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true },
  examDate: { type: Date, required: true },
  examTime: { type: String, default: '09:00' },
  venue: { type: String, default: '' },
  type: { type: String, enum: ['midterm', 'final', 'quiz', 'practical', 'viva', 'other'], default: 'final' },
  syllabus: { type: String, default: '' },
  preparationStatus: { type: Number, min: 0, max: 100, default: 0 }, // % prepared
  notes: { type: String, default: '' },
  grade: { type: String, default: null }, // after exam
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

examSchema.index({ user: 1, examDate: 1 });
module.exports = mongoose.model('Exam', examSchema);
