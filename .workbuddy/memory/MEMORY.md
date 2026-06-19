# 王者荣耀竞猜平台 · 项目配置

## 数据库
- 开发环境：SQLite (`backend/prisma/dev.db`)
- 生产环境：MySQL (`backend/.env.example`)
- 切换方式：改 `backend/prisma/schema.prisma` 的 provider + `.env` 的 DATABASE_URL

## 管理员账号
- 用户名：admin
- 密码：admin123

## 测试用户
- player1 / 123456
- player2 / 123456  
- player3 / 123456

## 关键文件
- 架构设计：`docs/system_design.md`
- UI 原型：`prototype/overview.html` + `prototype/admin-panel.html`
- API 测试：`backend/test/api-test.ts`
- 环境变量：`backend/.env`

## 用户确认的业务规则
- 新用户初始 100 币，签到 +10/天
- 赔率范围 1.1 ~ 5.0，动态公式
- 无平局，弃赛全额退款
- 仅有胜负投注（无比分投注）
- 淘汰赛对阵：小组赛后根据排名自动生成（A1vsB2, B1vsA2）
- 战队 Logo：文件上传
- JWT 7 天过期
- 两个角色：ADMIN / BETTOR
