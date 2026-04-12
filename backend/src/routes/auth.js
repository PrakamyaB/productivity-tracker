const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { signup, login, getMe, logout } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

router.post('/signup', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], signup);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required'),
], login);

router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
