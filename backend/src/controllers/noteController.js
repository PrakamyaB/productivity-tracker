const Note = require('../models/Note');
const Gamification = require('../models/Gamification');

const getAll = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id, isArchived: false })
      .sort({ isPinned: -1, updatedAt: -1 });
    res.json({ notes });
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { title, content, subject, tags, color } = req.body;
    const note = await Note.create({ user: req.user._id, title, content, subject, tags, color });

    // Note taker badge
    const count = await Note.countDocuments({ user: req.user._id });
    if (count >= 10) {
      let gam = await Gamification.findOne({ user: req.user._id });
      if (!gam) gam = await Gamification.create({ user: req.user._id });
      await gam.awardBadge('note_taker');
    }
    res.status(201).json({ message: 'Note saved!', note });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Not found' });
    const fields = ['title', 'content', 'subject', 'tags', 'color', 'isPinned', 'isArchived'];
    fields.forEach(f => { if (req.body[f] !== undefined) note[f] = req.body[f]; });
    await note.save();
    res.json({ message: 'Updated!', note });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted.' });
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
