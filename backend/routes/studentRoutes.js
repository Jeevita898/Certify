const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/authMiddleware');
const {
  getStudentProfile,
  updateStudentProfile,
  getStudentStats,
} = require('../controllers/userController');

// All routes require student role
router.use(protect, authorise('student'));

router.get('/profile',    getStudentProfile);
router.put('/profile',    updateStudentProfile);
router.get('/stats',      getStudentStats);

module.exports = router;
