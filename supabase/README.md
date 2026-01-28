# Supabase 使用说明

## 1. 创建 Supabase 项目

在 Supabase 新建项目后，至少需要：
- Project URL（用于 `NEXT_PUBLIC_SUPABASE_URL`）
- anon/public key（用于 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`）

将 [example.env](file:///Users/vaebe/zcjdata/codetest/min-link/example.env) 复制为 `.env.local` 并填入：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

## 2. 初始化数据库（建表 + RLS + 索引 + RPC）

在 Supabase Dashboard → SQL Editor 执行：
- [schema.sql](file:///Users/vaebe/zcjdata/codetest/min-link/supabase/schema.sql)

该脚本会创建：
- `public.links`：短链主表
- `public.visits`：访问明细表（用于图表/地理分布）
- `public.increment_visits(uuid)`：访问计数自增 RPC

并启用 RLS：默认隔离用户数据，公开链接可被所有人读取，访问明细仅链接 owner 可读取。

## 3. 认证与回调地址

项目使用 GitHub OAuth 登录（可在 Supabase Auth 中启用/配置）。

开发环境回调（默认）：
- `http://localhost:3000/auth/callback`

生产环境回调：
- `https://<你的域名>/auth/callback`

需要在 Supabase Dashboard：
- Authentication → URL Configuration 中配置 Site URL
- Authentication → Providers → GitHub 中配置 callback URL

## 4. 权限与安全建议

- 客户端仅使用 anon/public key；不要把 service_role key 放入浏览器环境变量。
- `visits` 写入目前允许匿名插入，但会校验 link 存在且必须是公开链接或 owner 链接。
- 访问计数 `increment_visits` 额外校验了公开或 owner，避免对私有链接的无授权刷量。

如果你希望进一步防滥用，建议将“写 visits + 自增 visits_count”移动到服务端（例如 Next route handler 或 Supabase Edge Function）并加限流。

## 5. 类型生成（推荐）

推荐使用 Supabase CLI 生成数据库类型，避免字段拼写/nullable 导致的线上问题：
- 生成 `database.types.ts`
- 在 `createBrowserClient/createServerClient` 上挂载类型

## 6. 访问数据与隐私

`visits.ip` 使用 `inet` 类型，更适合做网段分析。若有合规需求，可考虑：
- 不存 IP 或只存截断网段
- 增加访问日志保留周期（定期清理 N 天前数据）
