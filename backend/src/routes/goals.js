const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getGoals, createGoal, deleteGoal } = require('../controllers/goalController');

router.use(authenticate);
router.get('/', getGoals);
router.post('/', createGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
