/**
 * Activity.js — UPGRADED MODEL
 * ─────────────────────────────────────────────────────────────
 * Original model with AI feature fields added.
 * New fields are marked with: // [AI FEATURE]
 *
 * Changes from original:
 *  - Added semanticKeywords (for duplicate detection)
 *  - Added aiExtracted (for certificate parser results)
 *  - Added duplicateCheckResult (for storing duplicate warnings)
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    name: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: [
        'Helping Local School Students',
        'Rural Development / Village Outreach',
        'Environmental Activities',
        'Blood Donation / Health Camps',
        'NSS / NCC / Social Service',
        'Sports / Yoga / Fitness',
        'Cultural Activities',
        'Technical Events / Hackathon / Workshop',
        'Internship / Skill Development',
        'Research Paper / Innovation / Patent',
        'Entrepreneurship / Startup Work',
        'Tourism Promotion / Heritage',
        'Online Certification Courses',
        'Leadership / Student Clubs',
        'Other Approved Activity',
      ],
      required: true,
    },

    date: { type: Date, required: true },

    points: { type: Number, default: 0, min: 0, max: 50 },

    brief: { type: String, required: true, trim: true },

    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true },
    fileName: { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    remark: { type: String, default: '' },

    reviewedAt: { type: Date, default: null },

    approvedBy: { type: String, default: '' },

    // ── [AI FEATURE] Certificate Parser Results ──────────────────────────────
    // Populated when student uploads & AI parses the certificate
    aiExtracted: {
      organizingBody: { type: String, default: '' },
      participantName: { type: String, default: '' },
      confidenceScore: { type: Number, default: 0 },
      trustScore: { type: Number, default: 0 },
      ocrText: { type: String, default: '' },
      fraudFlags: { type: [String], default: [] },
      isLikelyFraudulent: { type: Boolean, default: false },
      parsedAt: { type: Date, default: null },
    },

    // ── [AI FEATURE] Semantic Keywords for Duplicate Detection ───────────────
    // Generated from AI parsing; used for Jaccard similarity checks
    semanticKeywords: { type: [String], default: [] },

    // ── [AI FEATURE] Duplicate Check Result ─────────────────────────────────
    // Stored at upload time; shown to student and faculty
    duplicateCheck: {
      checked: { type: Boolean, default: false },
      isDuplicate: { type: Boolean, default: false },
      isPossibleDuplicate: { type: Boolean, default: false },
      confidence: { type: Number, default: 0 },
      matchedActivityId: { type: mongoose.Schema.Types.ObjectId, default: null },
      reason: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

activitySchema.index({ studentId: 1 });
activitySchema.index({ facultyId: 1, status: 1 });
activitySchema.index({ 'duplicateCheck.isDuplicate': 1 }); // [AI FEATURE] index for admin queries

module.exports = mongoose.model('Activity', activitySchema);