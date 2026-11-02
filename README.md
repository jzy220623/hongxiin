# 智赛宏芯社网站

智赛宏芯社官方网站与管理后台系统。面向访客/社团成员提供新闻、活动、获奖、荣誉墙、入社报名、留言等浏览与提交功能；面向管理员提供内容管理、报名审批、成员导入导出、账号管理等后台能力。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 18 + TypeScript + Vite + React Router 6 + Zustand + TailwindCSS + Framer Motion + lucide-react + axios |
| 后端 | Node.js + Express 4（CommonJS） |
| 数据库 | SQLite（通过 `sql.js` 纯 JS 实现，内存运行 + 定时落盘到 `server/data.db`） |
| 认证 | JWT + bcryptjs |
| 文件上传 | Multer（内存存储，头像转 base64 入库） |
| Excel 处理 | xlsx（成员名单导入/导出） |

## 目录结构

```
智赛宏芯社网站/
├── package.json              # 根脚本：并发启动前后端
├── client/                   # 前端 (Vite + React)
│   ├── src/
│   │   ├── App.tsx           # 路由表
│   │   ├── api/index.ts      # axios 实例与所有 API 封装
│   │   ├── store/            # Zustand：authStore(admin) / userStore / themeStore
│   │   ├── components/       # layout / common / ui 组件
│   │   ├── pages/            # 公共页面 + admin/ 后台页面
│   │   ├── hooks / utils
│   └── vite.config.ts        # 5173 端口，代理 /api、/uploads 到 3001
└── server/                   # 后端 (Express)
    ├── index.js              # 入口，路由挂载 + 权限中间件
    ├── db.js                 # sql.js 封装（仿 better-sqlite3 API）+ 建表
    ├── seed.js               # 种子数据（首次启动自动执行）
    ├── data.db               # SQLite 数据文件（运行后生成，已 gitignore）
    ├── middleware/           # auth / adminAuth / upload
    └── routes/               # auth / admin / news / events / achievements /
                               # members / registrations / messages / honorWall
```

## 快速开始

### 环境要求

- Node.js ≥ 16
- npm

### 安装与启动（开发模式）

```bash
npm run setup    # 一次性安装根 / client / server 三处依赖
npm run dev      # 并发启动：后端 3001 + 前端 5173
```

启动后：

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001/api
- 前端通过 Vite 代理把 `/api`、`/uploads` 转发到后端，无需额外配置

### 生产模式

```bash
npm run build    # 构建前端到 client/dist
npm start        # 启动后端，并托管 client/dist 静态资源
```

### 种子数据

首次启动后端时，若 `admins` 表为空会自动执行 `seed.js`。如需手动重跑：

```bash
npm run seed
```

## 功能模块

### 公共站点

- 首页 / 关于
- 新闻列表与详情
- 活动列表与详情
- 获奖成果展示
- 荣誉墙（按届别展示优秀成员）
- 加入社团报名
- 留言板
- 用户注册 / 登录 / 找回密码 / 个人资料

### 管理后台（`/admin`）

- 仪表盘：统计新闻、活动、待处理报名、留言、成员、用户数
- 新闻 / 活动 / 获奖 CRUD（含批量删除）
- 报名管理：审批、批量改状态、筛选、导出
- 成员管理：Excel 导入导出、创建登录账号、核心成员维护
- 社团信息与时间线维护
- 留言回复与删除
- 荣誉墙 CRUD、Excel 导入、批量排序
- 网站用户管理

## 认证机制

采用双 token 体系，分别存于 `localStorage`：

- `admin_token`：管理员身份，由 `POST /api/admin/login` 颁发，type 为 `admin`，有效期 24h
- `user_token`：普通用户身份，由 `POST /api/auth/login` 颁发，type 为 `user`，有效期 7d

`adminAuth` 中间件会拒绝 `type === 'user'` 的 token，保证管理后台仅管理员可写。前端 axios 拦截器按请求 URL 前缀自动携带对应 token。

## API 概览

| 模块 | 路径前缀 | 说明 |
| --- | --- | --- |
| 用户认证 | `/api/auth` | 注册/登录/资料/密码/头像/找回密码 |
| 管理员 | `/api/admin` | 登录/仪表盘/成员导入导出/用户管理/社团成员管理 |
| 新闻 | `/api/news` | GET 公开，写操作需 admin |
| 活动 | `/api/events` | GET 公开，写操作需 admin |
| 获奖 | `/api/achievements` | GET 公开，写操作需 admin |
| 成员/社团信息 | `/api/members` | 核心成员、时间线、社团信息 |
| 报名 | `/api/registrations` | 活动报名、入社申请、签到、批量审批 |
| 留言 | `/api/messages` | 留言板，回复/删除需 admin |
| 荣誉墙 | `/api/honor-wall` | 展示与后台管理 |

访问 `GET /api` 可获取接口列表。所有列表类接口支持分页与筛选，详情见 `server/routes/` 下各路由文件。

## 注意事项

- `server/data.db`、`server/uploads/`、`智赛宏芯社成员名单.xlsx` 等含真实个人信息的文件已在 `.gitignore` 中排除，clone 后需通过 `npm run seed` 或管理员后台重新生成/导入数据。
- `JWT_SECRET` 当前为硬编码常量（`'zhisai-hongxin-secret-key'`），部署到生产环境前建议改为环境变量。
- 管理员为成员创建账号时，默认密码为学号或 `123456`，首次登录后请及时修改。
