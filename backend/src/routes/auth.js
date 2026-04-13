const express = require('express');
const router = express.Router();

// Dummy controller functions (replace with your actual logic if needed)
const signupController = async (req, res) => {
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

const loginController = async (req, res) => {
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
router.post('/signup', signupController);

router.post('/signup', (req, res) => {
  res.status(200).json({ message: "NEW SIGNUP ROUTE WORKING" });
});

// Login route
router.post('/login', loginController);

module.exports = router;