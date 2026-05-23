// 

/**
 * utils/seed.js
 *
 * Inserts admin + faculty + sample events into MongoDB.
 * Run: npm run seed
 *
 * IMPORTANT: If you already ran seed before, run this first to fix
 * double-hashed passwords:  npm run seed -- --reset
 *
 * --reset flag deletes ALL faculty/admin and re-inserts them fresh.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Event    = require('../models/Event');

const RESET = process.argv.includes('--reset');

// ── Users ────────────────────────────────────────────────────
const ADMIN = {
  name:     'System Admin',
  email:    'admin@college.edu',
  password: 'Admin@2024',
  role:     'admin',
  empId:    'ADMIN-001',
};

const FACULTY = [
  { name: 'Dr. Anitha Rao',    email: 'anitha.rao@college.edu',   password: 'Faculty@123', role: 'faculty', empId: 'FAC-001', department: 'Computer Science & Engineering' },
  { name: 'Prof. Suresh Kumar', email: 'suresh.kumar@college.edu', password: 'Faculty@123', role: 'faculty', empId: 'FAC-002', department: 'Electronics & Communication' },
  { name: 'Dr. Meena Sharma',  email: 'meena.sharma@college.edu', password: 'Faculty@123', role: 'faculty', empId: 'FAC-003', department: 'Mechanical Engineering' },
  { name: 'Prof. Rajesh Nair', email: 'rajesh.nair@college.edu',  password: 'Faculty@123', role: 'faculty', empId: 'FAC-004', department: 'Information Science' },
  { name: 'Dr. Kavitha Bhat',  email: 'kavitha.bhat@college.edu', password: 'Faculty@123', role: 'faculty', empId: 'FAC-005', department: 'Civil Engineering' },
];

// ── Helper: insert one user (plain password → hook hashes it once) ──
async function seedUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    if (RESET) {
      await User.deleteOne({ email: data.email });
      console.log(`  🗑️   Deleted old record: ${data.email}`);
    } else {
      console.log(`  ⚠️  Skipped (already exists): ${data.email}`);
      return;
    }
  }
  // Use "new User + save()" so the pre('save') hook hashes the password ONCE
  const user = new User(data);
  await user.save();
  console.log(`  ✅  Inserted: ${data.email}`);
}

// ── Sample events ────────────────────────────────────────────
const EVENTS_DATA = [
  {
    name:        'React.js Bootcamp',
    type:        'Workshop',
    date:        new Date('2025-06-20'),
    points:      10,
    seats:       50,
    description: 'Hands-on 2-day workshop on modern React.js covering hooks, context API, and testing strategies.',
  },
  {
    name:        'Smart India Hackathon 2025',
    type:        'Hackathon',
    date:        new Date('2025-07-15'),
    points:      25,
    seats:       100,
    description: 'National level hackathon solving real-world government problems. Team size: 2–6 members.',
  },
  {
    name:        'AI/ML Fundamentals Seminar',
    type:        'Seminar',
    date:        new Date('2025-06-28'),
    points:      8,
    seats:       80,
    description: 'One-day seminar on foundations of Artificial Intelligence and Machine Learning with industry expert talks.',
  },
  {
    name:        'Cultural Fest 2025',
    type:        'Cultural',
    date:        new Date('2025-07-10'),
    points:      5,
    seats:       200,
    description: 'Annual college cultural festival with competitions in music, dance, drama, and fine arts.',
  },
  {
    name:        'NSS Annual Camp',
    type:        'NSS/NCC',
    date:        new Date('2025-07-18'),
    points:      15,
    seats:       60,
    description: '7-day NSS annual camp with community service activities, health drives, and tree plantation.',
  },
];

async function seedEvents(adminId) {
  const existingCount = await Event.countDocuments();
  if (existingCount > 0 && !RESET) {
    console.log(`  ⚠️  Skipped events (${existingCount} already exist). Use --reset to recreate.`);
    return;
  }
  if (RESET) {
    await Event.deleteMany({});
    console.log('  🗑️   Deleted all existing events');
  }
  for (const ev of EVENTS_DATA) {
    await Event.create({ ...ev, participants: [], createdBy: adminId });
    console.log(`  ✅  Event: ${ev.name}`);
  }
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    if (RESET) {
      console.log('⚡ RESET mode — deleting and re-inserting all faculty/admin/events\n');
    }

    console.log('📌 Seeding admin...');
    await seedUser(ADMIN);

    console.log('\n📌 Seeding faculty...');
    for (const f of FACULTY) await seedUser(f);

    // Get admin ID for events
    const admin = await User.findOne({ email: ADMIN.email });

    console.log('\n📌 Seeding events...');
    await seedEvents(admin._id);

    console.log('\n🎉 Seeding complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('  ADMIN');
    console.log(`  Email    : ${ADMIN.email}`);
    console.log(`  Password : ${ADMIN.password}`);
    console.log('─────────────────────────────────────────');
    console.log('  FACULTY  (password same for all)');
    FACULTY.forEach(f => console.log(`  ${f.email}`));
    console.log(`  Password : Faculty@123`);
    console.log('─────────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();