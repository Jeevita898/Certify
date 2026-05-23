// ── routes/adminRoutes.js ───────────────────────────────────
const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/authMiddleware');
const { getAdminStats, getAllStudents, getAllActivitiesAdmin } = require('../controllers/userController');

router.use(protect, authorise('admin'));

router.get('/stats',      getAdminStats);
router.get('/students',   getAllStudents);
router.get('/activities', getAllActivitiesAdmin);

module.exports = router;
