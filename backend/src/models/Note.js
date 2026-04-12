const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Untitled Note', maxlength: 200 },
  content: { type: String, default: '', maxlength: 10000 },
  subject: { type: String, default: 'General' },
  tags: [{ type: String, maxlength: 30 }],
  color: { type: String, default: '#6366f1' },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });
module.exports = mongoose.model('Note', noteSchema);
