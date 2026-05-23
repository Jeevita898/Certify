// ================================
// ai/certificateParser.js
// ================================
// Upgraded: Rule-based explainable logic instead of Gemini

// ── VTU Activity Categories ───────────────────────────────
const VTU_CATEGORIES = [
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
];

// ── Certificate Trust Score Generator ────────────────────
function generateTrustScore(fields, ocrText) {
    let score = 100;
    const fraudFlags = [];
    let isLikelyFraudulent = false;

    // 1. OCR Confidence check (Rule-based: check if event name exists in OCR text)
    if (ocrText && ocrText.length > 0) {
        const lowerText = ocrText.toLowerCase();
        
        // If the submitted name isn't somewhat present in the OCR text, deduct points
        if (fields.activityName && !lowerText.includes(fields.activityName.toLowerCase().substring(0, 5))) {
            score -= 15;
            fraudFlags.push('Event name not clearly found in OCR text');
        }

        // Check if organizing body is in OCR text
        if (fields.organizingBody && !lowerText.includes(fields.organizingBody.toLowerCase().substring(0, 5))) {
            score -= 10;
        }

        // Look for suspicious edits or keywords
        if (lowerText.match(/photoshop|edited|sample|template/i)) {
            score -= 40;
            fraudFlags.push('Suspicious keywords found in certificate text');
            isLikelyFraudulent = true;
        }
    } else {
        score -= 25; // No OCR text provided or extraction failed
        fraudFlags.push('No parseable text found on certificate');
    }

    // 2. Metadata consistency
    if (!fields.activityName || !fields.organizingBody || !fields.eventDate) {
        score -= 10;
        fraudFlags.push('Missing critical metadata fields');
    }

    if (score < 50) {
        isLikelyFraudulent = true;
    }

    return {
        confidenceScore: Math.max(0, score),
        fraudFlags,
        isLikelyFraudulent
    };
}

// ── MAIN PARSER (Now just Trust Score Gen) ───────────────
async function parseCertificate(fileUrl, formData = {}) {
    // We now rely on frontend Tesseract.js OCR results
    // We calculate the Trust Score based on the frontend data.
    
    let suggestedCategory = formData.type || 'Other Approved Activity';
    if (!VTU_CATEGORIES.includes(suggestedCategory)) {
        suggestedCategory = 'Other Approved Activity';
    }

    const { confidenceScore, fraudFlags, isLikelyFraudulent } = generateTrustScore(
        {
            activityName: formData.name,
            organizingBody: formData.organizingBody,
            eventDate: formData.date
        },
        formData.ocrText
    );

    return {
        success: true,
        extracted: {
            activityName: formData.name || '',
            organizingBody: formData.organizingBody || '',
            participantName: formData.participantName || '',
            eventDate: formData.date || new Date(),
            suggestedCategory,
            confidenceScore,
            briefDescription: formData.brief || '',
            fraudFlags,
            isLikelyFraudulent
        }
    };
}

// ── Route Handler ─────────────────────────────────────────
async function parseCertificateRoute(req, res) {
    try {
        const { fileUrl, ocrText, name, type, date, organizingBody } = req.body;

        const result = await parseCertificate(fileUrl, {
            ocrText, name, type, date, organizingBody
        });

        return res.json(result);
    } catch (err) {
        console.error('Certificate parse error:', err.message);

        return res.status(500).json({
            success: false,
            message: 'Parsing failed.',
            error: err.message,
        });
    }
}

module.exports = {
    parseCertificate,
    parseCertificateRoute,
};