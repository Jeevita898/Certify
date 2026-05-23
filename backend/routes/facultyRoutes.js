const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/authMiddleware');
const { getFacultyList, getFacultyProfile, getAssignedStudents } = require('../controllers/userController');

// Public — students need this on signup page
router.get('/list', getFacultyList);

// Protected faculty routes
router.get('/profile',  protect, authorise('faculty'), getFacultyProfile);
router.get('/students', protect, authorise('faculty'), getAssignedStudents);

module.exports = router;
