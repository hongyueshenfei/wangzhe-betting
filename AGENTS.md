# 王者荣耀竞猜平台 · AI 认知地图

## 一句话描述
王者荣耀赛事竞猜平台。用户注册后获得虚拟币，对比赛和赛季冠军进行投注，系统根据比赛结果自动结算赔率并派奖。

## 技术栈
- **后端**: Node.js + Express + TypeScript + Prisma ORM + SQLite(开发)/MySQL(生产)
- **前端**: React 18 + MUI 6 + Tailwind CSS + Zustand + React Router 7 + Axios
- **构建**: Vite 6（前端）/ tsc（后端）
- **认证**: JWT（jsonwebtoken + bcryptjs），7 天过期

## 项目目录结构
```
王者荣耀竞猜/
├── .cursorrules            # AI 编码硬约束（优先阅读）
├── AGENTS.md               # 本文档
├── backend/
│   └── src/
│       ├── config/          # 环境变量配置
│       ├── types/           # 全局 TS 类型定义
│       ├── utils/           # 工具函数（jwt、password、response、constants）
│       ├── middleware/      # Express 中间件（auth、admin、errorHandler）
│       ├── routes/          # 路由注册（薄层，仅绑定 Controller 方法）
│       ├── controllers/     # 请求校验 + 响应格式化
│       └── services/        # 业务逻辑层
├── frontend/
│   └── src/
│       ├── api/             # Axios API 调用模块
│       ├── store/           # Zustand 状态管理
│       ├── hooks/           # 自定义 Hooks
│       ├── components/      # UI 组件（layout/common/match/bet/team/leaderboard/admin）
│       ├── pages/           # 页面组件
│       └── routes/          # 路由配置 + 权限守卫
├── docs/
│   └── system_design.md    # 架构设计文档（1072 行，详细含 API 表、数据模型）
└── test/                   # E2E 测试快照
```

## 架构分层（Routes → Controllers → Services → Prisma）
```
Request → router(method绑定) → controller(校验+格式化) → service(业务逻辑) → Prisma Client(数据持久化)
                                                                                        ↓
                                                                                  SQLite/MySQL
```
- **Routes** 仅注册路由路径和 HTTP 方法，不写逻辑
- **Controllers** 校验输入参数 + 调用 Service + 用 response.ts 格式化输出
- **Services** 纯粹的业务逻辑，通过 Prisma Client 操作数据库
- 全局错误由 errorHandler middleware 统一兜底

## 核心数据模型（6 个）
1. **User** — 用户（username, passwordHash, role: ADMIN/BETTOR, coins, isBanned）
2. **Season** — 赛季（name, status: UPCOMING/ACTIVE/COMPLETED, championTeamId）
3. **Team** — 战队（name, abbr, color, logoUrl, posterUrl, seasonId）
4. **Match** — 比赛（seasonId, teamA/B, oddsA/B, status, betTotalA/B, matchTime）
5. **Bet** — 投注（userId, matchId, pickedTeamId, amount, oddsAtBet, status: PENDING/WON/LOST/REFUNDED）
6. **ChampionBet** — 冠军投注（userId, seasonId, teamId, amount, status）
7. **CoinTransaction** — 金币流水（userId, amount, type, balanceAfter）

## 关键业务规则（来自 constants.ts + schema）
- 新用户初始金币: `INITIAL_COINS = 100`
- 每日签到奖励: `CHECKIN_REWARD = 5` 币
- 赔率范围: `MIN_ODDS = 1.3` ~ `MAX_ODDS = 5.0`，默认 `DEFAULT_ODDS = 2.0`
- 最小投注额: `MIN_BET_AMOUNT = 1` 币
- 无平局，弃赛全额退款
- 仅有胜负投注（无比分投注）
- 淘汰赛对阵：小组赛后根据排名自动生成（A1vsB2, B1vsA2）
- JWT 7 天过期，bcrypt 10 轮 salt

## API 概览（全部以 /api 为前缀）
| 模块 | 前缀 | 关键端点 |
|------|------|---------|
| 认证 | /api/auth | POST register, POST login, GET me |
| 签到 | /api/checkin | POST checkin |
| 用户 | /api/users | GET/PUT me, GET :id |
| 赛季 | /api/seasons | CRUD + PUT :id/champion |
| 战队 | /api/teams | CRUD |
| 比赛 | /api/matches | GET, POST generate, PUT :id(result), PUT :id/forfeit |
| 投注 | /api/bets | POST bet, GET mine, POST champion, GET champion/mine |
| 赔率 | /api/odds | GET :matchId, PUT :matchId |
| 排行榜 | /api/leaderboard | GET users, GET teams |
| 管理后台 | /api/admin | GET dashboard, GET users, PUT ban/unban/coins |
| 上传 | /api/upload | POST upload |
| 流水 | /api/transactions | GET mine |

## 工作流程
1. **赛季生命周期**: 创建赛季 → 添加战队 → 生成小组赛/淘汰赛 → 录入赛果 → 自动结算
2. **投注流程**: 用户注册(100币) → 签到(每日+5) → 查看比赛 → 下注(扣币, 锁定赔率) → 等待赛果
3. **结算流程**: 管理员录入赛果 → settlement.service 扫描结算 → 赢家获得 amount × oddsAtBet → 输家扣除归零 → 弃赛全额退款
4. **文件上传**: 战队 Logo/海报通过 multer 上传到 backend/uploads/

## 重要文件索引
- 架构设计文档: `docs/system_design.md`（包含完整 API 路由表、ER 图、序列图）
- 后端入口: `backend/src/index.ts`
- 测试脚本: `backend/test/api-test.ts`（TypeScript）、`backend/test/qa-test.sh`（Shell，28 个测试点）
- 后端 Package: `backend/package.json`
- 前端 Package: `frontend/package.json`
- 数据库 Schema: `backend/prisma/schema.prisma`
- 种子数据: `backend/prisma/seed.ts`

## 不知道时去哪查
1. 先看 `.cursorrules` — 确认有没有对应的硬约束
2. 再看 `docs/system_design.md` — 设计决策和完整 API 表
3. 看同类文件的实现模式（如其他 Controller/Service 怎么写）
4. 还不确定就问
