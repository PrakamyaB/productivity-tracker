const Semester = require('../models/Semester');
const Gamification = require('../models/Gamification');

const calculateSGPA = (subjects) => {
  const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
  const weightedSum = subjects.reduce((s, sub) => s + (sub.gradePoint * sub.credits), 0);
  return totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0;
};

const calculateCGPA = (semesters) => {
  const totalCredits = semesters.reduce((s, sem) => s + sem.totalCredits, 0);
  const weightedSum = semesters.reduce((s, sem) => s + (sem.sgpa * sem.totalCredits), 0);
  return totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0;
};

const getAll = async (req, res, next) => {
  try {
    const semesters = await Semester.find({ user: req.user._id, isActive: true }).sort({ semesterNumber: 1 });
    const cgpa = calculateCGPA(semesters);
    res.json({ semesters, cgpa });
  } catch (e) { next(e); }
};

const createSemester = async (req, res, next) => {
  try {
    const { semesterName, semesterNumber, subjects } = req.body;
    const processedSubjects = (subjects || []).map(s => ({
      ...s,
      gradePoint: parseFloat(s.gradePoint),
      credits: parseFloat(s.credits),
    }));
    const sgpa = calculateSGPA(processedSubjects);
    const totalCredits = processedSubjects.reduce((s, sub) => s + sub.credits, 0);

    const semester = await Semester.create({
      user: req.user._id, semesterName, semesterNumber,
      subjects: processedSubjects, sgpa, totalCredits,
    });

    // Check CGPA badge
    const allSems = await Semester.find({ user: req.user._id, isActive: true });
    const cgpa = calculateCGPA([...allSems, semester]);
    if (cgpa >= 8.0) {
      let gam = await Gamification.findOne({ user: req.user._id });
      if (!gam) gam = await Gamification.create({ user: req.user._id });
      await gam.awardBadge('cgpa_hero');
    }

    res.status(201).json({ message: 'Semester added!', semester, sgpa });
  } catch (e) { next(e); }
};

const updateSemester = async (req, res, next) => {
  try {
    const sem = await Semester.findOne({ _id: req.params.id, user: req.user._id });
    if (!sem) return res.status(404).json({ error: 'Not found' });

    const { semesterName, subjects } = req.body;
    if (semesterName) sem.semesterName = semesterName;
    if (subjects) {
      sem.subjects = subjects.map(s => ({ ...s, gradePoint: parseFloat(s.gradePoint), credits: parseFloat(s.credits) }));
      sem.sgpa = calculateSGPA(sem.subjects);
      sem.totalCredits = sem.subjects.reduce((s, sub) => s + sub.credits, 0);
    }
    await sem.save();
    res.json({ message: 'Updated!', semester: sem });
  } catch (e) { next(e); }
};

const deleteSemester = async (req, res, next) => {
  try {
    await Semester.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted.' });
  } catch (e) { next(e); }
};

module.exports = { getAll, createSemester, updateSemester, deleteSemester };
