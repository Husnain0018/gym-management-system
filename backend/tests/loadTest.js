import autocannon from 'autocannon';
import { db } from '../src/config/database.js';
import { generateToken } from '../src/middleware/auth.js';

async function runLoadTests() {
  console.log('=====================================================');
  console.log('⚡ FITHUB PRO — 1,000 CONCURRENT LOAD TESTING HARNESS');
  console.log('=====================================================');

  // Prepare Admin Token for authenticated load test
  const adminUser = db.prepare('SELECT id, username, role FROM users WHERE username = ?').get('admin');
  const token = generateToken({
    id: adminUser.id,
    username: adminUser.username,
    role: adminUser.role,
    memberId: null
  });

  const baseUrl = process.env.TEST_URL || 'http://127.0.0.1:5000';

  console.log(`Target URL: ${baseUrl}`);
  console.log(`Admin Token: Generated (Length: ${token.length})`);

  // SCENARIO 1: 1,000 Concurrent Connections on API Health & Readiness
  console.log('\n--- SCENARIO 1: 1,000 Concurrent Connections (Engine Health & Edge Routing) ---');
  const healthResults = await autocannon({
    url: `${baseUrl}/api/health`,
    connections: 1000,
    duration: 10,
    pipelining: 1,
    headers: {
      'connection': 'keep-alive',
      'x-load-test': 'true'
    }
  });

  console.log(`Requests 2xx (Success): ${healthResults['2xx']}`);
  console.log(`Requests non-2xx (Errors): ${healthResults.non2xx}`);
  console.log(`Average Latency: ${healthResults.latency.average} ms`);
  console.log(`p95 Latency: ${healthResults.latency.p95 || healthResults.latency.p97_5 || healthResults.latency.p99} ms`);
  console.log(`p99 Latency: ${healthResults.latency.p99} ms`);
  console.log(`Throughput: ${Math.round(healthResults.requests.average)} req/sec`);
  console.log(`Total Requests Handled: ${healthResults.requests.total}`);
  console.log(`Timeouts: ${healthResults.timeouts}`);

  // SCENARIO 2: 1,000 Concurrent Authenticated Dashboard Telemetry Queries
  console.log('\n--- SCENARIO 2: 1,000 Concurrent Authenticated Requests (/api/dashboard/stats) ---');
  const dashboardResults = await autocannon({
    url: `${baseUrl}/api/dashboard/stats`,
    connections: 1000,
    duration: 10,
    pipelining: 1,
    headers: {
      'Authorization': `Bearer ${token}`,
      'connection': 'keep-alive',
      'x-load-test': 'true'
    }
  });

  console.log(`Requests 2xx (Success): ${dashboardResults['2xx']}`);
  console.log(`Requests non-2xx (Errors): ${dashboardResults.non2xx}`);
  console.log(`Average Latency: ${dashboardResults.latency.average} ms`);
  console.log(`p95 Latency: ${dashboardResults.latency.p95 || dashboardResults.latency.p97_5 || dashboardResults.latency.p99} ms`);
  console.log(`p99 Latency: ${dashboardResults.latency.p99} ms`);
  console.log(`Throughput: ${Math.round(dashboardResults.requests.average)} req/sec`);
  console.log(`Total Requests Handled: ${dashboardResults.requests.total}`);
  console.log(`Timeouts: ${dashboardResults.timeouts}`);

  // SCENARIO 3: 500 Concurrent Member Directory Queries with Database Index Lookups
  console.log('\n--- SCENARIO 3: 500 Concurrent Member Directory Queries with Search & Pagination ---');
  const membersResults = await autocannon({
    url: `${baseUrl}/api/members?page=1&limit=10`,
    connections: 500,
    duration: 10,
    pipelining: 1,
    headers: {
      'Authorization': `Bearer ${token}`,
      'connection': 'keep-alive',
      'x-load-test': 'true'
    }
  });

  console.log(`Requests 2xx (Success): ${membersResults['2xx']}`);
  console.log(`Requests non-2xx (Errors): ${membersResults.non2xx}`);
  console.log(`Average Latency: ${membersResults.latency.average} ms`);
  console.log(`p95 Latency: ${membersResults.latency.p95 || membersResults.latency.p97_5 || membersResults.latency.p99} ms`);
  console.log(`p99 Latency: ${membersResults.latency.p99} ms`);
  console.log(`Throughput: ${Math.round(membersResults.requests.average)} req/sec`);
  console.log(`Total Requests Handled: ${membersResults.requests.total}`);
  console.log(`Timeouts: ${membersResults.timeouts}`);

  console.log('\n=====================================================');
  console.log('✅ 1,000 CONCURRENT LOAD TESTING COMPLETED SUCCESSFULLY');
  console.log('=====================================================');
}

runLoadTests().catch(console.error);
