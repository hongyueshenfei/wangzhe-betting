import express from 'express';
import cors from 'cors';
import http from 'http';
import { registerRoutes } from '../src/routes/index';
import { errorHandler } from '../src/middleware/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());
registerRoutes(app);
app.use(errorHandler);

function request(opts: http.RequestOptions, body?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAll() {
  let passed = 0;
  let failed = 0;

  // Dynamically find an upcoming match
  const upcomingMatch = await prisma.match.findFirst({ where: { status: 'UPCOMING' }, select: { id: true, teamAId: true } });
  const matchId = upcomingMatch?.id || 1;
  const teamId = upcomingMatch?.teamAId || 1;
  
  // 1. Login
  const r1 = await request(
    { hostname: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    JSON.stringify({ username: 'player1', password: '123456' })
  );
  const ok1 = r1.code === 0 && r1.data?.user?.username === 'player1';
  console.log(`1. Login: ${ok1 ? 'OK' : 'FAIL'} (${r1.data?.user?.username}, coins: ${r1.data?.user?.coins})`);
  ok1 ? passed++ : failed++;
  const token = r1.data?.token;

  // 2. Checkin
  const r2 = await request(
    { hostname: 'localhost', port: 3001, path: '/api/checkin', method: 'POST', headers: { 'Authorization': 'Bearer ' + token } }
  );
  const ok2 = r2.code === 0 && r2.data?.earned === 10;
  console.log(`2. Checkin: ${ok2 ? 'OK' : 'FAIL'} (+${r2.data?.earned})`);
  ok2 ? passed++ : failed++;

  // 3. Bet on future match (dynamic ID)
  const r3 = await request(
    { hostname: 'localhost', port: 3001, path: '/api/bets', method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } },
    JSON.stringify({ matchId, teamId, amount: 30 })
  );
  const ok3 = r3.code === 0;
  console.log(`3. Bet (match#${matchId},team#${teamId}): ${ok3 ? 'OK' : 'FAIL'} (balance: ${r3.data?.newBalance}, reason: ${r3.message || 'N/A'})`);
  ok3 ? passed++ : failed++;

  // 4. Leaderboard
  const r4 = await request({ hostname: 'localhost', port: 3001, path: '/api/leaderboard/users' });
  const ok4 = r4.code === 0 && r4.data?.list?.length > 0;
  console.log(`4. Leaderboard: ${ok4 ? 'OK' : 'FAIL'} (${r4.data?.list?.length} users)`);
  ok4 ? passed++ : failed++;

  // 5. Seasons
  const r5 = await request({ hostname: 'localhost', port: 3001, path: '/api/seasons' });
  const ok5 = r5.code === 0 && r5.data?.list?.length > 0;
  console.log(`5. Seasons: ${ok5 ? 'OK' : 'FAIL'} (${r5.data?.list?.[0]?._count?.teams} teams, ${r5.data?.list?.[0]?._count?.matches} matches)`);
  ok5 ? passed++ : failed++;

  // 6. Admin login + dashboard
  const r6 = await request(
    { hostname: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    JSON.stringify({ username: 'admin', password: 'admin123' })
  );
  const r7 = await request({ hostname: 'localhost', port: 3001, path: '/api/admin/dashboard', headers: { 'Authorization': 'Bearer ' + r6.data.token } });
  const ok7 = r7.code === 0;
  console.log(`6. Admin Dashboard: ${ok7 ? 'OK' : 'FAIL'}`);
  ok7 ? passed++ : failed++;

  // 7. Teams
  const r8 = await request({ hostname: 'localhost', port: 3001, path: '/api/teams' });
  const ok8 = r8.code === 0 && r8.data?.list?.length === 8;
  console.log(`7. Teams: ${ok8 ? 'OK' : 'FAIL'} (${r8.data?.list?.length} teams)`);
  ok8 ? passed++ : failed++;

  // 8. Matches
  const r9 = await request({ hostname: 'localhost', port: 3001, path: '/api/matches' });
  const ok9 = r9.code === 0 && r9.data?.list?.length === 12;
  console.log(`8. Matches: ${ok9 ? 'OK' : 'FAIL'} (${r9.data?.list?.length} matches)`);
  ok9 ? passed++ : failed++;

  console.log('');
  console.log('======================================');
  console.log(`  API Tests: ${passed}/${passed + failed} passed`);
  console.log(`  Result: ${failed === 0 ? 'ALL PASSED' : 'SOME FAILED'}`);
  console.log('======================================');
}

const server = app.listen(3001, () => {
  console.log('Server started on port 3001');
  testAll().then(() => {
    prisma.$disconnect();
    server.close();
  }).catch(e => {
    console.error(e);
    prisma.$disconnect();
    server.close();
  });
});
