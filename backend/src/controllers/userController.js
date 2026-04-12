const User = require('../models/User');

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, timezone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (timezone) user.timezone = timezone;

    await user.save();
    res.json({ message: 'Profile updated!', user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/preferences
const updatePreferences = async (req, res, next) => {
  try {
    const { darkMode, emailReminders, weeklyReport, reminderTime } = req.body;
    const user = await User.findById(req.user._id);

    if (darkMode !== undefined) user.preferences.darkMode = darkMode;
    if (emailReminders !== undefined) user.preferences.emailReminders = emailReminders;
    if (weeklyReport !== undefined) user.preferences.weeklyReport = weeklyReport;
    if (reminderTime !== undefined) user.preferences.reminderTime = reminderTime;

    await user.save();
    res.json({ message: 'Preferences saved!', preferences: user.preferences });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, updatePreferences, changePassword };
