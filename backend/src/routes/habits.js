const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getHabits, createHabit, updateHabit, deleteHabit, getHabitStats } = require('../controllers/habitController');

router.use(authenticate);

router.get('/', getHabits);
router.post('/', [
  body('name').trim().notEmpty().isLength({ max: 100 }).withMessage('Habit name required (max 100 chars)'),
  body('category').optional().isIn(['Study', 'Health', 'Personal', 'Work', 'Fitness', 'Mindfulness', 'Creative', 'Social', 'Other']),
  body('targetHoursPerDay').optional().isFloat({ min: 0, max: 24 }),
  body('targetDaysPerWeek').optional().isInt({ min: 1, max: 7 }),
], createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.get('/:id/stats', getHabitStats);

module.exports = router;
