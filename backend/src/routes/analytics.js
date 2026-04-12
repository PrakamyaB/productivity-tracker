const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getDashboard, exportCSV } = require('../controllers/analyticsController');

router.use(authenticate);
router.get('/dashboard', getDashboard);
router.get('/export', exportCSV);

module.exports = router;
