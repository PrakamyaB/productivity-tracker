const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const Goal = require('../models/Goal');

const startOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// GET /api/analytics/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = startOfDay(new Date());

    // Date ranges
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 89);

    // Fetch all active habits
    const habits = await Habit.find({ user: userId, isActive: true });

    // Fetch logs for past 90 days
    const allLogs = await HabitLog.find({
      user: userId,
      date: { $gte: ninetyDaysAgo },
    }).populate('habit', 'name category color');

    // Today's logs
    const todayLogs = allLogs.filter(l => startOfDay(l.date).getTime() === today.getTime());
    const todayHours = todayLogs.reduce((s, l) => s + l.hoursSpent, 0);
    const todayCompleted = todayLogs.filter(l => l.completed).length;

    // This week
    const weekLogs = allLogs.filter(l => new Date(l.date) >= weekStart);
    const weekHours = weekLogs.reduce((s, l) => s + l.hoursSpent, 0);

    // This month
    const monthLogs = allLogs.filter(l => new Date(l.date) >= monthStart);
    const monthHours = monthLogs.reduce((s, l) => s + l.hoursSpent, 0);

    // Daily chart data (last 30 days)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayLogs = allLogs.filter(l => startOfDay(l.date).getTime() === d.getTime());
      dailyData.push({
        date: d.toISOString().split('T')[0],
        hours: Math.round(dayLogs.reduce((s, l) => s + l.hoursSpent, 0) * 10) / 10,
        completed: dayLogs.filter(l => l.completed).length,
      });
    }

    // Weekly chart data (last 12 weeks)
    const weeklyData = [];
    for (let i = 11; i >= 0; i--) {
      const wStart = new Date(today);
      wStart.setDate(today.getDate() - today.getDay() - i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);
      const wLogs = allLogs.filter(l => {
        const ld = new Date(l.date);
        return ld >= wStart && ld <= wEnd;
      });
      weeklyData.push({
        week: `W${12 - i}`,
        startDate: wStart.toISOString().split('T')[0],
        hours: Math.round(wLogs.reduce((s, l) => s + l.hoursSpent, 0) * 10) / 10,
        completed: wLogs.filter(l => l.completed).length,
      });
    }

    // Category breakdown
    const categoryMap = {};
    allLogs.filter(l => new Date(l.date) >= thirtyDaysAgo).forEach(log => {
      const cat = log.habit?.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + log.hoursSpent;
    });
    const categoryData = Object.entries(categoryMap).map(([name, hours]) => ({
      name,
      hours: Math.round(hours * 10) / 10,
    })).sort((a, b) => b.hours - a.hours);

    // Streaks
    const longestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
    const currentBestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
    const mostConsistentHabit = habits.sort((a, b) => b.totalDaysLogged - a.totalDaysLogged)[0];

    // Weekday vs weekend analysis
    const weekdayHours = allLogs
      .filter(l => { const d = new Date(l.date).getDay(); return d > 0 && d < 6; })
      .reduce((s, l) => s + l.hoursSpent, 0);
    const weekendHours = allLogs
      .filter(l => { const d = new Date(l.date).getDay(); return d === 0 || d === 6; })
      .reduce((s, l) => s + l.hoursSpent, 0);
    const weekdayCount = Math.max(1, allLogs.filter(l => { const d = new Date(l.date).getDay(); return d > 0 && d < 6; }).length);
    const weekendCount = Math.max(1, allLogs.filter(l => { const d = new Date(l.date).getDay(); return d === 0 || d === 6; }).length);
    const avgWeekday = weekdayHours / weekdayCount;
    const avgWeekend = weekendHours / weekendCount;

    // Hour of day productivity (from mood/hours data)
    const dayOfWeekData = Array(7).fill(0).map((_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      hours: 0,
      count: 0,
    }));
    allLogs.filter(l => new Date(l.date) >= thirtyDaysAgo).forEach(log => {
      const d = new Date(log.date).getDay();
      dayOfWeekData[d].hours += log.hoursSpent;
      dayOfWeekData[d].count += 1;
    });
    const dayOfWeekChart = dayOfWeekData.map(d => ({
      day: d.day,
      avgHours: d.count > 0 ? Math.round((d.hours / d.count) * 10) / 10 : 0,
    }));

    // Goals progress
    const activeGoals = await Goal.find({ user: userId, isActive: true })
      .populate('habit', 'name color category');
    const goalsProgress = await Promise.all(activeGoals.map(async (goal) => {
      const goalLogs = await HabitLog.find({
        habit: goal.habit._id,
        user: userId,
        date: { $gte: goal.startDate, $lte: goal.endDate },
      });
      const achieved = goalLogs.reduce((s, l) => s + l.hoursSpent, 0);
      const progress = Math.min(100, Math.round((achieved / goal.targetHours) * 100));
      const daysLeft = Math.ceil((new Date(goal.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      const atRisk = daysLeft > 0 && progress < (((goal.targetHours - daysLeft) / goal.targetHours) * 100);
      return { ...goal.toObject(), achieved: Math.round(achieved * 10) / 10, progress, daysLeft, atRisk };
    }));

    // Smart insights
    const insights = generateInsights({
      avgWeekday, avgWeekend, longestStreak, currentBestStreak,
      mostConsistentHabit, habits, weekHours, monthHours, goalsProgress
    });

    res.json({
      overview: {
        today: { hours: Math.round(todayHours * 10) / 10, completed: todayCompleted, total: habits.length },
        week: { hours: Math.round(weekHours * 10) / 10 },
        month: { hours: Math.round(monthHours * 10) / 10 },
        longestStreak,
        currentBestStreak,
        mostConsistentHabit: mostConsistentHabit ? { name: mostConsistentHabit.name, days: mostConsistentHabit.totalDaysLogged } : null,
      },
      charts: { daily: dailyData, weekly: weeklyData, category: categoryData, dayOfWeek: dayOfWeekChart },
      goals: goalsProgress,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

const generateInsights = ({ avgWeekday, avgWeekend, longestStreak, currentBestStreak, mostConsistentHabit, habits, weekHours, monthHours, goalsProgress }) => {
  const insights = [];

  if (avgWeekday > avgWeekend * 1.2) {
    insights.push({ type: 'pattern', icon: '📈', text: `You're ${Math.round(((avgWeekday / Math.max(avgWeekend, 0.1)) - 1) * 100)}% more productive on weekdays than weekends.` });
  } else if (avgWeekend > avgWeekday * 1.2) {
    insights.push({ type: 'pattern', icon: '🏖️', text: `You tend to be more productive on weekends — you log ${Math.round(((avgWeekend / Math.max(avgWeekday, 0.1)) - 1) * 100)}% more hours.` });
  }

  if (longestStreak >= 7) {
    insights.push({ type: 'achievement', icon: '🔥', text: `Your longest streak is ${longestStreak} days — impressive consistency!` });
  }

  if (currentBestStreak >= 3) {
    insights.push({ type: 'streak', icon: '⚡', text: `You're on a ${currentBestStreak}-day streak. Keep going!` });
  }

  if (mostConsistentHabit) {
    insights.push({ type: 'habit', icon: '🏆', text: `"${mostConsistentHabit.name}" is your most consistent habit with ${mostConsistentHabit.totalDaysLogged} total days logged.` });
  }

  const atRiskGoals = goalsProgress.filter(g => g.atRisk && !g.achieved);
  if (atRiskGoals.length > 0) {
    insights.push({ type: 'warning', icon: '⚠️', text: `You may miss ${atRiskGoals.length} goal${atRiskGoals.length > 1 ? 's' : ''} this period. Focus on: ${atRiskGoals[0].habit.name}.` });
  }

  if (weekHours < 5 && habits.length > 0) {
    insights.push({ type: 'motivate', icon: '💪', text: `Only ${Math.round(weekHours * 10) / 10} hours logged this week. A little consistency goes a long way!` });
  }

  if (insights.length === 0) {
    insights.push({ type: 'info', icon: '📊', text: `Keep logging daily to unlock personalized productivity insights!` });
  }

  return insights;
};

// GET /api/analytics/export
const exportCSV = async (req, res, next) => {
  try {
    const logs = await HabitLog.find({ user: req.user._id })
      .populate('habit', 'name category')
      .sort({ date: -1 });

    const headers = ['Date', 'Habit', 'Category', 'Hours Spent', 'Completed', 'Notes', 'Mood'];
    const rows = logs.map(l => [
      new Date(l.date).toISOString().split('T')[0],
      l.habit?.name || 'Unknown',
      l.habit?.category || 'Unknown',
      l.hoursSpent,
      l.completed ? 'Yes' : 'No',
      (l.notes || '').replace(/,/g, ';'),
      l.mood || '',
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="productivity-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, exportCSV };
