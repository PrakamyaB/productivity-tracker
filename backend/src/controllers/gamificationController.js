const Gamification = require('../models/Gamification');
const { BADGES, LEVELS } = require('../models/Gamification');
const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    let gam = await Gamification.findOne({ user: req.user._id });
    if (!gam) gam = await Gamification.create({ user: req.user._id });

    const currentLevel = LEVELS.find(l => l.level === gam.level) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.level === gam.level + 1);
    const progressToNext = nextLevel
      ? Math.round(((gam.totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100)
      : 100;

    const earnedBadges = gam.badges.map(b => {
      const info = BADGES.find(badge => badge.id === b.id);
      return { ...info, earnedAt: b.earnedAt };
    });
    const unearnedBadges = BADGES.filter(b => !gam.badges.find(eb => eb.id === b.id));

    res.json({
      xp: gam.totalXP,
      level: gam.level,
      levelName: gam.levelName,
      pomodorosCompleted: gam.pomodorosCompleted,
      progressToNext,
      nextLevelXP: nextLevel?.minXP || null,
      currentLevelXP: currentLevel.minXP,
      earnedBadges,
      unearnedBadges,
      dailyXP: gam.dailyXP,
    });
  } catch (e) { next(e); }
};

const addPomodoro = async (req, res, next) => {
  try {
    let gam = await Gamification.findOne({ user: req.user._id });
    if (!gam) gam = await Gamification.create({ user: req.user._id });

    gam.pomodorosCompleted += 1;
    await gam.addXP(25, 'pomodoro');

    if (gam.pomodorosCompleted >= 10) await gam.awardBadge('pomodoro_10');
    if (gam.pomodorosCompleted >= 50) await gam.awardBadge('pomodoro_50');

    res.json({ message: '+25 XP! 🍅', xp: gam.totalXP, pomodorosCompleted: gam.pomodorosCompleted });
  } catch (e) { next(e); }
};

// GET /api/gamification/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const topGam = await Gamification.find()
      .sort({ totalXP: -1 })
      .limit(20)
      .populate('user', 'name email');

    const leaderboard = topGam.map((g, i) => ({
      rank: i + 1,
      name: g.user?.name || 'Unknown',
      xp: g.totalXP,
      level: g.level,
      levelName: g.levelName,
      badges: g.badges.length,
      isMe: g.user?._id?.toString() === req.user._id.toString(),
    }));

    res.json({ leaderboard });
  } catch (e) { next(e); }
};

const addXP = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    let gam = await Gamification.findOne({ user: req.user._id });
    if (!gam) gam = await Gamification.create({ user: req.user._id });
    await gam.addXP(amount || 10, reason || 'action');
    res.json({ message: `+${amount} XP!`, xp: gam.totalXP });
  } catch (e) { next(e); }
};

module.exports = { getProfile, addPomodoro, getLeaderboard, addXP };
