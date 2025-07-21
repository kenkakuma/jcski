# JCSKI Personal Blog 项目记忆文件

## 📋 项目概览

### 🎯 基本信息
- **项目名称**: JCSKI Personal Blog
- **当前版本**: v0.4.8 (2025-07-21)
- **技术栈**: Nuxt 3 + TypeScript + SQLite + Prisma
- **开发服务器**: http://localhost:3003
- **生产网站**: http://jcski.com ✅ 完全正常 (2025-07-20验证)
- **项目路径**: /Users/eric/WebstormProjects/jcski
- **GitHub仓库**: https://github.com/kenkakuma/jcski.git
- **创建时间**: 2025-07-13

### 🌟 项目特色
- **设计风格**: JCSKI原创设计风格
- **架构模式**: 现代化SPA单页应用 + SSR服务端渲染
- **响应式设计**: 完美适配桌面端和移动端
- **个人博客定位**: 4大专业领域 + 个人展示

---

## 🏗️ 技术架构

### 💻 前端技术栈
```bash
Framework: Nuxt 3.17.6
Language: TypeScript
UI Framework: 自定义CSS + JCSKI原创设计
Build Tool: Vite
```

### 🗄️ 后端技术栈
```bash
Database: SQLite (开发) / PostgreSQL (生产)
ORM: Prisma
Authentication: JWT + bcryptjs
File Upload: Multer
```

### 📦 核心依赖
```json
{
  "nuxt": "^3.12.3",
  "@nuxt/content": "^2.13.1", 
  "@prisma/client": "^6.11.1",
  "prisma": "^6.11.1",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "formidable": "^3.5.4",
  "@types/formidable": "^3.4.5"
}
```

---

## 📁 项目结构

```
jcski/
├── 📄 配置文件
│   ├── package.json           # 项目配置
│   ├── nuxt.config.ts         # Nuxt配置 (端口3003)
│   ├── tsconfig.json          # TypeScript配置
│   └── .env                   # 环境变量
│
├── 🎨 前端页面
│   ├── pages/
│   │   ├── index.vue          # 主页 (Hero框架 + 内容板块)
│   │   ├── music.vue          # 音乐页面 (紫色主题)
│   │   ├── skiing.vue         # 滑雪页面 (蓝色主题)
│   │   ├── tech.vue           # 科技页面 (深蓝主题)
│   │   ├── fishing.vue        # 钓鱼页面 (绿色主题)
│   │   └── about.vue          # 关于页面 (个人介绍)
│   │
│   ├── components/            # Vue组件库
│   ├── layouts/               # 布局模板
│   └── assets/css/main.css    # 全局样式
│
├── 🔧 后端服务
│   ├── server/api/            # API接口
│   │   ├── admin/posts/       # 文章管理API
│   │   ├── admin/media/       # 媒体管理API (新增)
│   │   └── auth/              # 身份验证API
│   ├── middleware/            # 中间件
│   ├── utils/                 # 工具函数
│   └── lib/                   # 核心库
│
└── 🗃️ 数据层
    ├── prisma/schema.prisma   # 数据库模式
    └── types/index.ts         # TypeScript类型定义
```

---

## 🎨 页面架构 (v0.1.3)

### 🏠 主页结构图
```
📄 index.vue (http://localhost:3003/)
├── A. 顶部导航栏 (.top-nav)
│   └── MUSIC | SKIING | TECH | FISHING | ABOUT
├── B. Hero框架区域 (.hero-frame) [4:6比例]
│   ├── B1. 左侧导航 (.hero-left) [40%]
│   │   ├── JCSKI大标题 + PERSONAL BLOG副标题
│   │   ├── 5个垂直菜单项
│   │   └── 搜索框
│   └── B2. 右侧展示 (.hero-right) [60%]
│       ├── 天空背景 + 太阳云朵
│       ├── 中心内容区
│       ├── INFO标签
│       └── 底部信息栏
├── C. 新闻板块 (.news-section)
│   └── 2:1:1三列网格布局
├── D. 主题板块 (.topics-section)
│   └── 4个彩色主题卡片
├── E. 新闻发布板块 (.press-section)
│   └── "+"标记列表设计
└── F. 底部信息栏 (.main-footer)
    └── 黑色背景 + 三列链接
```

### 📑 子页面系统
| 页面 | 路径 | 主题色 | 核心内容 |
|------|------|---------|----------|
| 🎵 音乐 | /music | 紫色渐变 | 音乐制作、设备推荐、作品分享 |
| 🎿 滑雪 | /skiing | 蓝色渐变 | 滑雪技巧、装备测评、雪场攻略 |
| 💻 科技 | /tech | 深蓝渐变 | 前端开发、AI技术、云计算 |
| 🎣 钓鱼 | /fishing | 绿色渐变 | 钓鱼技巧、装备评测、钓点分享 |
| 👤 关于 | /about | 渐变头像 | 个人介绍、联系方式、博客信息 |

---

## 🔧 核心功能

### ✅ 已实现功能
- **响应式导航系统**: 顶部导航 + 当前页面高亮
- **Hero框架布局**: 4:6比例左右分割设计  
- **多页面架构**: 5个专业领域页面
- **统一设计语言**: JCSKI原创风格 + 个性化主题色
- **SEO优化**: 每页面独立标题和描述
- **移动端适配**: 完美响应式设计
- **内容管理系统**: 完整的文章CRUD操作
- **用户认证系统**: JWT登录 + 权限管理
- **媒体管理**: 图片和音频文件上传/管理
- **管理后台**: 完整的后台管理界面
- **数据库集成**: Prisma + SQLite 数据持久化
- **JCSKI风格导航**: 双语显示，简洁现代风格
- **紧凑布局设计**: 极度优化的间距和字体层次
- **Hero内容管理**: 完整的Hero内容数据库模型和API
- **动态交互功能**: 鼠标悬停切换Hero内容显示
- **后台Hero管理**: 可视化Hero内容编辑和状态管理
- **柔和渐入效果**: 右侧内容区域平滑过渡动画
- **激活状态优化**: 统一悬停和激活状态的反色效果
- **后台稳定性**: 修复TypeScript语法错误，确保后台正常访问
- **分类标签系统**: PRESS RELEASE文章分类标签，8种分类彩色显示
- **置顶文章功能**: JCSKI NEWS专门显示置顶文章，PRESS RELEASE显示全部文章
- **特色图片系统**: 首页动态图片展示，支持文章特色图片和分类默认图片
- **图片预览功能**: 管理后台实时图片预览，支持封面图片和特色图片
- **管理后台编辑**: 完整的文章编辑功能，包括置顶开关和数据兼容性处理
- **文章发布系统**: 完整的文章创建、编辑、发布功能，支持自动生成excerpt和slug
- **服务器端API优化**: 智能字段验证和自动生成，降低文章发布门槛
- **图片上传管理系统**: 完整的媒体文件上传、管理、选择功能
- **拖拽上传功能**: 支持拖拽文件到上传区域，提升用户体验
- **ImagePicker组件**: 可复用的图片选择器，集成上传和媒体库功能
- **文章详情页系统**: 完整的文章详情页面，支持动态路由和JCSKI风格设计
- **文章链接功能**: 首页文章卡片支持点击跳转到详情页

### 🔄 规划功能
- **搜索功能**: 全站内容搜索
- **评论系统**: 文章评论和互动
- **前端文章展示**: 动态文章页面渲染
- **SEO优化**: 动态meta标签生成
- **多媒体支持**: 更丰富的媒体文件类型

---

## 🚀 部署配置

### 🔧 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址
http://localhost:3003/
```

### 📊 环境变量
```env
# 数据库配置
DATABASE_URL="file:./dev.db"

# JWT配置
JWT_SECRET="jcski-blog-super-secret-jwt-key-2025"

# 应用配置
BASE_URL="http://localhost:3003"

# 管理员配置
ADMIN_EMAIL="admin@jcski.com"
ADMIN_PASSWORD="admin123456"
```

---

## 📝 版本历史

### v0.4.8 (2025-07-21) - 文章详情页显示问题修复 ⭐ 当前版本
**🎯 主要更新**
- ✅ **文章详情页显示修复**: 彻底解决文章详情页"没有文字显示"的问题
- ✅ **Tags字段JSON解析**: 在Vue组件中添加智能JSON解析，处理数据库字符串格式
- ✅ **API数据格式化**: 优化服务器端tags字段处理，提供双重保障
- ✅ **用户体验完善**: 文章详情页内容正常显示，标签系统工作正常
- ✅ **前后端一致性**: 确保数据在传输和渲染过程中的完整性

**🔧 核心技术修复**
- **前端JSON解析**: 在`pages/posts/[slug].vue`中添加tags字段智能解析
  ```javascript
  if (typeof articleData.tags === 'string') {
    try {
      articleData.tags = JSON.parse(articleData.tags)
    } catch (e) {
      console.warn('Failed to parse tags JSON:', e)
      articleData.tags = []
    }
  }
  ```
- **API数据处理**: `server/api/posts/[slug].get.ts`增强错误处理和数据格式化
- **调试工具完善**: 添加详细的调试日志和错误捕获机制

**✅ 功能验证结果 (2025-07-21)**
- 开发服务器: http://localhost:3000/ ✅ 正常运行
- API接口: `/api/posts/[slug]` ✅ 正确响应，tags字段格式正确
- 文章详情页: `/posts/[slug]` ✅ 内容完整显示，文字正常渲染
- Tags系统: ✅ JSON字符串正确解析为数组，标签正常显示
- 用户体验: ✅ 加载状态、错误处理、导航功能完善

**🚀 问题解决过程**
1. **问题诊断**: 发现tags字段作为JSON字符串存储，Vue模板无法迭代字符串
2. **根本原因**: 数据库存储JSON字符串，但前端期望数组格式
3. **解决方案**: 在数据获取后添加JSON解析逻辑，将字符串转换为数组
4. **测试验证**: 确认文章内容正常显示，所有功能恢复正常

### v0.4.7 (2025-07-21) - 子页面设计统一化完成
**🎯 主要更新**
- ✅ **子页面设计统一**: 所有子页面(MUSIC/TECH/SKIING/FISHING/ABOUT)采用JCSKI标准设计
- ✅ **字体系统统一**: 全站使用"Special Gothic Expanded One" + "Noto Sans SC/JP"字体
- ✅ **导航系统标准化**: 双语导航设计，统一的反色悬停动画效果
- ✅ **内容结构完善**: 为所有子页面添加丰富的专业内容和示例文章
- ✅ **通用样式架构**: 创建`assets/css/subpage.css`统一子页面样式
- ✅ **响应式设计优化**: 1300px统一容器宽度，完美的移动端适配

**🎨 子页面特色内容**
- **MUSIC页面**: 音乐制作、DAW技巧、设备推荐、作品分享 (紫色主题)
- **TECH页面**: 前端开发、框架对比、性能优化、技术趋势 (蓝色主题)  
- **SKIING页面**: 滑雪技巧、装备指南、雪场攻略、安全知识 (青色主题)
- **FISHING页面**: 钓鱼技术、装备评测、钓点推荐、鱼类百科 (绿色主题)
- **ABOUT页面**: 个人简介、技能展示、职业时间线、联系方式 (灰色主题)

**🔧 技术架构优化**
- **样式文件统一**: 消除代码重复，创建可复用的CSS组件
- **主题色系统**: 每个页面有专属的渐变装饰线和特色颜色
- **组件化设计**: 标准化的卡片布局、悬停效果、文章列表
- **SEO优化**: 每个子页面都有独立的meta描述和关键词
- **维护性提升**: 统一的代码结构，便于后续功能扩展

**✅ 当前状态 (2025-07-21)**
- 开发服务器: http://localhost:3003/ ✅ 正常运行
- 所有子页面: ✅ 设计风格与首页完全一致
- 字体系统: ✅ 全站统一JCSKI标准字体
- 内容展示: ✅ 所有页面都有丰富的专业内容
- 响应式适配: ✅ 桌面端和移动端完美显示

### v0.4.6 (2025-07-20) - 文章详情页功能完整实现
**🎯 主要更新**
- ✅ **文章详情页系统**: 完整的动态路由文章详情页面，支持`/posts/[slug]`访问
- ✅ **API接口完善**: 新增`/api/posts/[slug].get.ts`，支持文章详情、相关推荐、导航功能
- ✅ **JCSKI风格设计**: 文章详情页完全采用JCSKI原创设计风格，与首页保持一致
- ✅ **首页链接功能**: JCSKI NEWS和PRESS RELEASE区域文章卡片支持点击跳转
- ✅ **用户体验优化**: 加载状态、错误处理、悬停效果和响应式设计

**📄 文章详情页核心功能**
- **动态路由**: `/posts/[slug]`路由支持，根据文章slug动态加载内容
- **完整内容展示**: 标题、摘要、正文、作者、发布时间、分类、标签等全部信息
- **图片系统**: 支持封面图片和特色图片展示，自动fallback到分类默认图片
- **音频支持**: 内置音频播放器，支持文章音频内容
- **相关文章推荐**: 基于分类的智能文章推荐系统
- **文章导航**: 前一篇/后一篇文章导航功能
- **社交分享**: Twitter、Facebook分享和URL复制功能

**🔧 技术实现特色**
- **API设计**: RESTful设计，支持文章详情、相关推荐、导航的一次性获取
- **类型安全**: 完整的TypeScript类型定义和接口设计
- **SEO优化**: 动态meta标签生成，支持Open Graph和Twitter Cards
- **错误处理**: 404页面、加载状态、网络错误的完善处理
- **性能优化**: 图片懒加载、CSS GPU加速动画

**✅ 首页链接功能增强**
- **JCSKI NEWS**: 置顶文章卡片全部支持点击跳转到详情页
- **PRESS RELEASE**: 所有文章条目支持点击跳转到详情页
- **悬停效果**: 优化的卡片悬停动画和视觉反馈
- **链接样式**: 保持JCSKI设计风格的链接外观

**🚀 当前状态 (2025-07-20 23:50)**
- 开发服务器: http://localhost:3000/ ✅ 正常运行 (端口自动调整)
- 文章详情页: `/posts/[slug]` ✅ 完全可用
- 首页链接: ✅ 所有文章卡片支持跳转
- API接口: ✅ 文章详情API正常响应
- 用户体验: ✅ 加载、错误、导航状态完善
- 设计风格: ✅ 完全符合JCSKI原创设计规范

**📱 用户使用流程**
1. 访问首页 → 2. 点击任意文章卡片 → 3. 跳转到文章详情页 → 4. 阅读完整内容 → 5. 查看相关推荐或导航到其他文章

### v0.4.5 (2025-07-20) - 项目稳定性提升与发布系统优化
**🎯 主要更新**
- ✅ **版本发布流程标准化**: 建立完整的版本管理和发布工作流
- ✅ **项目记忆文件完善**: CLAUDE.md项目记忆文件结构优化和内容更新
- ✅ **代码质量保障**: 所有现有功能稳定性验证和错误修复
- ✅ **部署流程优化**: 标准化的Git工作流和自动部署流程
- ✅ **文档体系完善**: 技术架构说明和开发指南更新

**🔧 技术改进**
- **版本管理**: package.json版本号与项目记忆保持同步
- **发布工作流**: 标准化的代码提交、构建、测试、部署流程  
- **稳定性验证**: 全面的功能测试和性能验证
- **文档维护**: 项目记忆文件的实时更新和版本追踪

**✅ 功能验证 (2025-07-20)**
- 图片上传系统: ✅ 完全稳定，所有功能正常
- 文章管理系统: ✅ 创建、编辑、发布功能完善
- 用户认证系统: ✅ JWT登录和权限管理正常
- API接口服务: ✅ 所有端点响应稳定
- 生产环境部署: ✅ http://jcski.com 完全正常运行

**🚀 当前状态 (2025-07-20 23:30)**
- 开发服务器: http://localhost:3003/ ✅ 正常运行
- 生产环境: http://jcski.com ✅ 完全正常运行 (Nginx配置已修复)
- 所有功能模块: ✅ 稳定可用，EC2全功能测试通过
- 自动部署: ✅ GitHub → EC2 工作流正常
- 项目记忆: ✅ 完整更新，版本追踪清晰

**🔧 EC2生产环境关键修复 (2025-07-20 13:30)**
- **Nginx配置冲突解决**: 修复默认server块覆盖jcski.com配置的问题
  - 问题: nginx.conf中默认server块监听80端口，导致显示nginx默认页面
  - 解决: 修改默认server为8080端口，设置jcski-blog.conf为`listen 80 default_server`
  - 结果: Nginx反向代理正常工作，http://jcski.com正确代理到Nuxt应用(3222端口)
- **完整功能验证**: 所有核心功能测试通过
  - 文章发布: 成功创建"EC2测试文章" (ID:1, TECH分类, 已置顶)
  - 图片上传: 成功上传测试文件到/uploads/目录
  - API接口: 所有端点(/api/posts, /api/auth/login, /api/admin/*)正常响应
  - 数据库: SQLite连接稳定，数据完整性验证通过
  - 管理后台: JWT认证和管理界面完全可用

### v0.4.4 (2025-07-20) - 图片上传管理系统完整实现
**🎯 主要更新**
- ✅ **完整图片上传系统**: 从上传到管理到使用的完整工作流
- ✅ **拖拽上传功能**: 支持将文件直接拖拽到上传区域
- ✅ **媒体管理组件**: 网格布局展示、文件筛选、预览删除功能
- ✅ **ImagePicker组件**: 双模式图片选择器(上传新图片/媒体库选择)
- ✅ **文章编辑器集成**: 封面图片和特色图片使用可视化选择器
- ✅ **安全性完善**: JWT身份验证、文件类型验证、大小限制

**🔧 核心技术实现**
- **上传API**: `/api/admin/media/upload.post.ts` 支持多文件上传，自动生成唯一文件名
- **媒体管理**: `AdminMedia.vue` 完整的媒体文件CRUD操作
- **图片选择器**: `ImagePicker.vue` 可复用组件，支持v-model双向绑定
- **文件存储**: `public/uploads/` 目录自动管理，支持SVG/PNG/JPG等格式
- **数据库模型**: `MediaFile` 表记录文件信息，与BlogPost关联

**✅ 功能验证测试结果 (2025-07-20)**
- 文件上传: ✅ 成功上传JCSKI测试图片 (SVG格式，511字节)
- 媒体列表: ✅ 正确获取文件列表和分页信息
- 文件删除: ✅ 同时删除数据库记录和磁盘文件
- 图片访问: ✅ 上传图片可通过HTTP正常访问
- 文章集成: ✅ 创建文章"JCSKI 图片上传系统测试"，图片正常显示
- 拖拽上传: ✅ 支持拖拽文件到上传区域
- 选择模式: ✅ ImagePicker双模式工作正常

**🎨 用户体验特色**
- **拖拽上传**: 直观的文件拖拽操作
- **实时预览**: 图片缩略图和大图预览
- **进度显示**: 文件上传进度条和状态提示
- **URL复制**: 一键复制文件链接到剪贴板
- **响应式设计**: 适配桌面和移动设备
- **错误处理**: 完善的文件验证和用户友好提示

**🔧 技术架构升级**
- **formidable依赖**: 新增文件上传处理库
- **组件化设计**: ImagePicker可在项目任何地方复用
- **类型安全**: 完整的TypeScript接口定义
- **安全验证**: JWT认证 + 文件类型/大小验证
- **存储管理**: 自动文件名生成 + 磁盘清理

**🚀 当前状态 (2025-07-20 22:10)**
- 开发服务器: http://localhost:3003/ ✅ 正常运行
- 图片上传系统: ✅ 完全可用，所有功能测试通过
- 媒体管理: ✅ 上传、预览、删除、选择功能正常
- 文章编辑: ✅ 图片选择器无缝集成，用户体验优秀
- API接口: ✅ 所有媒体相关API端点正常响应

### v0.4.3 (2025-07-20) - 后台文章发布功能完整修复与测试验证
**🎯 主要更新**
- ✅ **后台文章发布功能完全修复**: 解决"400 Title, content, excerpt, and slug are required"错误
- ✅ **服务器端API智能化**: 支持excerpt和slug字段自动生成，降低发布门槛
- ✅ **前后端一致性完善**: 前端和后端都支持智能字段自动生成
- ✅ **端口配置更新**: 服务器运行在3003端口，所有配置文件已同步
- ✅ **完整功能测试验证**: 登录、创建、编辑、发布、查询功能全面测试通过

**🔧 核心修复内容**
- **API验证逻辑优化**: `/api/admin/posts/create.post.ts` 只要求title和content必填
- **自动生成算法**: 
  - excerpt: 自动截取前150字符 + "..."
  - slug: 智能处理特殊字符 + 时间戳确保唯一性
- **错误处理完善**: 用户友好的错误提示和完整的调试支持
- **数据兼容性**: 支持现有数据结构，新旧数据无缝兼容

**✅ 功能验证测试结果 (2025-07-20)**
- 管理员登录: ✅ JWT token正常生成和验证
- 文章创建: ✅ 最少字段(title+content)即可成功创建
- 自动生成: ✅ excerpt和slug智能生成正常工作
- 分类标签: ✅ TECH/BLOG等8种分类正常
- 置顶功能: ✅ isPinned字段控制正确
- 发布状态: ✅ published字段管理正常
- 文章更新: ✅ PUT请求编辑功能正常
- 文章查询: ✅ 支持published/pinned等筛选参数

**📊 测试数据创建**
1. **"测试文章发布功能"** - TECH分类，已发布，已置顶，slug: `-1753015396239`
2. **"JCSKI 博客系统功能测试"** - BLOG分类，已发布，普通文章，slug: `jcski-1753015570952`

**🚀 技术改进亮点**
- **用户体验**: 用户只需填写标题和内容，系统自动完善其他字段
- **智能处理**: 中英文标题都能正确生成URL别名
- **错误防护**: 完善的验证和错误处理机制
- **开发友好**: 详细的调试日志和错误信息

**🎯 当前状态 (2025-07-20 15:00)**
- 开发服务器: http://localhost:3003/ ✅ 正常运行
- 管理后台: http://localhost:3003/admin ✅ 完全可用
- 文章发布: ✅ 无障碍创建和发布
- API接口: ✅ 所有端点响应正常
- 数据库: ✅ SQLite连接稳定，数据完整

### v0.4.2 (2025-07-20) - 数据库路径问题完全修复与开发环境同步
**🎯 主要更新**
- ✅ **API功能完全恢复**: 修复Prisma数据库路径问题，所有API端点正常工作
- ✅ **环境变量统一管理**: 本地开发和生产环境配置分离，避免路径冲突
- ✅ **管理后台完全可用**: 登录、文章管理、媒体管理等功能全部正常
- ✅ **本地开发环境同步**: 将服务器修复同步到本地，确保开发部署一致性
- ✅ **部署脚本优化**: 创建自动化部署修复脚本，防止future部署问题
- ✅ **完整部署工作流验证**: 本地→GitHub→EC2部署链路测试成功

**🔧 核心问题解决**
- **数据库路径统一**: Prisma schema使用环境变量，支持相对和绝对路径
- **环境配置分离**: `.env` (本地) + `.env.production` (生产) 独立配置
- **PM2配置优化**: 使用绝对路径和env_file确保生产环境稳定性
- **完整重建**: 删除旧数据库重新创建，确保表结构一致性

**📁 配置文件更新**
```bash
# 本地开发 (.env)
DATABASE_URL="file:./prisma/dev.db"
BASE_URL="http://localhost:3003"

# 生产环境 (.env.production)  
DATABASE_URL="file:/var/www/jcski-blog/prisma/dev.db"
BASE_URL="http://jcski.com"

# Prisma Schema
datasource db {
  provider = "sqlite"
  url = env("DATABASE_URL")  # 统一使用环境变量
}
```

**✅ 完整功能验证**
- 网站前端：✅ 所有页面正常 (主页、音乐、滑雪、科技、钓鱼、关于)
- API接口：✅ 完全正常 (/api/posts, /api/auth/login, /api/admin/*)
- 管理后台：✅ 登录和所有管理功能可用
- 身份验证：✅ JWT token生成和验证正常
- 数据库：✅ SQLite连接稳定，所有表创建正确

**🚀 自动化脚本**
- `scripts/create-admin.js`: 管理员用户初始化
- `scripts/deploy-fix.sh`: 部署环境修复脚本
- 环境变量自动检测和配置

**🎯 解决future部署问题**
- 本地开发和生产环境完全同步
- 环境变量驱动的配置管理
- 自动化修复脚本防止路径问题重现
- 完整的开发到生产部署工作流

**✅ 部署工作流完整验证 (2025-07-20)**
```bash
# 测试流程: 本地开发 → GitHub → EC2生产
1. 本地修复同步 ✅ 环境变量配置分离完成
2. Git提交推送 ✅ 提交ID: de0b810, 包含全部修复
3. 服务器自动更新 ✅ 代码同步，部署脚本运行成功
4. PM2配置修复 ✅ 环境变量正确，绝对路径生效
5. 功能验证测试 ✅ API/前端/管理后台全部正常

# 测试结果确认
- 生产环境: http://jcski.com ✅ 完全正常
- 本地开发: http://localhost:3222 ✅ 完全正常
- 路径问题: ✅ 彻底解决，不会再次出现
```

**🚀 标准部署流程 (已验证)**
```bash
# 本地开发
npm run dev                 # 使用 .env (相对路径)

# 提交部署  
git add . && git commit -m "功能更新"
git push origin main        # 自动触发EC2更新

# 生产环境自动使用 .env.production (绝对路径)
# 如有问题: ./scripts/deploy-fix.sh
```

### v0.4.1 (2025-07-20) - GitHub自动部署与生产环境完整实现
**🎯 主要更新**
- ✅ GitHub Actions CI/CD配置：完整的自动部署工作流
- ✅ AWS EC2生产环境：Amazon Linux + Nginx + PM2部署架构
- ✅ 域名配置：jcski.com域名成功部署和DNS配置
- ✅ 生产环境优化：环境变量管理、构建优化、服务器配置
- ✅ 部署脚本完善：修复脚本、诊断脚本、自动化部署流程

**🚀 GitHub自动部署架构**
- 新仓库：https://github.com/kenkakuma/jcski.git
- 工作流：.github/workflows/deploy.yml
- 触发方式：推送到main分支或手动触发
- 部署目标：AWS EC2 (54.168.203.21)
- 环境管理：GitHub Secrets安全存储

**🌐 生产环境配置**
- 服务器：AWS EC2 Amazon Linux 2023
- Node.js：v20.19.4 (升级解决兼容性问题)
- 进程管理：PM2 with ecosystem.config.js
- 反向代理：Nginx配置域名和SSL准备
- 数据库：SQLite with Prisma ORM

**🔧 技术问题解决**
- 修复useRuntimeConfig JWT配置问题：改用process.env
- 环境变量传递：PM2配置文件完整环境变量设置
- 构建优化：Nuxt 3生产构建和静态资源优化
- 服务器配置：Nginx反向代理和域名解析

**✅ 当前部署状态 (2025-07-20 最新验证)**
- 网站访问：http://jcski.com ✅ 正常运行
- 前端功能：✅ 完全正常 (所有页面和交互)
- 静态资源：✅ 正常加载 (CSS、JS、图片)
- 数据库：✅ 连接正常 (SQLite + Prisma, 绝对路径)
- API功能：✅ 所有API端点正常 (v0.4.2修复)
- 管理后台：✅ 完全可用 (v0.4.2修复)
- 部署工作流：✅ 本地→GitHub→EC2链路验证成功
- 环境一致性：✅ 开发和生产环境配置完全同步

### v0.4.0 (2025-07-19) - 置顶功能与特色图片系统完整实现
**🎯 主要更新**
- ✅ 置顶文章功能：JCSKI NEWS与PRESS RELEASE区域功能分离
- ✅ 特色图片系统：首页动态图片展示，支持特色图片与默认图片
- ✅ 管理后台完善：文章编辑功能修复，支持置顶开关和图片预览
- ✅ 数据结构优化：BlogPost模型添加isPinned和featuredImage字段
- ✅ API接口扩展：支持置顶文章查询和特色图片管理

**🏠 首页区域功能分离**
- JCSKI NEWS：专门显示置顶文章(isPinned=true)，最多6篇，带📌标识
- PRESS RELEASE：显示所有文章按时间排序，完整的文章时间线
- 动态图片：特色图片优先显示，无特色图片则根据分类使用默认图片
- 占位符优化：针对性提示文案，引导用户设置置顶文章

**🔧 管理后台功能完善**
- 置顶管理：文章列表显示置顶状态，编辑表单添加置顶复选框
- 图片预览：封面图片和特色图片实时预览功能
- 数据兼容：修复tags字段数据结构兼容性问题
- 错误处理：完善的调试日志和用户友好的错误提示
- API路径修正：修复文章创建接口路径问题

**🎨 用户体验优化**
- 视觉标识：置顶文章标题前显示📌图标
- 响应式适配：移动端表格布局优化，隐藏非关键列
- 状态管理：置顶状态的可视化管理和状态切换
- 调试支持：开发环境详细日志，生产环境自动禁用

**📊 技术架构升级**
- 数据库模型：添加isPinned布尔字段，featuredImage字符串字段
- API设计：智能排序逻辑，支持置顶状态查询参数
- 类型安全：TypeScript接口更新，完整的类型定义
- 向后兼容：现有数据自动设置默认值，无缝升级

### v0.3.x - v0.1.x (2025-07-14 ~ 2025-07-17) - 早期版本历史整合
**📦 功能构建阶段 (v0.3.x系列)**
- ✅ **v0.3.1**: 分类标签系统实现，8种分类彩色标签(MUSIC/TECH/SKIING等)
- ✅ **v0.3.0**: 图片系统完善，6张主题图片集成，页面对齐优化至1300px统一宽度

**🎨 设计优化阶段 (v0.2.x系列)**  
- ✅ **v0.2.0**: Hero区域重构，JCSKI风格导航，NEWS板块三卡片布局重设计

**🏗️ 基础架构阶段 (v0.1.x系列)**
- ✅ **v0.1.8**: Hero动态交互完善，柔和渐入效果，后台TypeScript修复
- ✅ **v0.1.7**: Hero内容管理系统，数据库模型设计，动态交互功能实现
- ✅ **v0.1.6**: Google字体系统升级，反色动画精致化，Hero区域布局完善
- ✅ **v0.1.5**: Hero导航JCSKI风格重构，双语显示，字体专业化
- ✅ **v0.1.4**: 内容管理系统完善，JWT认证，媒体管理，Prisma+SQLite架构
- ✅ **v0.1.3**: 个人博客导航系统，5个专业领域页面，SEO优化
- ✅ **v0.1.2**: Hero区域框架化布局，4:6比例设计
- ✅ **v0.1.0**: JCSKI风格完整重构，天空Hero背景，彩色主题板块

**🔧 核心技术成果汇总**
- **设计语言**: JCSKI原创风格，双语导航，反色动画特效
- **页面架构**: Hero框架+六大板块，响应式设计，1300px统一宽度
- **后端系统**: Nuxt 3 + TypeScript + Prisma + SQLite完整架构
- **管理功能**: 用户认证，内容管理，媒体上传，Hero内容管理
- **交互体验**: 动态内容切换，渐入动画，状态管理，移动端适配

---

## 🎯 快速导航

### 📖 常用页面

**开发环境 (本地)**
- 🏠 **主页**: http://localhost:3000/ (端口自动分配)
- 🎵 **音乐**: http://localhost:3000/music  
- 🎿 **滑雪**: http://localhost:3000/skiing
- 💻 **科技**: http://localhost:3000/tech
- 🎣 **钓鱼**: http://localhost:3000/fishing
- 👤 **关于**: http://localhost:3000/about
- 📄 **文章详情**: http://localhost:3000/posts/{slug} ⭐ 新增
- 🔐 **管理登录**: http://localhost:3000/admin/login
- 🛠️ **管理后台**: http://localhost:3000/admin

**生产环境 (线上) ✅ 2025-07-20 全功能验证**
- 🌐 **主页**: http://jcski.com/ ✅ 正常
- 🎵 **音乐**: http://jcski.com/music ✅ 正常  
- 🎿 **滑雪**: http://jcski.com/skiing ✅ 正常
- 💻 **科技**: http://jcski.com/tech ✅ 正常
- 🎣 **钓鱼**: http://jcski.com/fishing ✅ 正常
- 👤 **关于**: http://jcski.com/about ✅ 正常
- 📄 **文章详情**: http://jcski.com/posts/{slug} ⭐ 新增
- 🔐 **管理登录**: http://jcski.com/admin/login ✅ 完全可用
- 🛠️ **管理后台**: http://jcski.com/admin ✅ 完全可用

### 🔧 开发工具
- **开发服务器**: `npm run dev`
- **构建项目**: `npm run build`
- **数据库管理**: `npx prisma studio`
- **数据库迁移**: `npx prisma db push`
- **生成Prisma客户端**: `npx prisma generate`
- **创建管理员**: `node scripts/create-admin.js`
- **初始化Hero内容**: `node scripts/init-hero-content.js`
- **检查Hero数据**: `node scripts/check-hero-data.js`
- **测试Hero API**: `node scripts/test-hero-api.js`
- **测试图片上传**: `curl -F "file=@image.jpg" -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/admin/media/upload`

### 📋 板块修改参考
如需修改特定板块，可使用以下标识符：
- **A板块**: 顶部导航栏 (`.top-nav`)
- **B板块**: Hero框架区域 (`.hero-frame`)
  - **B1**: 左侧导航 (`.hero-left`) - JCSKI风格双语菜单
  - **B2**: 右侧展示 (`.hero-right`) - 天空背景展示区
- **C板块**: 新闻板块 (`.news-section`)  
- **D板块**: 主题板块 (`.topics-section`)
- **E板块**: 新闻发布板块 (`.press-section`)
- **F板块**: 底部信息栏 (`.main-footer`)

---

## 💡 项目亮点

### 🎨 设计特色
- **原创设计风格**: 100%JCSKI原创设计语言
- **现代化交互**: 流畅的页面切换和hover效果
- **品牌一致性**: 统一的视觉语言和设计规范
- **个性化主题**: 每个领域都有专属的色彩和风格

### 🚀 技术特色  
- **现代化技术栈**: Nuxt 3 + TypeScript + Prisma
- **高性能优化**: SSR + 静态生成 + 懒加载
- **类型安全**: 完整的TypeScript类型定义
- **可维护性**: 清晰的代码结构和组件化设计

### 📱 用户体验
- **响应式设计**: 完美适配所有设备
- **快速加载**: 优化的资源加载和缓存策略  
- **直观导航**: 清晰的信息架构和页面流程
- **无障碍访问**: 语义化HTML和键盘导航支持

---

## 🔧 最新技术架构说明 (v0.4.0)

### 📊 数据库模型关键字段
**BlogPost 核心字段:**
```prisma
model BlogPost {
  id           Int      @id @default(autoincrement())
  title        String
  content      String
  excerpt      String
  slug         String   @unique
  coverImage   String?  // 封面图片
  featuredImage String? // 特色图片 (首页JCSKI NEWS显示)
  audioFile    String?
  tags         String   // JSON字符串格式
  category     String   @default("BLOG") // 分类标签
  published    Boolean  @default(false)
  isPinned     Boolean  @default(false) // 置顶状态
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  authorId     Int
}
```

### 🎯 首页区域功能映射
**JCSKI NEWS 区域:**
- API查询: `/api/posts?pinned=true&published=true&limit=6`
- 数据筛选: `isPinned=true` 的文章
- 显示逻辑: 置顶文章优先，最多6篇，带📌标识
- 图片优先级: `featuredImage` → `getDefaultImage(category)`

**PRESS RELEASE 区域:**
- API查询: `/api/posts?published=true&limit=10`
- 数据筛选: 所有已发布文章
- 显示逻辑: 按创建时间降序排列
- 功能定位: 完整的文章时间线

### 🛠️ 管理后台关键修复
**编辑功能问题解决:**
1. **数据结构兼容**: tags字段支持数组和JSON字符串格式
2. **API路径修正**: 创建接口使用`/api/admin/posts/create`
3. **类型安全处理**: Boolean字段使用`Boolean()`强制转换
4. **错误处理**: 完善的try-catch和用户友好提示
5. **调试支持**: 开发环境条件日志，生产环境自动禁用

**置顶功能实现:**
- 数据库字段: `isPinned Boolean @default(false)`
- 管理界面: 置顶复选框 + 可视化状态显示
- API支持: 创建和更新接口支持isPinned字段
- 前端查询: 支持pinned=true查询参数

### 🖼️ 图片上传系统架构 (v0.4.4)

**核心API端点:**
- `POST /api/admin/media/upload` - 文件上传接口
- `GET /api/admin/media` - 获取媒体文件列表
- `DELETE /api/admin/media/[id]` - 删除媒体文件
- `GET /uploads/[filename]` - 静态文件访问

**组件架构:**
```vue
AdminMedia.vue              // 媒体管理主组件
├── 拖拽上传区域            // 支持拖拽文件上传
├── 文件网格展示            // 缩略图网格布局
├── 文件筛选器              // 按类型筛选(图片/音频)
├── 预览模态框              // 大图预览和URL复制
└── 选择模式                // 为其他组件提供文件选择

ImagePicker.vue             // 图片选择器组件
├── 图片预览区域            // 显示已选择的图片
├── 上传标签页              // 拖拽上传新图片
├── 媒体库标签页            // 从现有文件中选择
└── v-model支持             // 双向数据绑定
```

**数据库模型:**
```prisma
model MediaFile {
  id           Int      @id @default(autoincrement())
  filename     String   // 存储的文件名
  originalName String   // 原始文件名
  path         String   // 访问路径
  mimetype     String   // MIME类型
  size         Int      // 文件大小(字节)
  type         String   // 文件类型(image/audio)
  createdAt    DateTime @default(now())
}
```

**文件存储策略:**
- 存储目录: `public/uploads/`
- 文件命名: `{timestamp}-{randomString}.{extension}`
- 大小限制: 10MB
- 支持格式: JPG, PNG, GIF, SVG, MP3, WAV等
- 自动清理: 删除数据库记录时同步删除磁盘文件

---

---

## 🚀 部署配置详情 (v0.4.1)

### 📋 GitHub仓库信息
- **仓库地址**: https://github.com/kenkakuma/jcski.git
- **主分支**: main
- **自动部署**: GitHub Actions
- **部署目标**: AWS EC2 (54.168.203.21)

### 🔧 CI/CD工作流
**文件**: .github/workflows/deploy.yml
**触发条件**: 
- 推送到main分支
- 手动触发 (workflow_dispatch)

**部署步骤**:
1. 检出代码
2. 设置Node.js 18环境
3. SSH连接到EC2
4. 拉取最新代码
5. 安装依赖和构建
6. 重启PM2服务

### 🌐 生产环境配置
**服务器**: AWS EC2 Amazon Linux 2023
- IP地址: 54.168.203.21
- 域名: jcski.com
- SSH密钥: Kowp.pem

**软件环境**:
- Node.js: v20.19.4
- PM2: v6.0.8  
- Nginx: 反向代理配置
- SQLite: 数据库

**关键配置文件**:
- `ecosystem.config.js`: PM2配置
- `.env.production`: 生产环境变量
- `/etc/nginx/conf.d/jcski-blog.conf`: Nginx配置

### 🔒 GitHub Secrets配置
需要在GitHub仓库设置以下Secrets:
- `EC2_HOST`: 54.168.203.21
- `EC2_USER`: ec2-user
- `EC2_SSH_KEY`: SSH私钥内容
- `DATABASE_URL`: file:./prisma/dev.db
- `JWT_SECRET`: 生产JWT密钥
- `BASE_URL`: http://jcski.com

### ⚡ 快速部署命令
```bash
# 本地推送触发自动部署
git push origin main

# 手动服务器操作
ssh -i "Kowp.pem" ec2-user@54.168.203.21
cd /var/www/jcski-blog
pm2 restart jcski-blog
```

---

## 📊 当前项目状态总结 (2025-07-20)

### ✅ **完全可用的功能**
- **前端网站**: 所有页面 (主页、音乐、滑雪、科技、钓鱼、关于) 正常运行
- **后端API**: 所有API端点 (/api/posts, /api/auth/login, /api/admin/*) 正常响应
- **管理系统**: 文章管理、媒体管理、用户认证完全可用
- **文章发布**: ✅ 完全修复，支持智能字段自动生成
- **图片上传系统**: ✅ 完整的媒体文件管理，拖拽上传，图片选择器
- **部署工作流**: 本地开发→GitHub→EC2生产环境无缝部署

### 🎯 **技术架构稳定性**
- **数据库**: SQLite + Prisma ORM, 路径问题彻底解决
- **环境管理**: 开发/生产环境配置完全分离
- **进程管理**: PM2 + ecosystem.config.js 稳定运行
- **域名访问**: jcski.com 域名正常解析和访问
- **API智能化**: 服务器端支持自动生成字段，用户体验优化
- **媒体管理**: 完整的文件上传、存储、管理系统

### 🚀 **开发部署流程**
```bash
# 标准开发流程 (已验证)
npm run dev                     # 本地开发 (端口3003)
git add . && git commit -m ""   # 提交代码
git push origin main            # 自动部署到生产环境
```

### 🔧 **问题解决能力**
- 自动化修复脚本: `scripts/deploy-fix.sh`
- 环境变量驱动配置: 防止路径冲突
- 完整的调试和诊断工具
- 智能字段生成: 降低文章发布门槛
- 媒体文件管理: 支持拖拽上传和可视化选择

**🚨 重要错误修复记录 (供今后参考)**

#### Nginx配置冲突问题 (2025-07-20)
**问题描述**: 
- 症状: 访问jcski.com显示nginx默认页面而非Nuxt应用
- 原因: `/etc/nginx/nginx.conf`中默认server块监听80端口，优先级高于`/etc/nginx/conf.d/jcski-blog.conf`

**诊断命令**:
```bash
# 检查端口监听状态
sudo netstat -tulpn | grep nginx
# 检查配置加载情况  
sudo nginx -T | grep -A 20 'jcski'
# 查看错误日志
sudo tail -20 /var/log/nginx/error.log
```

**解决方案**:
```bash
# 1. 修改默认server端口避免冲突
sudo sed -i 's/listen       80;/listen       8080;/' /etc/nginx/nginx.conf
sudo sed -i 's/listen       \[::\]:80;/listen       [::]:8080;/' /etc/nginx/nginx.conf

# 2. 设置jcski配置为默认server
sudo sed -i 's/listen 80;/listen 80 default_server;/' /etc/nginx/conf.d/jcski-blog.conf

# 3. 重启nginx应用配置
sudo systemctl restart nginx
```

**验证方法**:
```bash
# 应该返回Nuxt应用HTML而非nginx默认页面
curl -s http://localhost | head -5
# 应该包含"JCSKI BLOG"等应用内容
```

**预防措施**: 
- 生产环境部署时优先检查nginx server块配置
- 确保自定义站点配置设为default_server
- 定期验证代理是否正确工作

**项目状态**: 🟢 生产就绪，功能完整，部署稳定，v0.4.8版本完整部署成功

---

## 🚨 部署修复记录和错误信息备份 (v0.4.8)

### 📋 v0.4.8部署过程完整记录 (2025-07-21)

#### 🎯 部署目标
- **主要功能**: 文章详情页显示问题修复 + 子页面设计统一
- **核心文件**: 
  - `server/api/posts/[slug].get.ts` (新增文章详情页API)
  - `assets/css/subpage.css` (统一子页面样式)
  - `pages/posts/[slug].vue` (Tags字段JSON解析修复)

#### ❌ GitHub Actions部署失败分析

**问题现象**:
- 连续多次GitHub Actions workflow运行失败 (status: completed/failure)
- 检查URL: `curl -s "https://api.github.com/repos/kenkakuma/jcski/actions/runs?per_page=3"`
- 失败时间: 2025-07-21T01:44:57Z, 2025-07-21T01:39:06Z, 2025-07-21T01:30:31Z

**原因分析**:
1. **自动部署工作流问题**: GitHub Actions SSH连接或执行失败
2. **构建环境问题**: 可能的依赖安装或构建错误
3. **PM2重启问题**: 应用重启过程中的错误
4. **权限问题**: EC2服务器文件权限或目录访问问题

**失败现象确认**:
```bash
# EC2仍显示旧版本
curl -s "http://jcski.com/" | grep -o '<title>[^<]*</title>'
# 输出: <title>JCSKI BLOG - jcski.com 正式部署 v0.4.1</title>

# 新API路由404错误
curl -I "http://jcski.com/api/posts/ec2-1753018794566"
# 输出: HTTP/1.1 404 Page not found: /api/posts/ec2-1753018794566
```

#### ✅ 手动部署成功解决方案

**修复策略**: 绕过GitHub Actions，直接SSH部署

**成功部署脚本**: `deploy-manual.sh`
```bash
#!/bin/bash
# 核心部署命令
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21 << 'EOF'
set -e
cd /var/www/jcski-blog
git fetch --all
git reset --hard origin/main  # 强制重置，确保最新代码
git pull origin main
npm ci --production
npx prisma generate
npx prisma db push
npm run build
pm2 stop jcski-blog || echo "应用未运行"
pm2 delete jcski-blog || echo "应用不存在" 
pm2 start ecosystem.config.js
pm2 save
EOF
```

**部署验证成功标志**:
```bash
# 1. 代码更新确认
当前commit: fe04305 fix: 改进GitHub Actions部署配置

# 2. 关键文件存在确认
server/api/posts/[slug].get.ts ✅
assets/css/subpage.css ✅

# 3. Nuxt构建成功确认
.output/server/chunks/routes/api/posts/_slug_.get.mjs ✅

# 4. PM2重启成功确认
jcski-blog | online | pid: 101947 ✅
```

#### 🔧 关键技术修复详情

**1. 文章详情页Tags字段JSON解析问题**

**问题**: 数据库存储JSON字符串，Vue模板无法迭代导致页面无文字显示
```javascript
// 问题代码: v-for无法迭代字符串
<span v-for="tag in article.tags" :key="tag">#{{ tag }}</span>
// tags = '["图片上传", "媒体管理", "JCSKI", "测试"]' (字符串)
```

**解决方案**: `pages/posts/[slug].vue:229-237`
```javascript
if (typeof articleData.tags === 'string') {
  try {
    articleData.tags = JSON.parse(articleData.tags)
  } catch (e) {
    console.warn('Failed to parse tags JSON:', e)
    articleData.tags = []
  }
}
```

**2. 子页面设计统一问题**

**问题**: 各子页面字体、样式、导航不一致
- 使用不同字体系统 (Helvetica Neue vs Special Gothic Expanded One)
- 导航样式不统一
- 响应式设计不一致

**解决方案**: 创建`assets/css/subpage.css` (7915字节)
```css
.subpage {
  font-family: 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans', 
              ui-sans-serif, system-ui, sans-serif;
}
.nav-title {
  font-family: "Special Gothic Expanded One", sans-serif;
}
```

**3. API路由部署问题**

**问题**: 新创建的`server/api/posts/[slug].get.ts`在生产环境404
**原因**: GitHub Actions部署失败，文件未正确更新到EC2
**解决**: 手动SSH部署确保文件传输和Nuxt构建正确执行

#### 📊 部署成功验证清单

**API功能验证**:
```bash
✅ 基础API: curl -s "http://jcski.com/api/posts" (正常)
✅ 详情API: curl -s "http://jcski.com/api/posts/test-1753020544792" (正常)
✅ 前端页面: curl -I "http://jcski.com/posts/test-1753020544792" (200状态)
```

**子页面统一验证**:
```bash
✅ MUSIC: <title>MUSIC - JCSKI BLOG</title>
✅ TECH: <title>TECH - JCSKI BLOG</title>
✅ SKIING: <title>SKIING - JCSKI BLOG</title>
✅ FISHING: <title>FISHING - JCSKI BLOG</title>
✅ ABOUT: <title>ABOUT - JCSKI BLOG</title>
```

#### 🚀 GitHub Actions部署配置改进

**问题**: 原配置缺乏错误处理和调试信息
**改进**: `.github/workflows/deploy.yml` 增强版
```yaml
script: |
  set -e  # 遇到错误立即退出
  echo "🚀 开始部署 v0.4.8..."
  cd /var/www/jcski-blog
  pwd && ls -la
  git fetch --all
  git reset --hard origin/main  # 强制重置
  git pull origin main
  echo "当前commit: $(git rev-parse HEAD)"
  npm ci --production --verbose
  npx prisma generate && npx prisma db push
  NODE_ENV=production npm run build
  echo "📁 检查关键文件是否存在..."
  ls -la server/api/posts/
  ls -la assets/css/ || echo "assets/css目录不存在"
  pm2 stop jcski-blog || echo "应用未运行"
  pm2 delete jcski-blog || echo "应用未存在"
  pm2 start ecosystem.config.js && pm2 save
  sleep 10 && pm2 status
```

#### 🎯 经验教训和预防措施

**1. GitHub Actions可靠性问题**
- **现象**: 连续失败但无具体错误信息
- **预防**: 保持手动部署脚本作为备用方案
- **监控**: 定期检查 `https://api.github.com/repos/[repo]/actions/runs`

**2. 文件传输验证重要性**
- **检查**: 部署后必须验证关键文件是否存在
- **命令**: `ls -la server/api/posts/` 和 `ls -la assets/css/`

**3. 数据库字段格式统一**
- **问题**: JSON字段存储格式不一致导致前端解析失败
- **方案**: 前端增加兼容性处理，后端标准化输出格式

#### 🔍 故障排查命令集合

**GitHub Actions状态检查**:
```bash
curl -s "https://api.github.com/repos/kenkakuma/jcski/actions/runs?per_page=3"
```

**生产环境验证**:
```bash
# 基础功能
curl -I "http://jcski.com/"
curl -s "http://jcski.com/api/posts" | head -20

# 文章详情页
curl -I "http://jcski.com/api/posts/[slug]"
curl -I "http://jcski.com/posts/[slug]"

# 子页面检查  
curl -s "http://jcski.com/tech" | grep '<title>'
```

**EC2服务器检查**:
```bash
ssh -i ~/Documents/Kowp.pem ec2-user@54.168.203.21
cd /var/www/jcski-blog
git log --oneline -3
ls -la server/api/posts/
pm2 status
```

**数据库内容验证**:
```bash
curl -s "http://jcski.com/api/posts" | python3 -c "
import json, sys
data = json.load(sys.stdin)
posts = data.get('posts', [])
for post in posts:
    print(f'- {post[\"title\"]} (slug: {post[\"slug\"]})')
"
```

#### 📈 部署成功指标

**最终状态 (2025-07-21 08:30)**:
- ✅ **版本**: v0.4.8完整部署
- ✅ **API**: 所有端点正常响应  
- ✅ **前端**: 文章详情页功能完整
- ✅ **设计**: 子页面JCSKI风格统一
- ✅ **修复**: Tags字段JSON解析问题解决
- ✅ **性能**: PM2进程稳定运行

**用户体验验证**:
- 文章详情页完整浏览体验 ✅
- 子页面设计风格一致性 ✅  
- 标签系统正常显示 ✅
- 移动端响应式适配 ✅

---

*最后更新: 2025-07-21 | 当前版本: v0.4.8 | 状态: 完整部署成功，包含完整的故障排查和修复记录*