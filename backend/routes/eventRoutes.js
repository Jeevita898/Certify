// ── routes/eventRoutes.js ───────────────────────────────────
const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/authMiddleware');
const {
  getEvents, getEventById, createEvent,
  updateEvent, deleteEvent, registerForEvent, getMyEvents,
} = require('../controllers/eventController');

router.get('/',              getEvents);             // public
router.get('/my',            protect, authorise('student'), getMyEvents);
router.get('/:id',           getEventById);          // public
router.post('/',             protect, authorise('admin'), createEvent);
router.put('/:id',           protect, authorise('admin'), updateEvent);
router.delete('/:id',        protect, authorise('admin'), deleteEvent);
router.post('/:id/register', protect, authorise('student'), registerForEvent);

module.exports = router;
