const Assignment = require('../models/Assignment');
const Gamification = require('../models/Gamification');

const getAll = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id })
      .sort({ dueDate: 1 });

    // Auto-mark overdue
    const now = new Date();
    for (const a of assignments) {
      if (a.status === 'pending' && a.dueDate < now) {
        a.status = 'overdue';
        await a.save();
      }
    }
    res.json({ assignments });
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { title, subject, description, dueDate, priority, type, maxMarks } = req.body;
    const assignment = await Assignment.create({
      user: req.user._id, title, subject, description,
      dueDate: new Date(dueDate), priority, type, maxMarks,
    });
    res.status(201).json({ message: 'Assignment created!', assignment });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user._id });
    if (!assignment) return res.status(404).json({ error: 'Not found' });

    const fields = ['title', 'subject', 'description', 'dueDate', 'priority', 'status', 'type', 'grade', 'maxMarks'];
    fields.forEach(f => { if (req.body[f] !== undefined) assignment[f] = req.body[f]; });

    // Award XP + badge when completed
    if (req.body.status === 'completed' && assignment.status !== 'completed') {
      assignment.completedAt = new Date();
      let gam = await Gamification.findOne({ user: req.user._id });
      if (!gam) gam = await Gamification.create({ user: req.user._id });
      await gam.addXP(assignment.xpReward, 'assignment_complete');
      await gam.awardBadge('assignment_done');
    }

    await assignment.save();
    res.json({ message: 'Updated!', assignment });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted.' });
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
