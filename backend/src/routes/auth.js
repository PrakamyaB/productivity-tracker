const express = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth');
const { signup, login, getMe, logout } = require('../controllers/authController');

const router = express.Router();

const unusedSignupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // TODO: Replace with DB logic
    res.status(201).json({
      message: 'User registered successfully',
      user: { name, email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
};

const unusedLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // TODO: Replace with DB validation
    res.status(200).json({
      message: 'Login successful',
      user: { email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};


// 🔥 IMPORTANT PART (YOUR BUG WAS HERE)

// Signup route
const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

router.post('/signup', signupValidation, signup);

router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

module.exports = router;
