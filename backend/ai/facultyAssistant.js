// ================================
// ai/facultyAssistant.js
// ================================
// Upgraded: Rule-based explainable logic instead of Gemini

const Activity = require('../models/Activity');
const User = require('../models/User');

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
    'Other Approved Activity': 10,
};

// ── Gather Student Context ────────────────────────────────
async function gatherStudentContext(activity) {
    const studentId = activity.studentId;

    const allActivities = await Activity.find({ studentId });

    const approved = allActivities.filter((a) => a.status === 'approved');
    const rejected = allActivities.filter((a) => a.status === 'rejected');
    
    // Check uploads this month
    const thisMonth = new Date().getMonth();
    const uploadsThisMonth = allActivities.filter(a => new Date(a.createdAt).getMonth() === thisMonth).length;

    const totalPoints = approved.reduce((s, a) => s + (a.points || 0), 0);
    const sameCategoryActivities = approved.filter((a) => a.type === activity.type);
    const sameCategoryPoints = sameCategoryActivities.reduce((s, a) => s + (a.points || 0), 0);
    const maxForCategory = MAX_POINTS[activity.type] || 10;

    return {
        student: {
            approvedCount: approved.length,
            rejectedCount: rejected.length,
            uploadsThisMonth,
            totalPoints,
        },
        category: {
            currentPoints: sameCategoryPoints,
            maxAllowed: maxForCategory,
            remainingPoints: maxForCategory - sameCategoryPoints,
        },
        aiFlags: {
            fraudFlags: activity.aiExtracted?.fraudFlags || [],
            isLikelyFraudulent: activity.aiExtracted?.isLikelyFraudulent || false,
            trustScore: activity.aiExtracted?.trustScore || 100,
            duplicateCheck: activity.duplicateCheck || {}
        },
        activityData: activity
    };
}

// ── MAIN AI BRIEFING (Rule-Based) ─────────────────────────
async function getActivityBriefing(activityId) {
    const activity = await Activity.findById(activityId)
        .populate('studentId', 'firstName lastName usn department')
        .populate('facultyId', 'name');

    if (!activity) {
        throw new Error('Activity not found');
    }

    const student = activity.studentId;
    const context = await gatherStudentContext(activity);
    
    // Rule-based logic
    let overallRisk = 'Low';
    let recommendedAction = 'Approve';
    let recommendedPoints = Math.min(10, context.category.remainingPoints); 
    const insights = [];
    const warnings = [];
    
    // 1. Analyze Points
    if (context.category.remainingPoints <= 0) {
        overallRisk = 'High';
        recommendedAction = 'Reject';
        recommendedPoints = 0;
        warnings.push(`Student has already reached the maximum ${context.category.maxAllowed} points for ${activity.type}.`);
    } else {
        insights.push(`Student has ${context.category.remainingPoints} points remaining in this category.`);
    }

    // 2. Analyze Fraud Flags & Trust Score
    if (context.aiFlags.trustScore < 75) {
        overallRisk = overallRisk === 'High' ? 'High' : 'Medium';
        warnings.push(`Certificate Trust Score is low (${context.aiFlags.trustScore}/100). Please review metadata manually.`);
    } else {
        insights.push(`Trust Score is healthy (${context.aiFlags.trustScore}/100).`);
    }

    if (context.aiFlags.isLikelyFraudulent) {
        overallRisk = 'High';
        recommendedAction = 'Reject (Pending Review)';
        warnings.push('Certificate is marked as likely fraudulent based on text/metadata analysis.');
    }

    if (context.aiFlags.fraudFlags && context.aiFlags.fraudFlags.length > 0) {
        context.aiFlags.fraudFlags.forEach(flag => warnings.push(flag));
    }

    // 3. Analyze Upload Patterns
    if (context.student.uploadsThisMonth > 5) {
        warnings.push(`Unusually frequent uploads: Student has uploaded ${context.student.uploadsThisMonth} certificates this month.`);
        overallRisk = overallRisk === 'High' ? 'High' : 'Medium';
    }

    // 4. Duplicate Check
    if (context.aiFlags.duplicateCheck.globalDuplicate) {
        overallRisk = 'High';
        recommendedAction = 'Reject (Fraudulent)';
        warnings.push(`🚨 ${context.aiFlags.duplicateCheck.confidence}% similar certificate already uploaded by another student.`);
    } else if (context.aiFlags.duplicateCheck.isDuplicate) {
        overallRisk = 'High';
        recommendedAction = 'Reject';
        warnings.push(`Strong duplicate match found. Confidence: ${context.aiFlags.duplicateCheck.confidence}%.`);
    } else if (context.aiFlags.duplicateCheck.isPossibleDuplicate) {
        overallRisk = overallRisk === 'High' ? 'High' : 'Medium';
        warnings.push(`Possible duplicate certificate detected (Similarity: ${context.aiFlags.duplicateCheck.confidence}%). Check carefully.`);
    }

    // Compose Briefing
    const briefing = {
        overallRisk,
        recommendedAction,
        recommendedPoints,
        summary: `Automated review for ${activity.name}. Risk level is ${overallRisk}.`,
        insights,
        warnings,
        pointsNote: `Max points for ${activity.type} is ${context.category.maxAllowed}.`
    };

    return {
        success: true,
        activityId,
        studentName: `${student.firstName} ${student.lastName}`,
        briefing,
    };
}

// ── Route ─────────────────────────────────────────────────
async function getActivityBriefingRoute(req, res) {
    try {
        const result = await getActivityBriefing(req.params.id);
        return res.json(result);
    } catch (err) {
        console.error('Faculty AI briefing error:', err.message);

        return res.status(500).json({
            success: false,
            message: 'AI briefing generation failed.',
            error: err.message,
        });
    }
}

module.exports = {
    getActivityBriefing,
    getActivityBriefingRoute,
};