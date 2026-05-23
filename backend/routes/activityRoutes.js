// ===========================================
// routes/activityRoutes.js
// ===========================================

const express = require('express');

const router = express.Router();

const {
  protect,
  authorise
} = require('../middleware/authMiddleware');

const {
  upload
} = require('../config/cloudinary');

const {
  uploadActivity,
  getMyActivities,
  getFacultyActivities,
  validateActivity,
  getAllActivities,
  getActivityAuditHistory
} = require('../controllers/activityController');

// ── AI ROUTES ─────────────────────────────
const {
  parseCertificateRoute
} = require('../ai/certificateParser.js');

const {
  checkDuplicateRoute
} = require('../ai/duplicateDetector.js');

const {
  getActivityBriefingRoute
} = require('../ai/facultyAssistant.js');

// ─────────────────────────────────────────────
// STUDENT ROUTES
// ─────────────────────────────────────────────

// AI Parse ONLY
router.post(
  '/parse',
  protect,
  authorise('student'),

  upload.single('certificate'),

  async (req, res, next) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: 'Certificate file required'
        });

      }

      // inject uploaded cloudinary url
      req.body.fileUrl = req.file.path;

      next();

    } catch (err) {

      return res.status(500).json({
        success: false,
        message: 'File upload failed'
      });

    }

  },

  parseCertificateRoute
);

// Duplicate Check
router.post(
  '/check-duplicate',
  protect,
  authorise('student'),
  checkDuplicateRoute
);

// FINAL Submit
router.post(
  '/',
  protect,
  authorise('student'),
  upload.single('certificate'),
  uploadActivity
);

// Student own activities
router.get(
  '/my',
  protect,
  authorise('student'),
  getMyActivities
);

// ─────────────────────────────────────────────
// FACULTY ROUTES
// ─────────────────────────────────────────────

// Faculty activity list
router.get(
  '/faculty',
  protect,
  authorise('faculty'),
  getFacultyActivities
);

// Faculty AI briefing
router.get(
  '/:id/ai-briefing',
  protect,
  authorise('faculty'),
  getActivityBriefingRoute
);

// Approve / Reject
router.patch(
  '/:id/validate',
  protect,
  authorise('faculty'),
  validateActivity
);

// Audit History
router.get(
  '/:id/audit',
  protect,
  getActivityAuditHistory
);

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────

// View all activities
router.get(
  '/all',
  protect,
  authorise('admin'),
  getAllActivities
);

module.exports = router;