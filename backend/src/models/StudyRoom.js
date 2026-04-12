const mongoose = require('mongoose');

const studyRoomSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  code: { type: String, required: true, unique: true, uppercase: true, length: 6 },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, default: 'General Study' },
  description: { type: String, default: '' },
  isPublic: { type: Boolean, default: true },
  maxMembers: { type: Number, default: 10 },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    joinedAt: { type: Date, default: Date.now },
    studyingTopic: { type: String, default: '' },
    totalMinutesStudied: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  }],
  totalSessions: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  endsAt: { type: Date, default: null },
}, { timestamps: true });

studyRoomSchema.index({ code: 1 });
studyRoomSchema.index({ isPublic: 1, isActive: 1 });

module.exports = mongoose.model('StudyRoom', studyRoomSchema);
