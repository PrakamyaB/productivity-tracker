const cron = require('node-cron');

// Lazy load models inside function to avoid crash at import time
let User, Habit, HabitLog;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const startCronJobs = () => {
  try {
    // Import models safely
    User = require('../models/User');
    Habit = require('../models/Habit');
    HabitLog = require('../models/HabitLog');
  } catch (err) {
    console.error("❌ Model import failed in cron:", err.message);
    return; // stop cron if models missing
  }

  // 🟢 Daily reminder check (every hour)
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const currentHour = now.getUTCHours().toString().padStart(2, '0');
      const currentMinute = now.getUTCMinutes().toString().padStart(2, '0');
      const timeStr = `${currentHour}:${currentMinute}`;

      const users = await User.find({
        'preferences.emailReminders': true,
        'preferences.reminderTime': timeStr,
        isActive: true,
      });

      for (const user of users) {
        const today = startOfDay(new Date());

        const habits = await Habit.find({ user: user._id, isActive: true });
        const logs = await HabitLog.find({ user: user._id, date: today });

        const loggedHabitIds = new Set(logs.map(l => l.habit.toString()));
        const unlogged = habits.filter(h => !loggedHabitIds.has(h._id.toString()));

        if (unlogged.length > 0) {
          console.log(`📧 Reminder: ${user.email} has ${unlogged.length} pending habits`);
        }
      }

    } catch (err) {
      console.error("❌ Daily cron error:", err.message);
    }
  });

  // 🟡 Weekly streak reset (Sunday midnight UTC)
  cron.schedule('0 0 * * 0', async () => {
    try {
      console.log("🔄 Weekly streak job running...");

      const habits = await Habit.find({ isActive: true });
      const today = startOfDay(new Date());

      for (const habit of habits) {
        if (!habit.lastLoggedDate) continue;

        const daysSinceLast = Math.floor(
          (today - startOfDay(habit.lastLoggedDate)) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLast > 1 && habit.currentStreak > 0) {
          habit.currentStreak = 0;
          await habit.save();
        }
      }

      console.log("✅ Weekly streak job done");

    } catch (err) {
      console.error("❌ Weekly cron error:", err.message);
    }
  });

  console.log("⏰ Cron jobs started");
};

module.exports = { startCronJobs };