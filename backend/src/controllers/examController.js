const Exam = require('../models/Exam');
const Gamification = require('../models/Gamification');

const getAll = async (req, res, next) => {
  try {
    const exams = await Exam.find({ user: req.user._id }).sort({ examDate: 1 });
    const now = new Date();
    const enriched = exams.map(e => {
      const daysLeft = Math.ceil((new Date(e.examDate) - now) / (1000 * 60 * 60 * 24));
      return { ...e.toObject(), daysLeft };
    });
    res.json({ exams: enriched });
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { subject, examDate, examTime, venue, type, syllabus } = req.body;
    const exam = await Exam.create({
      user: req.user._id, subject, examDate: new Date(examDate),
      examTime, venue, type, syllabus
    });
    res.status(201).json({ message: 'Exam added!', exam });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ error: 'Not found' });

    const fields = ['subject', 'examDate', 'examTime', 'venue', 'type', 'syllabus', 'preparationStatus', 'notes', 'grade', 'isCompleted'];
    fields.forEach(f => { if (req.body[f] !== undefined) exam[f] = req.body[f]; });

    if (req.body.preparationStatus === 100) {
      let gam = await Gamification.findOne({ user: req.user._id });
      if (!gam) gam = await Gamification.create({ user: req.user._id });
      await gam.awardBadge('exam_ready');
      await gam.addXP(75, 'exam_fully_prepared');
    }

    await exam.save();
    res.json({ message: 'Updated!', exam });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted.' });
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
