import { db, initDatabase } from '../config/database.js';
import { hashPassword } from '../utils/security.js';
import { calculateOneMonthExpiry } from '../utils/dateUtils.js';

export async function runSeeds() {
  initDatabase();

  console.log('--- Starting Database Seeding ---');

  // 1. Seed Administrator
  const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminUser) {
    const adminPasswordHash = await hashPassword('AdminPassword123!');
    db.prepare(`
      INSERT INTO users (username, password_hash, role)
      VALUES (?, ?, 'admin')
    `).run('admin', adminPasswordHash);
    console.log('✓ Administrator account created: username: "admin" | password: "AdminPassword123!"');
  } else {
    console.log('ℹ Administrator account already exists.');
  }

  // 2. Sample Members demonstrating all statuses
  const demoMembers = [
    {
      code: 'MEM-1001',
      name: 'Ahmed Khan',
      phone: '+92 300 1234567',
      email: 'ahmed.khan@example.com',
      joiningDate: '2026-10-17', // Expiry 2026-11-17 => Exactly 5 days left from 2026-11-12!
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      password: 'MemberPass123!'
    },
    {
      code: 'MEM-1002',
      name: 'Sara Malik',
      phone: '+92 321 9876543',
      email: 'sara.malik@example.com',
      joiningDate: '2026-11-05', // Expiry 2026-12-05 => Active (23 days remaining)
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      password: 'MemberPass123!'
    },
    {
      code: 'MEM-1003',
      name: 'Zainab Tariq',
      phone: '+92 333 4567890',
      email: 'zainab.tariq@example.com',
      joiningDate: '2026-10-14', // Expiry 2026-11-14 => 2 days left (Expiring Soon)
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      password: 'MemberPass123!'
    },
    {
      code: 'MEM-1004',
      name: 'Hamza Bilal',
      phone: '+92 345 5678901',
      email: 'hamza.bilal@example.com',
      joiningDate: '2026-10-08', // Expiry 2026-11-08 => Expired 4 days ago
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      password: 'MemberPass123!'
    },
    {
      code: 'MEM-1005',
      name: 'Bilal Farooq',
      phone: '+92 312 3456789',
      email: null, // Test optional email
      joiningDate: '2026-11-10', // Expiry 2026-12-10 => Active (28 days remaining)
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      password: 'MemberPass123!'
    }
  ];

  for (const m of demoMembers) {
    const existing = db.prepare('SELECT id FROM members WHERE phone = ?').get(m.phone);
    if (!existing) {
      const expiryDate = calculateOneMonthExpiry(m.joiningDate);
      const passHash = await hashPassword(m.password);

      const userRes = db.prepare(`
        INSERT INTO users (username, password_hash, role)
        VALUES (?, ?, 'member')
      `).run(m.phone, passHash);

      db.prepare(`
        INSERT INTO members (member_code, user_id, full_name, phone, email, photo_url, joining_date, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(m.code, userRes.lastInsertRowid, m.name, m.phone, m.email, m.photoUrl, m.joiningDate, expiryDate);

      console.log(`✓ Seeded member: ${m.name} (${m.code}) | Phone: ${m.phone} | Expiry: ${expiryDate}`);
    }
  }

  console.log('--- Database Seeding Complete ---');
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeeds().catch(console.error);
}
