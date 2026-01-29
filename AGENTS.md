# MinLink 项目上下文

## 项目概述

MinLink 是一个现代化的短链服务，基于 Next.js 16、Supabase 和 TypeScript 构建。提供短链生成、访问统计、用户认证等功能，采用 App Router 架构模式。

### 核心技术栈

- **前端框架**: Next.js 16.1.4 (App Router)
- **语言**: TypeScript 5.9.3
- **数据库/后端**: Supabase 2.93 (PostgreSQL + Auth)
- **样式**: Tailwind CSS 4.1.18
- **UI 组件**: shadcn/ui (New York 风格)
- **图表**: Recharts 3.7.0
- **验证**: Zod 4.3.6
- **包管理器**: pnpm

### 主要功能

- 短链生成（6位 nanoid，支持公开/私密，支持过期时间）
- 访问统计（时间趋势、地理位置、设备浏览器来源分析）
- GitHub OAuth 登录
- 用户仪表盘
- 公开链接探索页
- 统计中心（独立页面，支持多维度数据分析）

## 构建与运行

### 环境要求

- Node.js >= 20
- pnpm >= 8

### 核心命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式
pnpm build            # 生产构建
pnpm start            # 生产运行
pnpm lint             # 代码检查
pnpm lint:fix         # 代码检查并自动修复
```

### 环境配置

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

参考模板文件：`example.env`

### 数据库初始化

在 Supabase Dashboard → SQL Editor 执行 `supabase/schema.sql` 初始化数据库表、RLS 策略和分析函数。

## 项目结构

```
min-link/
├── app/                          # Next.js App Router
│   ├── actions.ts               # Server Actions
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页
│   ├── globals.css              # 全局样式
│   ├── [shortCode]/             # 短链跳转
│   ├── dashboard/               # 用户仪表盘
│   ├── explore/                 # 公开链接探索
│   ├── links/                   # 链接详情
│   ├── analytics/               # 统计中心
│   │   └── _components/         # 分析组件
│   └── auth/                    # 认证
├── components/                  # React 组件
│   ├── ui/                      # shadcn/ui 基础组件
│   └── [其他组件]
├── lib/                         # 工具函数
│   └── analytics/               # 分析工具
├── supabase/                    # Supabase 配置
│   └── schema.sql               # 数据库 Schema
├── utils/                       # 实用工具
│   └── supabase/                # Supabase 客户端
└── public/                      # 静态资源
```

## 开发规范

### 代码风格

- **TypeScript**: strict 模式
- **Linting**: ESLint 9 + Next.js 配置，提交前自动执行 lint-staged
- **Git Hooks**: simple-git-hooks (pre-commit: lint-staged, commit-msg: commitlint)
- **组件**: Server Components 和 Client Components 混合模式
- **样式**: Tailwind CSS 4.1.18，shadcn/ui New York 风格，支持深色模式
- **字体**: Outfit (heading) + Work Sans (body)

### 提交规范

遵循 Conventional Commits：`feat:` `fix:` `docs:` `style:` `refactor:` `perf:` `test:` `chore:`

### 路径别名

```typescript
@/*            # 项目根目录
@/components/* # components 目录
@/lib/*        # lib 目录
@/utils/*      # utils 目录
@/app/*        # app 目录
```

## 关键实现细节

### Server Actions

位置: `app/actions.ts`

- `createLink`: 创建短链（支持 URL、描述、公开状态、过期时间）
- `updateLink`: 更新短链信息
- `deleteLink`: 删除短链
- `updateLinkState`: 更新短链公开状态

使用 Zod 验证输入，nanoid(6) 生成短码（带重试机制），所有操作需要用户认证。

### 认证

- Supabase Auth + GitHub OAuth
- 服务端: `createClient()` (utils/supabase/server.ts)
- 客户端: `createBrowserClient()` (utils/supabase/client.ts)
- 回调: `/auth/callback`

### 数据库 Schema

核心表:
- `links`: 短链主表
- `visits`: 访问明细表

RLS 策略: 用户只能访问自己的数据，公开链接可被所有人读取，访问明细仅链接 owner 可读取。

### 数据分析函数

定义于 `supabase/schema.sql`:

- `analytics_time()`: 时间趋势分析
- `analytics_region()`: 地理分布分析（国家/省份/城市）
- `analytics_device()`: 设备/浏览器/OS 分析
- `analytics_referrer()`: 来源分析

工具函数: `lib/analytics/utils.ts` (日期处理、URL 构建)

### 页面路由

| 路由 | 功能 |
|------|------|
| `/` | 首页 |
| `/dashboard` | 用户仪表盘 |
| `/explore` | 公开链接探索 |
| `/analytics` | 统计中心 |
| `/links/[id]` | 链接详情 |
| `/links/[id]/visits` | 访问明细 |
| `/[shortCode]` | 短链跳转 |
| `/auth/callback` | GitHub OAuth 回调 |

## 注意事项

1. 不要提交 `.env.local`
2. 首次运行需执行 `supabase/schema.sql` 初始化数据库
3. 统计中心需要 analytics_* 函数才能正常工作
4. 使用 Supabase RLS 策略保护数据
5. 短码冲突处理：Server Actions 中已实现重试机制
6. next.config.ts 已配置安全响应头
7. Tailwind CSS 4.1 配置内联于 `app/globals.css`