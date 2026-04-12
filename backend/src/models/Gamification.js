const mongoose = require('mongoose');

const BADGES = [
  { id: 'first_log', name: 'First Step', emoji: '👣', desc: 'Logged your first habit', xp: 10 },
  { id: 'week_streak', name: 'Week Warrior', emoji: '🔥', desc: '7-day streak achieved', xp: 100 },
  { id: 'month_streak', name: 'Iron Will', emoji: '💎', desc: '30-day streak achieved', xp: 500 },
  { id: 'early_bird', name: 'Early Bird', emoji: '🌅', desc: 'Logged before 8am', xp: 25 },
  { id: 'night_owl', name: 'Night Owl', emoji: '🦉', desc: 'Studied past midnight', xp: 25 },
  { id: 'assignment_done', name: 'On Time', emoji: '✅', desc: 'Completed first assignment', xp: 30 },
  { id: 'exam_ready', name: 'Exam Ready', emoji: '📚', desc: '100% prep on an exam', xp: 75 },
  { id: 'cgpa_hero', name: 'CGPA Hero', emoji: '🎓', desc: 'CGPA above 8.0', xp: 200 },
  { id: 'pomodoro_10', name: 'Focus Master', emoji: '🍅', desc: 'Completed 10 Pomodoros', xp: 50 },
  { id: 'pomodoro_50', name: 'Deep Worker', emoji: '🧠', desc: 'Completed 50 Pomodoros', xp: 200 },
  { id: 'note_taker', name: 'Note Taker', emoji: '📝', desc: 'Created 10 notes', xp: 40 },
  { id: 'study_100h', name: 'Century Club', emoji: '💯', desc: 'Logged 100 study hours', xp: 300 },
  { id: 'all_habits', name: 'Full House', emoji: '🏠', desc: 'Completed all habits in a day', xp: 60 },
  { id: 'social_study', name: 'Study Buddy', emoji: '👥', desc: 'Joined a study room', xp: 20 },
];

const LEVELS = [
  { level: 1, name: 'Freshman', minXP: 0, maxXP: 200 },
  { level: 2, name: 'Sophomore', minXP: 200, maxXP: 500 },
  { level: 3, name: 'Junior', minXP: 500, maxXP: 1000 },
  { level: 4, name: 'Senior', minXP: 1000, maxXP: 2000 },
  { level: 5, name: 'Graduate', minXP: 2000, maxXP: 3500 },
  { level: 6, name: 'Scholar', minXP: 3500, maxXP: 5500 },
  { level: 7, name: 'Researcher', minXP: 5500, maxXP: 8000 },
  { level: 8, name: 'Professor', minXP: 8000, maxXP: 12000 },
  { level: 9, name: 'Dean', minXP: 12000, maxXP: 18000 },
  { level: 10, name: 'Legend', minXP: 18000, maxXP: Infinity },
];

const gamificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  levelName: { type: String, default: 'Freshman' },
  badges: [{
    id: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  pomodorosCompleted: { type: Number, default: 0 },
  dailyXP: { type: Number, default: 0 },
  lastXPDate: { type: Date, default: null },
  weeklyXP: [{ date: String, xp: Number }], // last 7 days
}, { timestamps: true });

gamificationSchema.methods.addXP = function(amount, reason) {
  this.totalXP += amount;
  this.dailyXP += amount;
  // Recalculate level
  const lvl = LEVELS.findLast(l => this.totalXP >= l.minXP) || LEVELS[0];
  this.level = lvl.level;
  this.levelName = lvl.name;
  return this.save();
};

gamificationSchema.methods.awardBadge = function(badgeId) {
  if (!this.badges.find(b => b.id === badgeId)) {
    this.badges.push({ id: badgeId });
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) this.totalXP += badge.xp;
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Gamification', gamificationSchema);
module.exports.BADGES = BADGES;
module.exports.LEVELS = LEVELS;
