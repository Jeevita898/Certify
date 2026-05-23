/**
 * utils/fix.js
 *
 * One-time fix script:
 *  1. Deletes all faculty + admin from DB (removes double-hashed passwords)
 *  2. Re-inserts them correctly (password hashed ONCE via pre-save hook)
 *  3. Deletes all events and re-inserts sample events
 *
 * Run: node utils/fix.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Event    = require('../models/Event');

const FACULTY_EMAILS = [
  'anitha.rao@college.edu',
  'suresh.kumar@college.edu',
  'meena.sharma@college.edu',
  'rajesh.nair@college.edu',
  'kavitha.bhat@college.edu',
];

const USERS_TO_INSERT = [
  {
    name:     'System Admin',
    email:    'admin@college.edu',
    password: 'Admin@2024',
    role:     'admin',
    empId:    'ADMIN-001',
  },
  { name: 'Dr. Anitha Rao',     email: 'anitha.rao@college.edu',   password: 'Faculty@123', role: 'faculty', empId: 'FAC-001', department: 'Computer Science & Engineering' },
  { name: 'Prof. Suresh Kumar', email: 'suresh.kumar@college.edu', password: 'Faculty@123', role: 'faculty', empId: 'FAC-002', department: 'Electronics & Communication' },
  { name: 'Dr. Meena Sharma',   email: 'meena.sharma@college.edu', password: 'Faculty@123', role: 'faculty', empId: 'FAC-003', department: 'Mechanical Engineering' },
  { name: 'Prof. Rajesh Nair',  email: 'rajesh.nair@college.edu',  password: 'Faculty@123', role: 'faculty', empId: 'FAC-004', department: 'Information Science' },
  { name: 'Dr. Kavitha Bhat',   email: 'kavitha.bhat@college.edu', password: 'Faculty@123', role: 'faculty', empId: 'FAC-005', department: 'Civil Engineering' },
];

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── Step 1: Delete all faculty + admin ──────────────────
    console.log('🗑️  Deleting old faculty and admin records...');
    const deleted = await User.deleteMany({
      email: { $in: [...FACULTY_EMAILS, 'admin@college.edu'] }
    });
    console.log(`   Deleted ${deleted.deletedCount} records\n`);

    // ── Step 2: Re-insert with correct password hashing ─────
    console.log('✅ Re-inserting with correct password hashing...');
    for (const data of USERS_TO_INSERT) {
      const user = new User(data); // plain password → pre('save') hashes it ONCE
      await user.save();
      console.log(`   Inserted: ${data.email}`);
    }

    // ── Step 3: Seed events ──────────────────────────────────
    console.log('\n🗑️  Deleting existing events...');
    const evDel = await Event.deleteMany({});
    console.log(`   Deleted ${evDel.deletedCount} events`);

    const admin = await User.findOne({ email: 'admin@college.edu' });

    const events = [
      { name: 'React.js Bootcamp',          type: 'Workshop',  date: new Date('2025-06-20'), points: 10, seats: 50,  description: 'Hands-on 2-day workshop on modern React.js covering hooks, context API, and testing strategies.' },
      { name: 'Smart India Hackathon 2025', type: 'Hackathon', date: new Date('2025-07-15'), points: 25, seats: 100, description: 'National level hackathon solving real-world government problems. Team size: 2–6 members.' },
      { name: 'AI/ML Fundamentals Seminar', type: 'Seminar',   date: new Date('2025-06-28'), points: 8,  seats: 80,  description: 'One-day seminar on foundations of AI and ML with industry expert talks and live demos.' },
      { name: 'Cultural Fest 2025',          type: 'Cultural',  date: new Date('2025-07-10'), points: 5,  seats: 200, description: 'Annual college cultural festival with competitions in music, dance, drama, and fine arts.' },
      { name: 'NSS Annual Camp',             type: 'NSS/NCC',   date: new Date('2025-07-18'), points: 15, seats: 60,  description: '7-day NSS annual camp with community service, health drives, and tree plantation.' },
    ];

    console.log('\n📅 Inserting events...');
    for (const ev of events) {
      await Event.create({ ...ev, participants: [], createdBy: admin._id });
      console.log(`   Event: ${ev.name}`);
    }

    // ── Step 4: Verify ───────────────────────────────────────
    console.log('\n🔍 Verifying...');
    const userCount  = await User.countDocuments({ role: { $in: ['faculty', 'admin'] } });
    const eventCount = await Event.countDocuments();
    console.log(`   Faculty + Admin in DB : ${userCount}`);
    console.log(`   Events in DB          : ${eventCount}`);

    console.log('\n✅ Fix complete! You can now log in with:\n');
    console.log('   Admin    : admin@college.edu       / Admin@2024');
    console.log('   Faculty  : anitha.rao@college.edu  / Faculty@123');
    console.log('   (all faculty share the same password: Faculty@123)\n');

  } catch (err) {
    console.error('❌ Fix failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();