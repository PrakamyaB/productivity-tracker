// ── routes/assignments.js ──────────────────────────────
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getAll, create, update, remove } = require('../controllers/assignmentController');
router.use(authenticate);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
module.exports = router;

// ── Save as: backend/src/routes/assignments.js ──────────
