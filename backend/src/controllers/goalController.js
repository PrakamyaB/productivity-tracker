const Goal = require('../models/Goal');
const HabitLog = require('../models/HabitLog');

// GET /api/goals
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id, isActive: true })
      .populate('habit', 'name color category icon')
      .sort({ createdAt: -1 });
    res.json({ goals });
  } catch (error) {
    next(error);
  }
};

// POST /api/goals
const createGoal = async (req, res, next) => {
  try {
    const { habitId, title, type, targetHours, targetDays, startDate, endDate } = req.body;

    const goal = await Goal.create({
      user: req.user._id,
      habit: habitId,
      title,
      type,
      targetHours,
      targetDays,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    await goal.populate('habit', 'name color category icon');
    res.status(201).json({ message: 'Goal created!', goal });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });
    goal.isActive = false;
    await goal.save();
    res.json({ message: 'Goal removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGoals, createGoal, deleteGoal };
