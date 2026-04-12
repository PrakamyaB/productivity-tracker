const Timetable = require('../models/Timetable');

const get = async (req, res, next) => {
  try {
    let tt = await Timetable.findOne({ user: req.user._id });
    if (!tt) tt = await Timetable.create({ user: req.user._id, slots: [] });
    res.json({ timetable: tt });
  } catch (e) { next(e); }
};

const addSlot = async (req, res, next) => {
  try {
    let tt = await Timetable.findOne({ user: req.user._id });
    if (!tt) tt = await Timetable.create({ user: req.user._id, slots: [] });
    tt.slots.push(req.body);
    await tt.save();
    res.status(201).json({ message: 'Class added!', timetable: tt });
  } catch (e) { next(e); }
};

const updateSlot = async (req, res, next) => {
  try {
    const tt = await Timetable.findOne({ user: req.user._id });
    if (!tt) return res.status(404).json({ error: 'Timetable not found' });
    const slot = tt.slots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    Object.assign(slot, req.body);
    await tt.save();
    res.json({ message: 'Updated!', timetable: tt });
  } catch (e) { next(e); }
};

const deleteSlot = async (req, res, next) => {
  try {
    const tt = await Timetable.findOne({ user: req.user._id });
    if (!tt) return res.status(404).json({ error: 'Not found' });
    tt.slots = tt.slots.filter(s => s._id.toString() !== req.params.slotId);
    await tt.save();
    res.json({ message: 'Deleted.', timetable: tt });
  } catch (e) { next(e); }
};

module.exports = { get, addSlot, updateSlot, deleteSlot };
