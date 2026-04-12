const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { updateProfile, updatePreferences, changePassword } = require('../controllers/userController');

router.use(authenticate);
router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);
router.put('/password', changePassword);

module.exports = router;
