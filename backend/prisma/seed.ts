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

  // ─── 3. Default Teams (5 KPL teams with complete info) ──
  const teamData = [
    {
      name: 'AG超玩会',
      abbr: 'AG',
      color: '#1565C0',
      description: 'KPL老牌豪门战队，以稳健运营和团战执行力著称。多次夺得联赛冠军，拥有庞大粉丝群体。',
      logoUrl: '/uploads/logo-ag.svg',
      posterUrl: '',
      members: JSON.stringify({
        topLaner: '轩染',
        midLaner: '长生',
        adc: '一诺',
        support: '大帅',
        jungler: '钟意',
        substitute: '壶神',
      }),
    },
    {
      name: 'eStarPro',
      abbr: 'ES',
      color: '#E65100',
      description: 'KPL顶级强队，以凌厉的进攻风格和极快的比赛节奏闻名。团队默契度高，中野联动能力极强。',
      logoUrl: '/uploads/logo-es.svg',
      posterUrl: '',
      members: JSON.stringify({
        topLaner: '坦然',
        midLaner: '清融',
        adc: '绝意',
        support: '子阳',
        jungler: '花海',
        substitute: '易峥',
      }),
    },
    {
      name: 'QGhappy',
      abbr: 'QG',
      color: '#2E7D32',
      description: '五冠王传奇战队，战术大师级别运营能力。凭借深厚的英雄池和灵活的BP策略，长期屹立于KPL顶尖行列。',
      logoUrl: '/uploads/logo-qg.svg',
      posterUrl: '',
      members: JSON.stringify({
        topLaner: 'Fly',
        midLaner: '向鱼',
        adc: '妖刀',
        support: '帆帆',
        jungler: '小胖',
        substitute: '月色',
      }),
    },
    {
      name: 'Hero久竞',
      abbr: 'HE',
      color: '#6A1B9A',
      description: '新生代劲旅，以创新战术体系和选手个人能力见长。打法凶悍，敢打敢拼，被誉为"KPL黑马"。',
      logoUrl: '/uploads/logo-hero.svg',
      posterUrl: '',
      members: JSON.stringify({
        topLaner: '星痕',
        midLaner: '铃铛',
        adc: '傲寒',
        support: '久酷',
        jungler: '无畏',
        substitute: '誓约',
      }),
    },
    {
      name: 'RNG.M',
      abbr: 'RN',
      color: '#D32F2F',
      description: '综合实力均衡的全能战队，团队协作出色。各位置实力均衡，善于在逆境中寻找翻盘机会。',
      logoUrl: '/uploads/logo-rng.svg',
      posterUrl: '',
      members: JSON.stringify({
        topLaner: '雨雨',
        midLaner: '天真',
        adc: '虔诚',
        support: 'Zero',
        jungler: '晚秋',
        substitute: '小伤',
      }),
    },
  ];

  for (const td of teamData) {
    await prisma.team.create({ data: td });
  }
  console.log(`✅ ${teamData.length} teams created with complete info (IDs 1~5)`);

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
