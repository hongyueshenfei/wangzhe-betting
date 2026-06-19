import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Reset SQLite auto-increment counters (DML delete doesn't reset them)
  await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence');

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
      coins: 500,
    },
  });
  console.log('✅ Admin user created: admin / admin123');

  // ─── 2. Sample Bettor Users ──────────────────────
  const bettorPasswordHash = await bcrypt.hash('123456', BCRYPT_ROUNDS);
  const bettor1 = await prisma.user.create({
    data: { username: 'player1', passwordHash: bettorPasswordHash, coins: 100 },
  });
  const bettor2 = await prisma.user.create({
    data: { username: 'player2', passwordHash: bettorPasswordHash, coins: 100 },
  });
  const bettor3 = await prisma.user.create({
    data: { username: 'player3', passwordHash: bettorPasswordHash, coins: 100 },
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

  // ─── 3. Sample Teams (no season assigned — manage via admin panel) ──
  const teamData = [
    // Group A
    { name: 'AG超玩会', abbr: 'AG', color: '#1565C0', description: 'KPL老牌强队,以稳健打法著称' },
    { name: 'eStarPro', abbr: 'ES', color: '#E65100', description: '进攻型战队,节奏极快' },
    { name: 'QGha', abbr: 'QG', color: '#2E7D32', description: '战术大师,运营能力强' },
    { name: 'Hero久竞', abbr: 'HE', color: '#6A1B9A', description: '新锐战队,充满活力' },
    // Group B
    { name: 'RNG.M', abbr: 'RN', color: '#D32F2F', description: '实力均衡,团队协作出色' },
    { name: 'EDG.M', abbr: 'ED', color: '#37474F', description: '打法灵活多变' },
    { name: 'TS豚首', abbr: 'TS', color: '#00BCD4', description: '新生代强队,天赋异禀' },
    { name: 'DYG.JC', abbr: 'DY', color: '#F57C00', description: '战术多变,难以预测' },
  ];

  for (const td of teamData) {
    await prisma.team.create({ data: td });
  }
  console.log(`✅ ${teamData.length} teams created (IDs 1~8)`);

  console.log('🎉 Seeding complete! 赛季和比赛请在管理后台自行创建。');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
