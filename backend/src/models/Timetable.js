const mongoose = require('mongoose');

const classSlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "10:00"
  subject: { type: String, required: true },
  professor: { type: String, default: '' },
  room: { type: String, default: '' },
  type: { type: String, enum: ['lecture', 'lab', 'tutorial', 'seminar'], default: 'lecture' },
  color: { type: String, default: '#6366f1' },
});

const timetableSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  semester: { type: String, default: 'Current Semester' },
  slots: [classSlotSchema],
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
