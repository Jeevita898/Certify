const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');

// ── Calculate badges (gamification) ─────────────────────
function getBadges(student, activities) {
    const badges = [];
    
    // Total points
    const approved = activities.filter(a => a.status === 'approved' && a.studentId.toString() === student._id.toString());
    const totalPoints = approved.reduce((sum, a) => sum + (a.points || 0), 0);
    
    // Category checks
    const hasCategory = (catStr) => approved.some(a => a.type && a.type.includes(catStr));
    
    if (totalPoints >= 100) badges.push('🎓 VTU Graduate');
    if (hasCategory('NSS') || hasCategory('Blood')) badges.push('🤝 Social Leader');
    if (hasCategory('Hackathon') || hasCategory('Technical')) badges.push('💻 Tech Expert');
    if (hasCategory('Research') || hasCategory('Startup')) badges.push('💡 Innovator');
    if (hasCategory('Sports')) badges.push('🏅 Athlete');
    
    return badges;
}

// ── GET /api/leaderboard ────────────────────────────────
router.get('/', protect, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('firstName lastName usn department profilePic')
            .lean();
            
        const activities = await Activity.find({ status: 'approved' }).lean();
        
        // Calculate points and badges for each student
        const leaderboard = students.map(student => {
            const studentActivities = activities.filter(a => a.studentId.toString() === student._id.toString());
            const points = studentActivities.reduce((sum, a) => sum + (a.points || 0), 0);
            
            return {
                ...student,
                points,
                badges: getBadges(student, activities)
            };
        });
        
        // Sort descending by points
        leaderboard.sort((a, b) => b.points - a.points);
        
        // Top Departments
        const deptScores = {};
        leaderboard.forEach(st => {
            deptScores[st.department] = (deptScores[st.department] || 0) + st.points;
        });
        
        const topDepartments = Object.entries(deptScores)
            .sort((a, b) => b[1] - a[1])
            .map(([dept, pts]) => ({ department: dept, points: pts }));

        res.json({
            success: true,
            topStudents: leaderboard.slice(0, 100), // Top 100
            topDepartments: topDepartments.slice(0, 5) // Top 5
        });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching leaderboard.' });
    }
});

module.exports = router;
