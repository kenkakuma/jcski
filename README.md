# Nuxt 3 Personal Blog

一个基于 Nuxt 3 构建的个人博客系统，支持文章管理、图片和音频上传。

## 技术栈

- **前端**: Nuxt 3 + TypeScript + Vue 3
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT
- **文件上传**: Multer
- **部署**: GitHub Actions + EC2

## 功能特性

- ✅ 文章发布和管理
- ✅ 图片和音频文件上传
- ✅ 管理员后台界面
- ✅ 响应式设计
- ✅ SEO 优化
- ✅ 自动部署

## 开发环境设置

1. 克隆项目并安装依赖：
```bash
npm install
```

2. 设置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件配置必要参数
```

3. 初始化数据库：
```bash
npx prisma generate
npx prisma db push
```

4. 启动开发服务器：
```bash
npm run dev
```

## 项目结构

```
nuxt-blog/
├── assets/          # 静态资源
├── components/      # Vue 组件
├── layouts/         # 布局文件
├── pages/          # 页面文件
├── server/         # 服务端 API
├── prisma/         # 数据库模式
├── public/         # 公共文件
├── types/          # TypeScript 类型
└── utils/          # 工具函数
```

## 部署说明

项目配置了 GitHub Actions 自动部署到 EC2，推送到 main 分支即可自动部署。