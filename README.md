# MinLink

<div align="center">

短链服务

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-2.93-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38BDF8?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## 特性

- 短链生成，支持公开/私密
- 访问统计：时间趋势、地理位置、设备浏览器来源
- GitHub OAuth 登录
- Row Level Security 隔离用户数据
- shadcn/ui 组件库

## 安装

### 前置要求

- Node.js >= 20
- pnpm >= 8

### 克隆

```bash
git clone git@github.com:vaebe/minLink.git
cd min-link
```

### 安装依赖

```bash
pnpm install
```

### 环境配置

```bash
cp example.env .env.local
```

在 [Supabase](https://supabase.com) 创建项目，获取：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

填入 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

### 数据库初始化

在 Supabase Dashboard → SQL Editor 执行 `supabase/schema.sql`。

详细说明：[supabase/README.md](supabase/README.md)

## 运行

### 开发

```bash
pnpm dev
```

访问 <http://localhost:3000>

### 构建

```bash
pnpm build
pnpm start
```

## 项目结构

```bash
min-link/
├── app/                    # Next.js App Router
│   ├── actions.ts         # Server Actions
│   ├── dashboard/         # 仪表盘
│   ├── explore/           # 公开链接探索
│   ├── links/             # 链接详情 & 访问统计
│   └── [shortCode]/       # 短链跳转
├── components/            # 组件
│   └── ui/               # shadcn/ui
├── lib/                   # 工具
├── supabase/             # Schema 文档
└── utils/                # Supabase 客户端
```

## 安全

- RLS 策略隔离用户数据
- Zod 输入验证
- 访问计数 RPC 额外校验权限

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档
- `style:` 格式
- `refactor:` 重构
- `perf:` 性能
- `test:` 测试
- `chore:` 构建/工具

## 贡献

1. Fork
2. 创建分支 `git checkout -b feature/xxx`
3. 提交 `git commit -m 'feat: xxx'`
4. 推送 `git push origin feature/xxx`
5. Pull Request

## 许可证

MIT - [LICENSE](LICENSE)

## 致谢

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

<div align="center">

MinLink

</div>
