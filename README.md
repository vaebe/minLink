# MinLink

<div align="center">

一个现代化、高性能的短链服务，专为创作者和企业打造。

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-2.91.0-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38BDF8?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## ✨ 特性

- 🚀 **极速生成** - 平均生成时间 < 50ms，输入链接，回车即得
- 📊 **轻量级洞察** - 访问趋势、地理位置分布、来源分析，一目了然
- 🔒 **企业级安全** - 基于 Supabase 架构，Row Level Security 确保数据隔离与安全
- 🌍 **全球加速** - 利用 Edge Network，无论用户身在何处，访问速度都快如闪电
- 🔐 **用户认证** - 完整的登录/注册流程，支持多种认证方式
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **精美 UI** - 基于 shadcn/ui 组件库，提供现代化的视觉体验
- 📈 **数据可视化** - 使用 Recharts 提供直观的访问数据图表

## 📦 安装

### 前置要求

- Node.js >= 20
- pnpm >= 8

### 克隆仓库

```bash
git clone git@github.com:vaebe/minLink.git
cd min-link
```

### 安装依赖

```bash
pnpm install
```

### 环境配置

1. 复制环境变量模板：

```bash
cp example.env .env.local
```

2. 在 [Supabase](https://supabase.com) 创建项目，获取以下信息：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`（填 Supabase 项目的 anon/public key）

3. 在 `.env.local` 文件中填入你的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

### 数据库设置

初始化数据库：

```bash
# 在 Supabase Dashboard 的 SQL Editor 中执行 supabase/schema.sql
```

更多细节参考：[supabase/README.md](file:///Users/vaebe/zcjdata/codetest/min-link/supabase/README.md)

## 🚀 运行

### 开发模式

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 生产构建

```bash
pnpm build
pnpm start
```

## 📁 项目结构

```
min-link/
├── app/                    # Next.js App Router 页面
│   ├── actions.ts         # Server Actions
│   ├── dashboard/         # 仪表盘页面
│   ├── explore/           # 探索页面
│   ├── links/             # 链接详情页面
│   └── [shortCode]/       # 短链重定向路由
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   └── ...               # 业务组件
├── lib/                   # 工具函数
├── supabase/             # Supabase 配置和 Schema
├── utils/                # 实用工具
│   └── supabase/         # Supabase 客户端
└── public/               # 静态资源
```

## 🔒 安全

- **Row Level Security (RLS)** - 所有数据库表都启用了 RLS，确保用户只能访问自己的数据
- **输入验证** - 使用 Zod 进行严格的数据验证
- **SQL 注入防护** - 使用 Supabase 客户端，自动防止 SQL 注入
- **XSS 防护** - React 默认的 XSS 防护机制

## 📝 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` - 新功能
- `fix:` - 修复 bug
- `docs:` - 文档更新
- `style:` - 代码格式（不影响功能）
- `refactor:` - 重构
- `perf:` - 性能优化
- `test:` - 测试
- `chore:` - 构建过程或辅助工具的变动

示例：

```bash
git commit -m "feat: 添加短链过期时间功能"
git commit -m "fix: 修复仪表盘数据刷新问题"
```

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org) - React 框架
- [Supabase](https://supabase.com) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com) - 样式框架

## 📮 联系方式

- GitHub: [@vaebe](https://github.com/vaebe)
- 项目链接: [https://github.com/vaebe/minLink](https://github.com/vaebe/minLink)

---

<div align="center">

**Made with ❤️ by MinLink Team**

</div>
