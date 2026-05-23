// 

const Event = require('../models/Event');

// ── GET /api/events  (public) ────────────────────────────────
const getEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const filter   = {};
    if (type) filter.type = type;

    // Do NOT exclude participants — needed for seatsLeft virtual & isFull virtual
    const events = await Event.find(filter).sort({ date: 1 });
    res.json({ success: true, events });
  } catch (err) {
    console.error('getEvents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/events/:id  (public) ───────────────────────────
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, event });
  } catch (err) {
    console.error('getEventById error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/events  (admin only) ──────────────────────────
const createEvent = async (req, res) => {
  try {
    const { name, type, date, points, seats, description } = req.body;
    if (!name || !type || !date || !points || !seats || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const event = await Event.create({
      name, type, date, points: Number(points), seats: Number(seats),
      description, createdBy: req.user.id, participants: [],
    });

    if (req.app.locals.io) {
      req.app.locals.io.emit('notification', {
        type: 'info',
        title: '📢 New Event Available',
        message: `A new event "${event.name}" (${event.type}) is now open for registration!`
      });
    }

    res.status(201).json({ success: true, message: 'Event created.', event });
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/events/:id  (admin only) ───────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    const { name, type, date, points, seats, description } = req.body;
    if (name)        event.name        = name;
    if (type)        event.type        = type;
    if (date)        event.date        = date;
    if (points)      event.points      = Number(points);
    if (seats)       event.seats       = Number(seats);
    if (description) event.description = description;
    await event.save();
    res.json({ success: true, message: 'Event updated.', event });
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/events/:id  (admin only) ────────────────────
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/events/:id/register  (student) ────────────────
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (event.isFull) {
      return res.status(400).json({ success: false, message: 'No seats available.' });
    }
    if (event.participants.map(p => p.toString()).includes(req.user.id.toString())) {
      return res.status(400).json({ success: false, message: 'Already registered for this event.' });
    }
    event.participants.push(req.user.id);
    await event.save();
    res.json({ success: true, message: 'Successfully registered for event.' });
  } catch (err) {
    console.error('registerForEvent error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/events/my  (student's registered events) ───────
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ participants: req.user.id }).sort({ date: 1 });
    res.json({ success: true, events });
  } catch (err) {
    console.error('getMyEvents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent, getMyEvents };