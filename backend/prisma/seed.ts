import { PrismaClient, Role, SeasonStatus, MatchStage, MatchStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Clean existing data (order matters for FK constraints)
  await prisma.coinTransaction.deleteMany();
  await prisma.bet.deleteMany();
  await prisma.championBet.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.season.deleteMany();
  await prisma.user.deleteMany();

  // ─── 1. Admin User ─────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      coins: 1000,
    },
  });
  console.log('✅ Admin user created: admin / admin123');

  // ─── 2. Sample Bettor Users ──────────────────────
  const bettorPasswordHash = await bcrypt.hash('123456', BCRYPT_ROUNDS);
  const bettor1 = await prisma.user.create({
    data: { username: 'player1', passwordHash: bettorPasswordHash, coins: 500 },
  });
  const bettor2 = await prisma.user.create({
    data: { username: 'player2', passwordHash: bettorPasswordHash, coins: 300 },
  });
  const bettor3 = await prisma.user.create({
    data: { username: 'player3', passwordHash: bettorPasswordHash, coins: 200 },
  });
  console.log('✅ Sample bettor users created (player1~3 / 123456)');

  // Record initial coin transactions
  for (const user of [admin, bettor1, bettor2, bettor3]) {
    await prisma.coinTransaction.create({
      data: {
        userId: user.id,
        amount: user.coins,
        type: 'INITIAL',
        balanceAfter: user.coins,
      },
    });
  }

  // ─── 3. Sample Season ────────────────────────────
  const now = new Date();
  const season = await prisma.season.create({
    data: {
      name: 'S1 春季赛',
      status: SeasonStatus.ACTIVE,
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),  // 23 days later
    },
  });
  console.log('✅ Sample season created: S1 春季赛');

  // ─── 4. Sample Teams (8 teams in 2 groups) ───────
  const teamData = [
    // Group A
    { name: 'AG超玩会', abbr: 'AG', color: '#1565C0', description: 'KPL老牌强队,以稳健打法著称', members: '["梦泪","老帅","VV","兰息","杰斯"]' },
    { name: 'eStarPro', abbr: 'ES', color: '#E65100', description: '进攻型战队,节奏极快', members: '["诺言","Cat","Alan","花海","无铭"]' },
    { name: 'QGha', abbr: 'QG', color: '#2E7D32', description: '战术大师,运营能力强', members: '["Fly","Hurt","Snow","Mojo","770"]' },
    { name: 'Hero久竞', abbr: 'HE', color: '#6A1B9A', description: '新锐战队,充满活力', members: '["久诚","尘夏","柠栀","最初","七年"]' },
    // Group B
    { name: 'RNG.M', abbr: 'RN', color: '#D32F2F', description: '实力均衡,团队协作出色', members: '["虔诚","暴风锐","Zero","凉晨","雨雨"]' },
    { name: 'EDG.M', abbr: 'ED', color: '#37474F', description: '打法灵活多变', members: '["初晨","浪浪","koko","阿澈","无痕"]' },
    { name: 'TS豚首', abbr: 'TS', color: '#00BCD4', description: '新生代强队,天赋异禀', members: '["暖阳","诗酒","千世","阿豆","神人"]' },
    { name: 'DYG.JC', abbr: 'DY', color: '#F57C00', description: '战术多变,难以预测', members: '["易峥","清清","久诚","星宇","纵情"]' },
  ];

  const teams: { id: number; name: string }[] = [];
  for (const td of teamData) {
    const team = await prisma.team.create({
      data: {
        name: td.name,
        abbr: td.abbr || null,
        color: td.color || null,
        description: td.description,
        members: td.members,
        seasonId: season.id,
      },
    });
    teams.push({ id: team.id, name: team.name });
  }
  console.log(`✅ ${teams.length} teams created`);

  // ─── 5. Sample Matches (Group Stage) ─────────────
  // Group A: teams[0..3], Group B: teams[4..7]
  // Each group: round-robin = 6 matches per group
  const groupMatches = [
    // Group A (teams 0-3)
    { groupName: 'A组', teamA: teams[0], teamB: teams[1], dayOffset: 1 },
    { groupName: 'A组', teamA: teams[2], teamB: teams[3], dayOffset: 1 },
    { groupName: 'A组', teamA: teams[0], teamB: teams[2], dayOffset: 3 },
    { groupName: 'A组', teamA: teams[1], teamB: teams[3], dayOffset: 3 },
    { groupName: 'A组', teamA: teams[0], teamB: teams[3], dayOffset: 5 },
    { groupName: 'A组', teamA: teams[1], teamB: teams[2], dayOffset: 5 },
    // Group B (teams 4-7)
    { groupName: 'B组', teamA: teams[4], teamB: teams[5], dayOffset: 2 },
    { groupName: 'B组', teamA: teams[6], teamB: teams[7], dayOffset: 2 },
    { groupName: 'B组', teamA: teams[4], teamB: teams[6], dayOffset: 4 },
    { groupName: 'B组', teamA: teams[5], teamB: teams[7], dayOffset: 4 },
    { groupName: 'B组', teamA: teams[4], teamB: teams[7], dayOffset: 6 },
    { groupName: 'B组', teamA: teams[5], teamB: teams[6], dayOffset: 6 },
  ];

  for (const gm of groupMatches) {
    const matchTime = new Date(now.getTime() + gm.dayOffset * 24 * 60 * 60 * 1000);
    // Some matches already completed for demo
    const isCompleted = gm.dayOffset < 4;
    let teamAScore: number | null = null;
    let teamBScore: number | null = null;
    let winnerTeamId: number | null = null;
    let status: MatchStatus = MatchStatus.UPCOMING;

    if (isCompleted) {
      teamAScore = Math.floor(Math.random() * 3) + 1; // 1-3
      teamBScore = teamAScore > 1 ? Math.floor(Math.random() * teamAScore) : 0;
      winnerTeamId = teamAScore > teamBScore ? gm.teamA.id : gm.teamB.id;
      status = MatchStatus.COMPLETED;
    }

    await prisma.match.create({
      data: {
        seasonId: season.id,
        stage: MatchStage.GROUP,
        groupName: gm.groupName,
        teamAId: gm.teamA.id,
        teamBId: gm.teamB.id,
        matchTime,
        status,
        teamAScore,
        teamBScore,
        winnerTeamId,
      },
    });
  }
  console.log(`✅ ${groupMatches.length} group stage matches created`);

  // Update team win/loss records based on completed matches
  for (const gm of groupMatches) {
    if (gm.dayOffset < 4) {
      const teamAScore = Math.floor(Math.random() * 3) + 1;
      const teamBScore = teamAScore > 1 ? Math.floor(Math.random() * teamAScore) : 0;
      if (teamAScore > teamBScore) {
        await prisma.team.update({ where: { id: gm.teamA.id }, data: { wins: { increment: 1 } } });
        await prisma.team.update({ where: { id: gm.teamB.id }, data: { losses: { increment: 1 } } });
      } else {
        await prisma.team.update({ where: { id: gm.teamB.id }, data: { wins: { increment: 1 } } });
        await prisma.team.update({ where: { id: gm.teamA.id }, data: { losses: { increment: 1 } } });
      }
    }
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
