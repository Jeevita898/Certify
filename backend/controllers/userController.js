const User         = require('../models/User');
const Activity     = require('../models/Activity');
const Notification = require('../models/Notification');

// ═══════════════════════════════════════════════════════════
//  STUDENT CONTROLLER
// ═══════════════════════════════════════════════════════════

// GET /api/students/profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .select('-password')
      .populate('facultyId', 'name email department empId');
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/students/profile
const updateStudentProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const student = await User.findById(req.user.id);

    if (firstName) student.firstName = firstName;
    if (lastName)  student.lastName  = lastName;
    if (phone)     student.phone     = phone;
    if (email && email !== student.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ success: false, message: 'Email already in use.' });
      student.email = email;
    }
    await student.save();
    res.json({ success: true, message: 'Profile updated.', student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/students/stats
const getStudentStats = async (req, res) => {
  try {
    const activities = await Activity.find({ studentId: req.user.id });
    const approved   = activities.filter(a => a.status === 'approved');
    const pending    = activities.filter(a => a.status === 'pending');
    const rejected   = activities.filter(a => a.status === 'rejected');
    const points     = approved.reduce((s, a) => s + a.points, 0);
    res.json({
      success: true,
      stats: { total: activities.length, approved: approved.length, pending: pending.length, rejected: rejected.length, points },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ═══════════════════════════════════════════════════════════
//  FACULTY CONTROLLER
// ═══════════════════════════════════════════════════════════

// GET /api/faculty/list  (public — for student signup dropdown)
const getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).select('_id name email department empId');
    res.json({ success: true, faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/faculty/profile
const getFacultyProfile = async (req, res) => {
  try {
    const faculty   = await User.findById(req.user.id).select('-password');
    const students  = await User.find({ facultyId: req.user.id, role: 'student' }).select('firstName lastName usn department email');
    res.json({ success: true, faculty, students });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/faculty/students
const getAssignedStudents = async (req, res) => {
  try {
    const students = await User.find({ facultyId: req.user.id, role: 'student' }).select('-password');

    // Enrich with stats
    const enriched = await Promise.all(
      students.map(async (s) => {
        const acts     = await Activity.find({ studentId: s._id });
        const approved = acts.filter(a => a.status === 'approved');
        const pts      = approved.reduce((sum, a) => sum + a.points, 0);
        return { ...s.toJSON(), totalSubmissions: acts.length, approvedCount: approved.length, points: pts };
      })
    );
    res.json({ success: true, students: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ═══════════════════════════════════════════════════════════
//  NOTIFICATION CONTROLLER
// ═══════════════════════════════════════════════════════════

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = notifs.filter(n => !n.read).length;
    res.json({ success: true, notifications: notifs, unreadCount: unread });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ═══════════════════════════════════════════════════════════
//  ADMIN CONTROLLER
// ═══════════════════════════════════════════════════════════

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const [students, faculty, activities, events] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Activity.countDocuments(),
      require('../models/Event').countDocuments(),
    ]);
    const pending  = await Activity.countDocuments({ status: 'pending' });
    const approved = await Activity.countDocuments({ status: 'approved' });
    res.json({ success: true, stats: { students, faculty, activities, events, pending, approved } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/students
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('facultyId', 'name department');
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/activities
const getAllActivitiesAdmin = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .populate('studentId', 'firstName lastName usn')
      .populate('facultyId', 'name');
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getStudentProfile, updateStudentProfile, getStudentStats,
  getFacultyList, getFacultyProfile, getAssignedStudents,
  getNotifications, markRead, markAllRead,
  getAdminStats, getAllStudents, getAllActivitiesAdmin,
};
