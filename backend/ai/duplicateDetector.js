// ================================
// ai/duplicateDetector.js
// ================================
// Upgraded: Rule-based explainable logic instead of Gemini

const Activity = require('../models/Activity');

// ── Generate Semantic Keywords (Rule-Based) ───────────────
async function generateCertificateEmbedding(fields) {
    const text = [
        fields.activityName || fields.name || '',
        fields.organizingBody || '',
        fields.type || '',
        fields.brief || '',
        fields.ocrText || ''
    ]
        .join(' ')
        .toLowerCase();

    // Simple rule-based keyword extraction
    // Remove common stop words and punctuation
    const stopWords = ['the', 'and', 'for', 'with', 'this', 'that', 'certificate', 'participation', 'awarded', 'to', 'of', 'in', 'on', 'at'];
    
    const words = text
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stopWords.includes(w));

    // Get unique keywords, max 25
    const uniqueKeywords = [...new Set(words)].slice(0, 25);
    
    return uniqueKeywords;
}

// ── Jaccard Similarity ────────────────────────────────────
function jaccardSimilarity(setA, setB) {
    if (!setA || !setB) return 0;
    
    const a = new Set(setA.map((k) => k.toLowerCase()));
    const b = new Set(setB.map((k) => k.toLowerCase()));

    const intersection = new Set([...a].filter((x) => b.has(x)));
    const union = new Set([...a, ...b]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
}

// ── Date proximity ────────────────────────────────────────
function datesAreClose(dateA, dateB, dayThreshold = 30) {
    if (!dateA || !dateB) return false;

    const diff = Math.abs(new Date(dateA) - new Date(dateB));
    const daysDiff = diff / (1000 * 60 * 60 * 24);

    return daysDiff <= dayThreshold;
}

// ── Duplicate Check ───────────────────────────────────────
async function checkDuplicate(studentId, newActivity) {
    const existingActivities = await Activity.find({
        status: { $ne: 'rejected' },
    }).select('name type date brief semanticKeywords _id status studentId');

    if (existingActivities.length === 0) {
        return {
            isDuplicate: false,
            confidence: 0,
            semanticKeywords: await generateCertificateEmbedding(newActivity)
        };
    }

    const newKeywords = await generateCertificateEmbedding(newActivity);
    const matches = [];

    for (const existing of existingActivities) {
        // Skip comparing with itself if updating
        if (newActivity._id && newActivity._id.toString() === existing._id.toString()) continue;

        const existingKeywords = existing.semanticKeywords || [];

        if (existingKeywords.length === 0) continue;

        const similarity = jaccardSimilarity(newKeywords, existingKeywords);
        const sameCategory = newActivity.type === existing.type;
        const sameTimeWindow = datesAreClose(newActivity.date, existing.date);

        let compositeSim = similarity;

        if (sameCategory) compositeSim += 0.15;
        if (sameTimeWindow) compositeSim += 0.20;
        
        // Exact name match is highly suspicious
        if (newActivity.name && existing.name && newActivity.name.toLowerCase() === existing.name.toLowerCase()) {
            compositeSim += 0.30;
        }

        compositeSim = Math.min(compositeSim, 1);

        if (compositeSim > 0.45) {
            matches.push({
                activity: existing,
                similarity: compositeSim,
            });
        }
    }

    if (matches.length === 0) {
        return {
            isDuplicate: false,
            confidence: 0,
            semanticKeywords: newKeywords,
        };
    }

    matches.sort((a, b) => b.similarity - a.similarity);
    const topMatch = matches[0];
    
    const isGlobalDuplicate = topMatch.activity.studentId && studentId 
        ? topMatch.activity.studentId.toString() !== studentId.toString()
        : false;

    return {
        isDuplicate: topMatch.similarity > 0.65,
        isPossibleDuplicate: topMatch.similarity > 0.45,
        confidence: Math.round(topMatch.similarity * 100),
        matchedActivityId: topMatch.activity._id,
        matchedActivityName: topMatch.activity.name,
        semanticKeywords: newKeywords,
        globalDuplicate: isGlobalDuplicate
    };
}

// ── Route ─────────────────────────────────────────────────
async function checkDuplicateRoute(req, res) {
    try {
        const { name, type, date, brief, organizingBody, ocrText } = req.body;

        const result = await checkDuplicate(req.user.id, {
            name,
            type,
            date,
            brief,
            organizingBody,
            ocrText
        });

        return res.json({
            success: true,
            ...result,
        });
    } catch (err) {
        console.error('Duplicate check error:', err.message);

        return res.status(500).json({
            success: false,
            message: 'Duplicate check failed.',
            error: err.message,
        });
    }
}

module.exports = {
    checkDuplicate,
    generateCertificateEmbedding,
    checkDuplicateRoute,
};