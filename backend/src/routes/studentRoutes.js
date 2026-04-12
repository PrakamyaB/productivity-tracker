// cgpa.js
const express = require('express');
const authenticate = require('../middleware/auth');

const cgpaRouter = express.Router();
cgpaRouter.use(authenticate);
const { getAll, createSemester, updateSemester, deleteSemester } = require('../controllers/cgpaController');
cgpaRouter.get('/', getAll);
cgpaRouter.post('/', createSemester);
cgpaRouter.put('/:id', updateSemester);
cgpaRouter.delete('/:id', deleteSemester);
module.exports.cgpaRouter = cgpaRouter;

// timetable.js
const ttRouter = express.Router();
ttRouter.use(authenticate);
const { get, addSlot, updateSlot, deleteSlot } = require('../controllers/timetableController');
ttRouter.get('/', get);
ttRouter.post('/slots', addSlot);
ttRouter.put('/slots/:slotId', updateSlot);
ttRouter.delete('/slots/:slotId', deleteSlot);
module.exports.ttRouter = ttRouter;

// notes.js
const notesRouter = express.Router();
notesRouter.use(authenticate);
const { getAll: getNotes, create: createNote, update: updateNote, remove: removeNote } = require('../controllers/noteController');
notesRouter.get('/', getNotes);
notesRouter.post('/', createNote);
notesRouter.put('/:id', updateNote);
notesRouter.delete('/:id', removeNote);
module.exports.notesRouter = notesRouter;

// gamification.js
const gamRouter = express.Router();
gamRouter.use(authenticate);
const { getProfile, addPomodoro, getLeaderboard, addXP } = require('../controllers/gamificationController');
gamRouter.get('/profile', getProfile);
gamRouter.get('/leaderboard', getLeaderboard);
gamRouter.post('/pomodoro', addPomodoro);
gamRouter.post('/xp', addXP);
module.exports.gamRouter = gamRouter;

// studyrooms.js
const roomRouter = express.Router();
roomRouter.use(authenticate);
const { getRooms, createRoom, joinRoom, leaveRoom, updateTopic } = require('../controllers/studyRoomController');
roomRouter.get('/', getRooms);
roomRouter.post('/', createRoom);
roomRouter.post('/join', joinRoom);
roomRouter.delete('/:id/leave', leaveRoom);
roomRouter.put('/:id/topic', updateTopic);
module.exports.roomRouter = roomRouter;
