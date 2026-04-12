const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createOrUpdateLog, getLogsByDate, getLogsInRange, deleteLog } = require('../controllers/logController');

router.use(authenticate);

router.post('/', [
  body('habitId').notEmpty().withMessage('habitId required'),
  body('hoursSpent').isFloat({ min: 0, max: 24 }).withMessage('hoursSpent must be 0-24'),
  body('completed').isBoolean().withMessage('completed must be boolean'),
], createOrUpdateLog);

router.get('/', getLogsByDate);
router.get('/range', getLogsInRange);
router.delete('/:id', deleteLog);

module.exports = router;
