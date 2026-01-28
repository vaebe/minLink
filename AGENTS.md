# MinLink 项目上下文

## 项目概述

MinLink 是一个现代化的短链服务，基于 Next.js 16、Supabase 和 TypeScript 构建。项目提供短链生成、访问统计、用户认证等功能，采用 App Router 架构模式。

### 核心技术栈

- **前端框架**: Next.js 16.1.4 (App Router)
- **语言**: TypeScript 5.9
- **数据库/后端**: Supabase 2.93 (PostgreSQL + Auth + Storage)
- **样式**: Tailwind CSS 4.1
- **UI 组件**: shadcn/ui (Radix UI + Tailwind)
- **图表**: Recharts 3.7
- **验证**: Zod 4.3
- **包管理器**: pnpm

### 主要功能

- 短链生成（6位 nanoid，支持公开/私密）
- 访问统计（时间趋势、地理位置、设备浏览器来源）
- GitHub OAuth 登录
- 用户仪表盘
- 公开链接探索页
- 链接详情与访问数据可视化

## 构建与运行

### 环境要求

- Node.js >= 20
- pnpm >= 8

### 核心命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build

# 生产运行
pnpm start

# 代码检查
pnpm lint

# 代码检查并自动修复
pnpm lint:fix
```

### 环境配置

项目需要 `.env.local` 文件，包含以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

参考模板文件：`example.env`

### 数据库初始化

在 Supabase Dashboard → SQL Editor 执行 `supabase/schema.sql` 初始化数据库表、RLS 策略和索引。

## 项目结构

```
min-link/
├── app/                          # Next.js App Router
│   ├── actions.ts               # Server Actions (createLink, updateLink, deleteLink)
│   ├── layout.tsx               # 根布局 (字体、Header、Toaster)
│   ├── page.tsx                 # 首页
│   ├── [shortCode]/             # 短链跳转路由
│   │   └── route.ts
│   ├── dashboard/               # 用户仪表盘
│   ├── explore/                 # 公开链接探索
│   ├── links/                   # 链接详情 & 访问统计
│   │   └── [id]/
│   ├── analytics/               # 分析页面
│   └── auth/                    # 认证相关
├── components/                  # React 组件
│   ├── ui/                      # shadcn/ui 基础组件
│   ├── auth-buttons.tsx         # 认证按钮
│   ├── create-link-dialog.tsx   # 创建链接弹窗
│   ├── dashboard-client.tsx     # 仪表盘客户端组件
│   ├── hero-form.tsx            # 首页表单
│   ├── home-hero.tsx            # 首页 Hero
│   ├── link-card.tsx            # 链接卡片
│   ├── link-details-header.tsx  # 链接详情头部
│   ├── link-grid.tsx            # 链接网格
│   ├── site-header.tsx          # 站点头部
│   ├── site-header-wrapper.tsx  # 站点头部包装器
│   ├── visits-chart.tsx         # 访问图表
│   └── visits-chart-section.tsx # 访问图表区块
├── lib/                         # 工具函数
│   ├── utils.ts                 # cn 等通用工具
│   └── analytics/               # 分析相关工具
├── supabase/                    # Supabase 配置
│   ├── README.md                # 数据库使用说明
│   └── schema.sql               # 数据库 Schema
├── utils/                       # 实用工具
│   └── supabase/                # Supabase 客户端
│       ├── client.ts            # 客户端客户端
│       └── server.ts            # 服务端客户端
└── public/                      # 静态资源
```

## 开发规范

### 代码风格

- **TypeScript**: 启用 strict 模式
- **Linting**: 使用 ESLint + Next.js 配置，提交前自动执行 `lint-staged`
- **Git Hooks**: 使用 `simple-git-hooks`，pre-commit 运行 lint-staged，commit-msg 运行 commitlint
- **组件**: 使用 React Server Components 和 Client Components 混合模式
- **样式**: 使用 Tailwind CSS，遵循 shadcn/ui 设计规范
- **字体**: Outfit (heading) + Work Sans (body)

### 提交规范

遵循 Conventional Commits：

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档
- `style:` 格式
- `refactor:` 重构
- `perf:` 性能
- `test:` 测试
- `chore:` 构建/工具

### 安全实践

- 使用 Supabase Row Level Security (RLS) 隔离用户数据
- 使用 Zod 进行输入验证
- Server Actions 中进行权限校验
- Next.js 配置安全响应头（X-Frame-Options, X-Content-Type-Options 等）

### 路径别名

```typescript
@/*        # 项目根目录
@/components/*  # components 目录
@/lib/*     # lib 目录
@/utils/*   # utils 目录
```

## 关键实现细节

### Server Actions

- 位置: `app/actions.ts`
- 使用 `'use server'` 指令
- 包含创建、更新、删除链接的操作
- 使用 Zod 验证输入数据
- 使用 `revalidatePath` 刷新缓存
- 短码生成使用 nanoid(6)，带重试机制处理冲突

### 认证

- 使用 Supabase Auth + GitHub OAuth
- 服务端使用 `createClient()` 获取用户信息
- 客户端使用 `createBrowserClient()` 进行交互
- 认证回调: `/auth/callback`

### 数据库 Schema

核心表:
- `links`: 短链主表，包含 original_url, short_code, user_id, is_public, visits_count 等
- `visits`: 访问明细表，记录 IP、设备、浏览器、地理位置等

RLS 策略:
- 用户只能访问自己的数据
- 公开链接可被所有人读取
- 访问明细仅链接 owner 可读取

### 数据分析

提供多个 PostgreSQL 函数用于数据分析:
- `analytics_time()`: 时间趋势分析
- `analytics_region()`: 地理分布分析
- `analytics_device()`: 设备/浏览器/OS 分析
- `analytics_referrer()`: 来源分析

## 注意事项

1. **不要提交 `.env.local`** - 敏感信息不应进入版本控制
2. **数据库迁移** - 修改 Schema 后需要在 Supabase 中手动执行 SQL
3. **类型安全** - 推荐使用 Supabase CLI 生成数据库类型（见 supabase/README.md）
4. **权限控制** - 所有数据库操作都应通过 RLS 策略保护
5. **短码冲突** - Server Actions 中已实现重试机制处理 nanoid 冲突
6. **安全响应头** - next.config.ts 已配置常见安全头

## 依赖说明

### 核心依赖

- `next`: 16.1.4 - React 框架
- `react`: 19.2.3 - UI 库
- `@supabase/supabase-js`: 2.93.2 - Supabase 客户端
- `@supabase/ssr`: 0.8.0 - Supabase SSR 支持
- `zod`: 4.3.6 - 数据验证
- `recharts`: 3.7.0 - 图表库
- `nanoid`: 5.1.6 - 短码生成

### UI 依赖

- `@radix-ui/*`: 无样式 UI 组件库
- `lucide-react`: 图标库
- `framer-motion`: 动画库
- `sonner`: Toast 通知
- `class-variance-authority`, `clsx`, `tailwind-merge`: 样式工具

### 开发依赖

- `typescript`: 5.9.3
- `eslint`: 9.39.2
- `tailwindcss`: 4.1.18
- `@commitlint/*`: 提交信息检查
- `simple-git-hooks`: Git hooks 管理
- `lint-staged`: 暂存文件检查