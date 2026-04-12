const StudyRoom = require('../models/StudyRoom');
const Gamification = require('../models/Gamification');

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const getRooms = async (req, res, next) => {
  try {
    const rooms = await StudyRoom.find({ isPublic: true, isActive: true })
      .populate('host', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ rooms });
  } catch (e) { next(e); }
};

const createRoom = async (req, res, next) => {
  try {
    const { name, subject, description, isPublic, maxMembers } = req.body;
    let code = generateCode();
    while (await StudyRoom.findOne({ code })) code = generateCode();

    const room = await StudyRoom.create({
      name, subject, description, isPublic, maxMembers,
      host: req.user._id,
      code,
      members: [{
        user: req.user._id,
        name: req.user.name,
        joinedAt: new Date(),
        isActive: true,
      }],
    });

    // Badge
    let gam = await Gamification.findOne({ user: req.user._id });
    if (!gam) gam = await Gamification.create({ user: req.user._id });
    await gam.awardBadge('social_study');
    await gam.addXP(20, 'created_room');

    res.status(201).json({ message: 'Study room created!', room });
  } catch (e) { next(e); }
};

const joinRoom = async (req, res, next) => {
  try {
    const { code } = req.body;
    const room = await StudyRoom.findOne({ code: code.toUpperCase(), isActive: true });
    if (!room) return res.status(404).json({ error: 'Room not found. Check the code.' });
    if (room.members.length >= room.maxMembers) return res.status(400).json({ error: 'Room is full.' });

    const alreadyIn = room.members.find(m => m.user?.toString() === req.user._id.toString());
    if (!alreadyIn) {
      room.members.push({ user: req.user._id, name: req.user.name, joinedAt: new Date(), isActive: true });
      await room.save();
      let gam = await Gamification.findOne({ user: req.user._id });
      if (!gam) gam = await Gamification.create({ user: req.user._id });
      await gam.awardBadge('social_study');
      await gam.addXP(20, 'joined_room');
    }

    res.json({ message: 'Joined room!', room });
  } catch (e) { next(e); }
};

const leaveRoom = async (req, res, next) => {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Not found' });
    room.members = room.members.filter(m => m.user?.toString() !== req.user._id.toString());
    if (room.members.length === 0) room.isActive = false;
    await room.save();
    res.json({ message: 'Left room.' });
  } catch (e) { next(e); }
};

const updateTopic = async (req, res, next) => {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Not found' });
    const member = room.members.find(m => m.user?.toString() === req.user._id.toString());
    if (member) { member.studyingTopic = req.body.topic || ''; await room.save(); }
    res.json({ message: 'Topic updated!', room });
  } catch (e) { next(e); }
};

module.exports = { getRooms, createRoom, joinRoom, leaveRoom, updateTopic };
