const Activity = require('../models/Activity');
const ActivityAudit = require('../models/ActivityAudit');
const Notification = require('../models/Notification');
const User = require('../models/User');

const { parseCertificate } = require('../ai/certificateParser.js');
const { checkDuplicate } = require('../ai/duplicateDetector.js');

const MAX_POINTS = {
  'Helping Local School Students': 20,
  'Rural Development / Village Outreach': 20,
  'Environmental Activities': 15,
  'Blood Donation / Health Camps': 15,
  'NSS / NCC / Social Service': 20,
  'Sports / Yoga / Fitness': 15,
  'Cultural Activities': 15,
  'Technical Events / Hackathon / Workshop': 20,
  'Internship / Skill Development': 25,
  'Research Paper / Innovation / Patent': 25,
  'Entrepreneurship / Startup Work': 20,
  'Tourism Promotion / Heritage': 15,
  'Online Certification Courses': 15,
  'Leadership / Student Clubs': 20,
  'Other Approved Activity': 10
};

// ── POST /api/activities  (student uploads certificate) ─────
const uploadActivity = async (req, res) => {
  try {
    // ── File validation ─────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Certificate file is required.'
      });
    }

    // ── Student validation ─────────────────────────────────
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    if (!student.facultyId) {
      return res.status(400).json({
        success: false,
        message: 'No faculty assigned to this student.'
      });
    }

    // ── Cloudinary file URL ────────────────────────────────
    const fileUrl = req.file.path;

    // ── AI Certificate Parsing (Now Rule-based Trust Score) ────
    let aiResult;

    try {
      aiResult = await parseCertificate(fileUrl, {
        name: req.body.name,
        type: req.body.type,
        date: req.body.date,
        brief: req.body.brief,
        organizingBody: req.body.organizingBody,
        ocrText: req.body.ocrText // Text extracted by Tesseract on frontend
      });
    } catch (aiError) {
      console.error('AI Parsing Error:', aiError);

      return res.status(500).json({
        success: false,
        message: 'Could not process this certificate.'
      });
    }

    const extracted = aiResult.extracted || {};
    
    // We update the frontend extracted trust score to the database model
    // ── Validate category ──────────────────────────────────
    if (!MAX_POINTS[extracted.suggestedCategory]) {
      extracted.suggestedCategory = 'Other Approved Activity';
    }

    // ── Duplicate Detection ────────────────────────────────
    let duplicateResult;

    try {
      duplicateResult = await checkDuplicate(req.user.id, {
        name: extracted.activityName,
        type: extracted.suggestedCategory,
        date: extracted.eventDate,
        brief: extracted.briefDescription,
        organizingBody: extracted.organizingBody
      });
    } catch (duplicateError) {
      console.error(
        'Duplicate Detection Error:',
        duplicateError
      );

      duplicateResult = {
        checked: false,
        isDuplicate: false,
        isPossibleDuplicate: false,
        confidence: 0,
        matchedActivityId: null,
        reason: '',
        semanticKeywords: []
      };
    }

    // ── Create Activity ────────────────────────────────────
    const activity = await Activity.create({
      studentId: req.user.id,

      facultyId: student.facultyId,

      // ── AI Auto-filled Fields ────────────────────────────
      name:
        extracted.activityName ||
        'Untitled Activity',

      type:
        extracted.suggestedCategory ||
        'Other Approved Activity',

      date:
        extracted.eventDate
          ? new Date(extracted.eventDate)
          : new Date(),

      brief:
        extracted.briefDescription ||
        'Activity uploaded using AI parsing.',

      // ── File Info ────────────────────────────────────────
      fileUrl: req.file.path,
      filePublicId: req.file.filename,
      fileName: req.file.originalname,

      // ── Default Review State ─────────────────────────────
      points: 0,
      status: 'pending',

      // ── AI Extracted Data ────────────────────────────────
      aiExtracted: {
        organizingBody:
          extracted.organizingBody || '',

        participantName:
          extracted.participantName || '',

        confidenceScore:
          extracted.confidenceScore || 0,
          
        trustScore:
          extracted.confidenceScore || 0,
          
        ocrText:
          req.body.ocrText || '',

        fraudFlags:
          extracted.fraudFlags || [],

        isLikelyFraudulent:
          extracted.isLikelyFraudulent || false,

        parsedAt: new Date()
      },

      // ── Semantic Duplicate Detection ─────────────────────
      semanticKeywords:
        duplicateResult.semanticKeywords || [],

      // ── Duplicate Check ──────────────────────────────────
      duplicateCheck: {
        checked: true,

        isDuplicate:
          duplicateResult.isDuplicate || false,

        isPossibleDuplicate:
          duplicateResult.isPossibleDuplicate || false,

        confidence:
          duplicateResult.confidence || 0,

        matchedActivityId:
          duplicateResult.matchedActivityId || null,

        reason:
          duplicateResult.reason || ''
      }
    });

    // ── Success Response ───────────────────────────────────
    res.status(201).json({
      success: true,

      message:
        duplicateResult.isDuplicate
          ? 'Possible duplicate certificate detected.'
          : 'Activity submitted successfully.',

      activity,

      aiSummary: {
        extractedActivityName:
          extracted.activityName,

        extractedCategory:
          extracted.suggestedCategory,

        organizingBody:
          extracted.organizingBody,

        confidence:
          extracted.confidenceScore,

        fraudDetected:
          extracted.isLikelyFraudulent,

        fraudFlags:
          extracted.fraudFlags,

        duplicateDetected:
          duplicateResult.isDuplicate,

        duplicateConfidence:
          duplicateResult.confidence
      }
    });

    if (duplicateResult.globalDuplicate && req.app.locals.io) {
      req.app.locals.io.to(student.facultyId.toString()).emit('notification', {
        type: 'warning',
        title: 'Duplicate Detected',
        message: `Student ${student.firstName} just uploaded a certificate that matches an existing upload from another student.`
      });
    }

  } catch (err) {
    console.error('Upload activity error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ── GET /api/activities/my  (student activities) ─────
const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      studentId: req.user.id
    })
      .sort({ createdAt: -1 })
      .populate('facultyId', 'name email');

    res.json({
      success: true,
      activities
    });

  } catch (err) {
    console.error('Get my activities error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ── GET /api/activities/faculty  (faculty sees own students) ─────
const getFacultyActivities = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      facultyId: req.user.id
    };

    if (status) {
      filter.status = status;
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .populate(
        'studentId',
        'firstName lastName usn department email totalPoints'
      );

    res.json({
      success: true,
      activities
    });

  } catch (err) {
    console.error('Get faculty activities error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ── PATCH /api/activities/:id/validate  (faculty approve/reject) ─────
const validateActivity = async (req, res) => {
  try {
    const { status, remark, points } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected.'
      });
    }

    if (status === 'rejected' && !remark?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Remark required when rejecting.'
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    if (activity.facultyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorised.'
      });
    }

    if (activity.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This activity is already approved.'
      });
    }

    const oldStatus = activity.status;
    const oldPoints = activity.points || 0;

    const parsedPoints = parseInt(points);

    const maxAllowed = MAX_POINTS[activity.type];

    const previousApprovedActivities = await Activity.find({
      studentId: activity.studentId,
      type: activity.type,
      status: 'approved',
      _id: { $ne: activity._id }
    });

    const existingCategoryPoints =
      previousApprovedActivities.reduce(
        (sum, act) => sum + (act.points || 0),
        0
      );

    if (
      existingCategoryPoints + parsedPoints >
      maxAllowed
    ) {
      return res.status(400).json({
        success: false,
        message:
          `This student already has ${existingCategoryPoints} points in "${activity.type}". ` +
          `Adding ${parsedPoints} exceeds maximum allowed ${maxAllowed}.`
      });
    }

    if (status === 'approved') {
      if (!parsedPoints || parsedPoints < 1) {
        return res.status(400).json({
          success: false,
          message: 'Points must be at least 1.'
        });
      }

      if (!maxAllowed) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity category.'
        });
      }

      if (parsedPoints > maxAllowed) {
        return res.status(400).json({
          success: false,
          message:
            `Maximum points for "${activity.type}" is ${maxAllowed}.`
        });
      }
    }

    const faculty = await User.findById(req.user.id)
      .select('name');

    activity.status = status;
    activity.remark = remark || '';
    activity.reviewedAt = new Date();
    activity.approvedBy = faculty.name;

    if (status === 'approved') {
      activity.points = parsedPoints;

      const student = await User.findById(
        activity.studentId
      );

      student.totalPoints += parsedPoints;

      await student.save();
    }

    if (status === 'rejected') {
      activity.points = 0;
    }

    await activity.save();

    // ── Audit History ──────────────────────────────────────
    await ActivityAudit.create({
      activityId: activity._id,
      actionBy: req.user.id,
      actionByName: faculty.name,
      actionType: status,
      oldStatus,
      newStatus: status,
      oldPoints,
      newPoints:
        status === 'approved'
          ? parsedPoints
          : 0,
      remark: remark || ''
    });

    // ── Notification ───────────────────────────────────────
    const notifMsg = status === 'approved'
          ? `Your activity "${activity.name}" has been approved by ${faculty.name} for ${parsedPoints} points.`
          : `Your activity "${activity.name}" was rejected by ${faculty.name}. Reason: ${remark}`;
          
    await Notification.create({
      userId: activity.studentId,
      activityId: activity._id,
      type: status,
      message: notifMsg
    });

    if (req.app.locals.io) {
      req.app.locals.io.to(activity.studentId.toString()).emit('notification', {
        type: status,
        message: notifMsg,
        title: status === 'approved' ? 'Certificate Approved' : 'Certificate Rejected'
      });
    }

    res.json({
      success: true,
      message: `Activity ${status}.`,
      activity
    });

  } catch (err) {
    console.error('Validate activity error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ── GET /api/activities/admin  (admin sees all) ─────
const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .populate(
        'studentId',
        'firstName lastName usn'
      )
      .populate('facultyId', 'name');

    res.json({
      success: true,
      activities
    });

  } catch (err) {
    console.error('Get all activities error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ── GET /api/activities/:id/audit  (audit history) ─────
const getActivityAuditHistory = async (req, res) => {
  try {
    const audits = await ActivityAudit.find({
      activityId: req.params.id
    })
      .sort({ createdAt: -1 })
      .populate(
        'actionBy',
        'name email role'
      );

    res.json({
      success: true,
      audits
    });

  } catch (err) {
    console.error(
      'Get audit history error:',
      err
    );

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

module.exports = {
  uploadActivity,
  getMyActivities,
  getFacultyActivities,
  validateActivity,
  getAllActivities,
  getActivityAuditHistory
};