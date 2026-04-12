const { validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// GET /api/habits
const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true })
      .sort({ order: 1, createdAt: 1 });
    res.json({ habits });
  } catch (error) {
    next(error);
  }
};

// POST /api/habits
const createHabit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, color, icon, targetHoursPerDay, targetDaysPerWeek } = req.body;

    // Get next order value
    const count = await Habit.countDocuments({ user: req.user._id, isActive: true });

    const habit = await Habit.create({
      user: req.user._id,
      name,
      description,
      category,
      color,
      icon,
      targetHoursPerDay,
      targetDaysPerWeek,
      order: count,
    });

    res.status(201).json({ message: 'Habit created!', habit });
  } catch (error) {
    next(error);
  }
};

// PUT /api/habits/:id
const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    const allowedUpdates = ['name', 'description', 'category', 'color', 'icon', 'targetHoursPerDay', 'targetDaysPerWeek', 'order'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) habit[field] = req.body[field];
    });

    await habit.save();
    res.json({ message: 'Habit updated!', habit });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/habits/:id (soft delete)
const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    habit.isActive = false;
    await habit.save();
    res.json({ message: 'Habit deleted.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/habits/:id/stats
const getHabitStats = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await HabitLog.find({
      habit: habit._id,
      user: req.user._id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    const totalHours = logs.reduce((sum, log) => sum + log.hoursSpent, 0);
    const completedDays = logs.filter(l => l.completed).length;

    res.json({
      habit,
      stats: {
        last30Days: {
          totalHours: Math.round(totalHours * 10) / 10,
          completedDays,
          logs,
        },
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        totalHoursAllTime: habit.totalHoursLogged,
        totalDaysLogged: habit.totalDaysLogged,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHabits, createHabit, updateHabit, deleteHabit, getHabitStats };
