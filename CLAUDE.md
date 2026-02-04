# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概览

MinLink 是一个现代化的短链服务，基于 Next.js 16 (App Router)、Supabase (PostgreSQL + Auth) 和 TypeScript 构建。提供短链生成、访问统计、GitHub OAuth 认证和用户仪表盘等功能。

## 常用命令

```bash
# 开发
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 (http://localhost:3000)
pnpm build            # 生产构建
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # 运行 ESLint
pnpm lint:fix         # 自动修复 ESLint 问题
```

## 环境配置

1. 复制 `example.env` 为 `.env.local`
2. 添加 Supabase 凭据：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
3. 在 Supabase Dashboard → SQL Editor 中执行 `supabase/schema.sql` 初始化数据库

## 架构概览

### 技术栈

- **框架**: Next.js 16.1.4 with App Router (服务端组件 + 客户端组件)
- **语言**: TypeScript 5.9 (strict 模式)
- **数据库**: Supabase (PostgreSQL with Row Level Security)
- **认证**: Supabase Auth with GitHub OAuth
- **样式**: Tailwind CSS 4.1.18 + shadcn/ui (New York 风格)
- **验证**: Zod 4.3.6
- **图表**: Recharts 3.7.0
- **包管理器**: pnpm

### 目录结构

```
app/
├── actions.ts              # Server Actions (createLink, updateLink, deleteLink 等)
├── [shortCode]/            # 短链跳转的动态路由
├── dashboard/              # 用户仪表盘，包含链接管理
├── explore/                # 公开链接探索页
├── analytics/              # 统计中心，包含图表
│   └── _components/        # 统计相关组件
├── links/[id]/             # 链接详情页
│   └── visits/             # 访问记录页
└── auth/callback/          # GitHub OAuth 回调

components/
├── ui/                     # shadcn/ui 基础组件
├── create-link-dialog.tsx  # 创建链接弹窗
├── link-card.tsx           # 链接展示卡片（带操作按钮）
├── site-header.tsx         # 应用头部（带认证）
└── [其他组件]

lib/
└── analytics/              # 统计工具函数和类型

utils/
└── supabase/
    ├── client.ts           # 浏览器端客户端
    └── server.ts           # 服务端客户端
```

### 关键架构模式

**Server Actions (app/actions.ts)**

- 所有数据变更都通过带 `'use server'` 指令的 Server Actions 进行
- 认证检查：所有操作都需要 `supabase.auth.getUser()` 验证用户身份
- 输入验证：使用 Zod schema 验证所有输入
- 短码生成：使用 `nanoid(6)` 生成，带重试机制（最多 3 次）处理冲突

**认证流程**

- 通过 Supabase Auth 实现 GitHub OAuth
- 服务端：使用 `utils/supabase/server.ts` 的 `createClient()`
- 客户端：使用 `utils/supabase/client.ts` 的 `createBrowserClient()`
- 回调：`/auth/callback` 处理 OAuth 重定向

**数据库 Schema (supabase/schema.sql)**

- `links` 表：存储短链，包含用户所有权
- `visits` 表：存储详细访问统计（user_agent、ip、country、region、city、referrer、device、browser、OS）
- RLS 策略：用户只能访问自己的私有链接；公开链接所有人可读；访问记录仅链接所有者可访问
- 统计 RPC 函数：`analytics_time()`、`analytics_region()`、`analytics_device()`、`analytics_referrer()`

**路径别名**

- `@/*` → 项目根目录（在 tsconfig.json 中配置）
- 示例：`@/utils/supabase/server` → `utils/supabase/server.ts`

**组件模式**

- 默认使用服务端组件（无需 'use client'）
- 客户端组件：仅在使用 hooks、事件处理器或浏览器 API 时添加 `'use client'`
- 字体：Outfit（标题）+ Work Sans（正文），定义在 `app/layout.tsx`

### 数据流

**创建链接**

1. 用户提交表单 → 调用 `createLink()` Server Action
2. 使用 Zod schema 验证
3. 用 `nanoid(6)` 生成 6 位短码
4. 插入到 `links` 表，冲突时重试（`short_code` 有唯一约束）
5. 重新验证仪表盘路径

**短链跳转**

1. 用户访问 `/{shortCode}`
2. 查询 `links` 表匹配记录
3. 检查过期时间和访问权限
4. 在 `visits` 表记录访问详情
5. 通过 RPC 函数增加 `visits_count`
6. 重定向到 `original_url`

**统计分析**

- 时间趋势：`analytics_time()` RPC 用于趋势分析
- 地理分布：`analytics_region()` RPC 用于国家/地区/城市分析
- 技术分析：`analytics_device()` 用于设备/浏览器/操作系统分析
- 流量来源：`analytics_referrer()` 用于来源分析
- 所有统计函数使用 link_id + 日期范围参数

### 安全考虑

- Supabase RLS 策略强制数据隔离
- 客户端仅暴露 `anon` 密钥（绝不使用 `service_role` 密钥）
- 在 `next.config.ts` 中配置安全响应头：X-Content-Type-Options、X-Frame-Options、Referrer-Policy、Permissions-Policy
- 访问跟踪允许匿名插入，但会验证链接存在性和公开状态
- 访问计数增加 RPC 有额外的授权检查

### 代码风格

- 遵循 Conventional Commits 规范：`feat:`、`fix:`、`docs:`、`style:`、`refactor:`、`perf:`、`test:`、`chore:`
- Git hooks：pre-commit 运行 lint-staged，commit-msg 使用 commitlint 验证
- 提交时强制执行 ESLint 9 + Next.js 配置

### 重要实现细节

1. **短码冲突处理**：`createLink()` 操作包含重试机制（最多 3 次）来处理潜在的 `short_code` 唯一性冲突
2. **访问跟踪**：匿名用户可以记录访问，但 RPC 函数会在服务端验证链接所有权和公开状态
3. **统计函数**：所有函数定义在 `supabase/schema.sql` 中，必须在数据库初始化时执行
4. **深色模式**：通过 `next-themes` 实现，支持系统偏好检测
5. **Tailwind CSS 4.1**：配置内联在 `app/globals.css` 中，使用 `@import "tailwindcss"`
