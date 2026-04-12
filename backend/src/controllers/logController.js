const { validationResult } = require('express-validator');
const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');

// Helper: get start of day UTC
const startOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Helper: recalculate streak for a habit
const recalculateStreak = async (habitId, userId) => {
  const logs = await HabitLog.find({
    habit: habitId,
    user: userId,
    completed: true,
  }).sort({ date: -1 });

  if (logs.length === 0) {
    await Habit.findByIdAndUpdate(habitId, { currentStreak: 0 });
    return 0;
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  const today = startOfDay(new Date());

  // Check if most recent log is today or yesterday (streak still active)
  const mostRecentDate = startOfDay(logs[0].date);
  const diffFromToday = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));

  if (diffFromToday > 1) {
    // Streak broken
    currentStreak = 0;
  } else {
    currentStreak = 1;
    for (let i = 1; i < logs.length; i++) {
      const prev = startOfDay(logs[i - 1].date);
      const curr = startOfDay(logs[i].date);
      const diff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < logs.length; i++) {
    const prev = startOfDay(logs[i - 1].date);
    const curr = startOfDay(logs[i].date);
    const diff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

  await Habit.findByIdAndUpdate(habitId, {
    currentStreak,
    longestStreak: { $max: longestStreak }, // only update if higher
  });

  // Use direct update to handle $max
  const habit = await Habit.findById(habitId);
  if (longestStreak > habit.longestStreak) {
    habit.longestStreak = longestStreak;
  }
  habit.currentStreak = currentStreak;
  await habit.save();

  return currentStreak;
};

// POST /api/logs
const createOrUpdateLog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { habitId, date, hoursSpent, completed, notes, mood } = req.body;

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    const logDate = startOfDay(date || new Date());

    // Upsert log for this habit/date
    const existingLog = await HabitLog.findOne({
      habit: habitId,
      user: req.user._id,
      date: logDate,
    });

    let log;
    let isNew = false;

    if (existingLog) {
      const prevHours = existingLog.hoursSpent;
      existingLog.hoursSpent = hoursSpent;
      existingLog.completed = completed;
      if (notes !== undefined) existingLog.notes = notes;
      if (mood !== undefined) existingLog.mood = mood;
      log = await existingLog.save();

      // Update habit total hours
      habit.totalHoursLogged = Math.max(0, habit.totalHoursLogged - prevHours + hoursSpent);
    } else {
      log = await HabitLog.create({
        user: req.user._id,
        habit: habitId,
        date: logDate,
        hoursSpent,
        completed,
        notes,
        mood,
      });
      isNew = true;
      habit.totalHoursLogged += hoursSpent;
      habit.totalDaysLogged += 1;
      habit.lastLoggedDate = logDate;
    }

    await habit.save();

    // Recalculate streak
    await recalculateStreak(habitId, req.user._id);

    // Fetch updated habit
    const updatedHabit = await Habit.findById(habitId);

    res.status(isNew ? 201 : 200).json({
      message: isNew ? 'Log created!' : 'Log updated!',
      log,
      habit: updatedHabit,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Log already exists for this date.' });
    }
    next(error);
  }
};

// GET /api/logs?date=YYYY-MM-DD
const getLogsByDate = async (req, res, next) => {
  try {
    const date = req.query.date ? startOfDay(req.query.date) : startOfDay(new Date());

    const logs = await HabitLog.find({
      user: req.user._id,
      date,
    }).populate('habit', 'name category color icon targetHoursPerDay');

    res.json({ logs, date });
  } catch (error) {
    next(error);
  }
};

// GET /api/logs/range?start=&end=
const getLogsInRange = async (req, res, next) => {
  try {
    const start = startOfDay(req.query.start || new Date());
    const end = startOfDay(req.query.end || new Date());

    const logs = await HabitLog.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    }).populate('habit', 'name category color icon').sort({ date: 1 });

    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/logs/:id
const deleteLog = async (req, res, next) => {
  try {
    const log = await HabitLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ error: 'Log not found.' });

    // Update habit stats
    await Habit.findByIdAndUpdate(log.habit, {
      $inc: { totalHoursLogged: -log.hoursSpent, totalDaysLogged: -1 }
    });

    await log.deleteOne();
    await recalculateStreak(log.habit, req.user._id);

    res.json({ message: 'Log deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrUpdateLog, getLogsByDate, getLogsInRange, deleteLog };
