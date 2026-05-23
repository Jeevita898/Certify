const express = require('express');

const router = express.Router();

const { protect, authorise } =
require('../middleware/authMiddleware');

const {
  generateFacultyReport
} = require('../controllers/reportController');

// Faculty PDF report
router.get(
  '/faculty-report',
  protect,
  authorise('faculty'),
  generateFacultyReport
);

module.exports = router;