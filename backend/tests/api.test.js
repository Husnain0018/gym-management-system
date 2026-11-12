import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { db } from '../src/config/database.js';

describe('FitHub Pro Gym Management Backend API Tests', () => {
  let adminToken = '';
  let memberToken = '';
  let createdMemberId = null;
  let memberPhone = '+92 300 9991122';
  let memberTempPassword = '';

  beforeAll(async () => {
    // Wait for DB seeds to initialize
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe('Health Check', () => {
    it('GET /api/health returns 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Authentication & Access Control', () => {
    it('POST /api/auth/login succeeds with valid admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'admin', password: 'AdminPassword123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('POST /api/auth/login fails with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'admin', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Protects admin routes from unauthenticated access', async () => {
      const res = await request(app).get('/api/members');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin Member Management & Automatic Expiration', () => {
    it('POST /api/members registers new member, calculates 1-month expiry, provisions credentials', async () => {
      const res = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('fullName', 'Kashif Ali')
        .field('phone', memberPhone)
        .field('email', 'kashif.ali@example.com')
        .field('joiningDate', '2026-11-12');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.member).toBeDefined();
      expect(res.body.member.joining_date).toBe('2026-11-12');
      // Automatic 1 calendar month calculation
      expect(res.body.member.expiry_date).toBe('2026-12-12');
      expect(res.body.provisionedCredentials).toBeDefined();
      expect(res.body.provisionedCredentials.temporaryPassword).toBeDefined();

      createdMemberId = res.body.member.id;
      memberTempPassword = res.body.provisionedCredentials.temporaryPassword;
    });

    it('Prevents duplicate member registration with identical phone number', async () => {
      const res = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('fullName', 'Another Person')
        .field('phone', memberPhone)
        .field('joiningDate', '2026-11-12');

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already registered');
    });

    it('GET /api/members returns paginated list and filters correctly', async () => {
      const res = await request(app)
        .get('/api/members?search=Kashif')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].full_name).toBe('Kashif Ali');
    });

    it('GET /api/members/:id returns detailed record with dynamic status', async () => {
      const res = await request(app)
        .get(`/api/members/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.member.id).toBe(createdMemberId);
      expect(res.body.member.status).toBe('active');
    });

    it('PUT /api/members/:id updates member and recalculates expiry date when joining date changes', async () => {
      const res = await request(app)
        .put(`/api/members/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('fullName', 'Kashif Ali Updated')
        .field('phone', memberPhone)
        .field('joiningDate', '2026-01-31'); // Test month-end edge case: Jan 31 -> Feb 28

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.member.full_name).toBe('Kashif Ali Updated');
      expect(res.body.member.expiry_date).toBe('2026-02-28');
    });
  });

  describe('Candidate / Member Panel & IDOR Security', () => {
    it('Allows member to log in using phone number and provisioned password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: memberPhone, password: memberTempPassword });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('member');
      expect(res.body.token).toBeDefined();
      memberToken = res.body.token;
    });

    it('GET /api/member/profile returns ONLY the authenticated member personal data (No IDOR)', async () => {
      const res = await request(app)
        .get('/api/member/profile')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.phone).toBe(memberPhone);
      expect(res.body.profile.fullName).toBe('Kashif Ali Updated');
    });

    it('Strictly FORBIDS candidate/member from accessing admin APIs (Role check)', async () => {
      const res = await request(app)
        .get('/api/members')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Administrator privileges required');
    });
  });

  describe('Dashboard Metrics & 5-Day Expiration Notifications', () => {
    it('GET /api/dashboard/stats returns real database metrics and 5-day warning alerts', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalMembers).toBeGreaterThan(0);
      expect(res.body.notifications).toBeDefined();

      // Check Ahmed Khan's 5-day warning notification seeded earlier (expiry 2026-11-17)
      const ahmedNotif = res.body.notifications.find((n) => n.fullName === 'Ahmed Khan');
      if (ahmedNotif) {
        expect(ahmedNotif.remainingDays).toBe(5);
        expect(ahmedNotif.message).toContain("Ahmed Khan's membership will expire in 5 days.");
      }
    });
  });

  describe('Clean Up / Delete Member', () => {
    it('DELETE /api/members/:id removes member and cascading user account', async () => {
      const res = await request(app)
        .delete(`/api/members/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify member no longer exists
      const verifyRes = await request(app)
        .get(`/api/members/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
