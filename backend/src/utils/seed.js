require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clean up
  await User.deleteMany({ email: 'demo@example.com' });

  // Create demo user
  const user = await User.create({
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123456',
  });
  console.log('Created demo user: demo@example.com / demo123456');

  // Create habits
  const habitsData = [
    { name: 'Study DSA', category: 'Study', color: '#6366f1', icon: '📚', targetHoursPerDay: 3, targetDaysPerWeek: 6 },
    { name: 'Gym Workout', category: 'Fitness', color: '#10b981', icon: '💪', targetHoursPerDay: 1, targetDaysPerWeek: 5 },
    { name: 'Reading', category: 'Personal', color: '#f59e0b', icon: '📖', targetHoursPerDay: 1, targetDaysPerWeek: 7 },
    { name: 'LeetCode', category: 'Study', color: '#8b5cf6', icon: '💻', targetHoursPerDay: 2, targetDaysPerWeek: 6 },
    { name: 'Meditation', category: 'Mindfulness', color: '#14b8a6', icon: '🧘', targetHoursPerDay: 0.5, targetDaysPerWeek: 7 },
  ];

  const habits = await Habit.insertMany(habitsData.map((h, i) => ({ ...h, user: user._id, order: i })));
  console.log(`Created ${habits.length} habits`);

  // Create 60 days of logs
  const logs = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let d = 59; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);

    for (const habit of habits) {
      // Skip some days randomly for realism
      if (Math.random() < 0.25) continue;

      const hoursSpent = Math.round((habit.targetHoursPerDay * (0.5 + Math.random())) * 10) / 10;
      const completed = hoursSpent >= habit.targetHoursPerDay * 0.8;

      logs.push({
        user: user._id,
        habit: habit._id,
        date,
        hoursSpent: Math.min(hoursSpent, 12),
        completed,
        mood: Math.floor(Math.random() * 3) + 3, // 3-5 mood
      });
    }
  }

  await HabitLog.insertMany(logs);
  console.log(`Created ${logs.length} log entries`);

  // Update habit stats from logs
  for (const habit of habits) {
    const habitLogs = logs.filter(l => l.habit.toString() === habit._id.toString());
    habit.totalHoursLogged = habitLogs.reduce((s, l) => s + l.hoursSpent, 0);
    habit.totalDaysLogged = habitLogs.length;
    habit.currentStreak = Math.floor(Math.random() * 15) + 1;
    habit.longestStreak = habit.currentStreak + Math.floor(Math.random() * 10);
    await habit.save();
  }

  console.log('✅ Seed complete!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
