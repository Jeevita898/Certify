const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Generate JWT ────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── POST /api/auth/login ────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    // Build a clean user object to send to frontend
    const userData = {
      id:         user._id,
      role:       user.role,
      email:      user.email,
      department: user.department || user.dept,
    };

    if (user.role === 'student') {
      userData.firstName = user.firstName;
      userData.lastName  = user.lastName;
      userData.usn       = user.usn;
      userData.facultyId = user.facultyId;
    } else {
      userData.name  = user.name;
      userData.empId = user.empId;
    }

    res.json({ success: true, token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ── POST /api/auth/register  (students only) ────────────────
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, usn, department, facultyId } = req.body;

    if (!firstName || !lastName || !email || !password || !usn || !department || !facultyId) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const usnExists = await User.findOne({ usn: usn.toUpperCase() });
    if (usnExists) {
      return res.status(409).json({ success: false, message: 'USN already registered.' });
    }

    // Verify faculty exists
    const faculty = await User.findOne({ _id: facultyId, role: 'faculty' });
    if (!faculty) {
      return res.status(400).json({ success: false, message: 'Selected faculty not found.' });
    }

    const student = await User.create({
      firstName,
      lastName,
      email,
      password,
      usn,
      department,
      facultyId,
      role: 'student',
    });

    const token = signToken(student._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id:         student._id,
        role:       student.role,
        email:      student.email,
        firstName:  student.firstName,
        lastName:   student.lastName,
        usn:        student.usn,
        department: student.department,
        facultyId:  student.facultyId,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ── GET /api/auth/me ────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('facultyId', 'name email department empId');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { login, register, getMe };
