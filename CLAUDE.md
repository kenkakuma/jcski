# JCSKI Personal Blog 项目记忆文件

## 📋 项目概览

### 🎯 基本信息
- **项目名称**: JCSKI Personal Blog
- **当前版本**: v0.4.0 (2025-07-19)
- **技术栈**: Nuxt 3 + TypeScript + SQLite + Prisma
- **开发服务器**: http://localhost:3222
- **项目路径**: /Users/eric/WebstormProjects/jcski
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
  "jsonwebtoken": "^9.0.2"
}
```

---

## 📁 项目结构

```
jcski/
├── 📄 配置文件
│   ├── package.json           # 项目配置
│   ├── nuxt.config.ts         # Nuxt配置 (端口3222)
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
📄 index.vue (http://localhost:3222/)
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
http://localhost:3222/
```

### 📊 环境变量
```env
# 数据库配置
DATABASE_URL="file:./dev.db"

# JWT配置
JWT_SECRET="jcski-blog-super-secret-jwt-key-2025"

# 应用配置
BASE_URL="http://localhost:3222"

# 管理员配置
ADMIN_EMAIL="admin@jcski.com"
ADMIN_PASSWORD="admin123456"
```

---

## 📝 版本历史

### v0.4.0 (2025-07-19) - 置顶功能与特色图片系统完整实现 ⭐ 当前版本
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

### v0.3.1 (2025-07-17) - 分类标签系统实现
**🎯 主要更新**
- ✅ PRESS RELEASE文章分类标签：仿照JCSKI NEWS风格的彩色分类系统
- ✅ 数据库模型扩展：BlogPost添加category字段，默认值BLOG
- ✅ 管理后台分类功能：文章编辑表单添加分类选择，列表显示分类标签
- ✅ API接口完善：创建和更新文章API支持category字段
- ✅ 8种分类支持：MUSIC、TECH、SKIING、FISHING、BLOG、NEWS、GAMING、PODCAST

**🎨 分类标签设计**
- 颜色方案：每种分类独特色彩，与JCSKI原创设计风格一致
- 布局优化：标题右侧紧凑显示，移动端适配完善
- 视觉统一：与JCSKI NEWS板块保持相同的标签风格
- 交互体验：管理后台可视化分类管理和状态显示

**🔧 技术改进**
- TypeScript类型定义更新：BlogPost接口添加category字段
- Prisma数据库迁移：无缝添加新字段，保持数据完整性
- 响应式CSS优化：表格布局调整，支持新增分类列
- API向后兼容：现有数据自动设置默认分类

### v0.3.0 (2025-07-17) - 图片系统完善与页面对齐优化
**🎯 主要更新**
- ✅ 6张主题图片集成：NEWS、MUSIC、GAMING、TECH、SKIING、FISHING
- ✅ 所有板块宽度统一：1300px完美对齐
- ✅ 图片资源本地化：Unsplash高质量图片下载和配置
- ✅ 设计风格更新：去除J-WAVE元素，确立JCSKI原创设计
- ✅ 响应式图片优化：不同设备的图片显示适配

**🖼️ 图片系统架构**
- 本地图片存储：/public/images/目录统一管理
- 6个主题图片：news.jpg, music.jpg, gaming.jpg, tech.jpg, skiing.jpg, fishing.jpg
- 图片规格：400×240标准尺寸，适配卡片设计
- 内容匹配：每张图片精准对应相应板块主题

**📐 页面对齐优化**
- 统一最大宽度：所有板块从混合宽度改为1300px
- 完美对齐：顶部导航、Hero区域、NEWS、PRESS RELEASE左侧边缘在同一条线
- 视觉一致性：页面整体布局更加规整和专业
- 响应式保持：移动端和桌面端都保持良好的对齐效果

### v0.2.0 (2025-07-16) - Hero区域重构与NEWS板块重设计
**🎯 主要更新**
- ✅ Hero区域尺寸优化：整体放大20%，更加宽敞舒适
- ✅ 顶部导航JCSKI风格重构：双语显示+反色动画效果
- ✅ Hero左侧导航文字格式调整：英文+日文水平布局，去除分隔符
- ✅ Hero右侧图片调整：700×500尺寸，居左显示，向下移动30px
- ✅ NEWS板块JCSKI PROGRAM风格重设计：六卡片布局
- ✅ 三个板块容器宽度统一：与Hero区域保持1200px一致
- ✅ 去除装饰符号：移除所有♦符号，标题更简洁

**🎨 Hero区域重构详情**
- 整体尺寸放大20%：560px→672px高度，图片840×600px→700×500px
- 左右容器比例调整：40:60→35:65，中间间距80px
- 顶部导航风格统一：与Hero左侧导航相同的JCSKI双语风格
- 左侧导航文字优化：英文48px+日文24px，去除竖线分隔符
- 右侧图片居左显示：去除左偏移，向下移动30px
- 下方信息板块调整：向右移动60px，字体增大至16px/14px

**📰 NEWS板块JCSKI PROGRAM风格**
- 三卡片等宽布局：grid-template-columns: repeat(3, 1fr)
- 卡片设计：白色背景+8px圆角+底部红色状态条
- 内容结构：图片180px+节目信息+TIME FREE标签
- 第三张Podcast卡片：无图片纯文字+多层级信息展示
- 字体搭配：Special Gothic Expanded One标题+13px描述文字
- 状态标签：红色TIME FREE+绿色PODCAST+黄色PLENUS

**🎯 TOPICS板块重构**
- 2x4网格布局：8个主题卡片完整覆盖所有内容领域
- 图标化设计：每个主题配备对应emoji图标
- 专业标签：NEW、HOT、SEASON、GUIDE等状态标签
- 交互效果：悬停时图标放大+卡片上浮+标签滑入
- 8个核心主题：MUSIC、TECH、SKIING、FISHING、ABOUT、BLOG、CREATIVE、LIFESTYLE

**📱 响应式优化**
- 移动端网格布局：NEWS变为单列，TOPICS变为2x4
- 图片尺寸适配：不同屏幕尺寸的图片高度调整
- 交互效果优化：触摸设备的悬停效果适配
- 字体大小调整：确保在小屏幕上的可读性

**🔧 技术改进**
- CSS Grid布局优化：更灵活的网格系统
- 渐变背景色：每个主题的独特色彩标识
- 动画性能优化：使用transform和opacity进行GPU加速
- 代码结构优化：清晰的CSS类命名和组织

**📱 响应式设计完善**
- 移动端Hero区域：单列布局，图片高度按比例缩放
- 平板设备适配：字体和间距中等尺寸调整
- 手机设备优化：最小字体确保可读性
- NEWS三卡片响应式：桌面3列→平板/手机1列

### v0.1.8 (2025-07-15) - Hero动态交互完善与后台修复
**🎯 主要更新**
- ✅ 右侧图片文字区域柔和渐入效果：0.4s过渡动画 + 防抖机制
- ✅ 激活状态菜单反色效果修复：统一悬停和激活状态样式
- ✅ 后台访问错误修复：AdminHero组件TypeScript语法问题解决
- ✅ Hero交互体验优化：平滑过渡 + 视觉反馈完善
- ✅ 完整功能测试验证：前后端API + 管理后台全面测试

**🎨 渐入效果优化**
- 柔和过渡动画：opacity 0.4s + transform 0.4s cubic-bezier缓动
- 防抖机制：clearTimeout避免快速悬停造成的动画冲突
- 多层次效果：透明度变化 + 垂直位移 + 模糊效果
- 精确时序控制：120ms渐出 + 50ms渐入延迟
- 状态管理：isChanging响应式变量控制动画状态

**🔧 激活状态修复**
- 统一样式逻辑：.active和:hover使用相同的反色效果
- 移除蓝色文字：取消.active:not(:hover)的蓝色样式
- 反色效果：黑色背景滑动 + 白色文字显示
- 视觉一致性：悬停态和激活态保持完全一致
- CSS选择器优化：简化选择器逻辑，提高性能

**🛠️ 后台修复内容**
- TypeScript语法修复：AdminHero.vue添加lang="ts"属性
- 编译错误解决：修复type import语法解析问题
- 开发服务器稳定性：重启服务器解决缓存问题
- API接口测试：验证所有Hero相关API正常工作
- 完整功能验证：前后端交互全流程测试通过

**⚡ 性能优化**
- 动画性能：使用transform和opacity进行GPU加速
- 内存管理：及时清理定时器，避免内存泄漏
- 响应式优化：精确的状态变更，减少不必要的重渲染
- 网络请求：智能判断内容变化，避免重复请求
- 代码分割：组件按需加载，优化首屏加载速度

### v0.1.7 (2025-07-15) - Hero内容管理系统与动态交互功能
**🎯 主要更新**
- ✅ Hero内容管理系统：数据库模型设计 + 完整CRUD API
- ✅ 管理后台Hero管理页面：可视化内容编辑 + 状态管理
- ✅ 动态交互功能：鼠标悬停切换内容 + 实时状态反馈
- ✅ 5个导航菜单内容：MUSIC、SKIING、TECH、FISHING、ABOUT
- ✅ 前端数据获取和状态管理：Vue3组合式API + 响应式设计

**🗄️ 数据库模型设计**
- HeroContent表：id, type, title, subtitle, description, image, active, order
- 5个导航类型：music, skiing, tech, fishing, about
- 支持排序和激活状态管理
- 创建时间和更新时间自动记录

**🔧 API接口架构**
- GET /api/hero - 获取所有激活的Hero内容
- GET /api/hero/[type] - 根据类型获取Hero内容
- GET /api/admin/hero - 管理后台获取所有Hero内容
- POST /api/admin/hero - 创建新的Hero内容
- PUT /api/admin/hero/[id] - 更新Hero内容
- DELETE /api/admin/hero/[id] - 删除Hero内容

**🎨 管理后台界面**
- AdminHero组件：完整的Hero内容管理界面
- 可视化编辑：类型选择、标题、副标题、描述、图片、状态
- 实时预览：类型徽章、状态指示器、更新时间
- 操作功能：新增、编辑、删除、启用/禁用
- 响应式设计：移动端适配

**⚡ 前端交互功能**
- 鼠标悬停事件：handleMenuHover函数监听
- 状态管理：activeHero响应式数据
- 动态内容切换：标题、副标题、描述实时更新
- 视觉反馈：激活状态高亮显示
- 平滑过渡：0.3s CSS transition效果

### v0.1.6 (2025-07-15) - Google字体系统与Hero区域完美优化
**🎯 主要更新**
- ✅ 字体系统升级：Special Gothic Expanded One + Noto Sans CJK
- ✅ Hero区域布局完善：图片尺寸优化 + 信息板块重构
- ✅ 反色动画精致化：由左向右滑动 + 精确字体覆盖
- ✅ 导航布局优化：英日文上下排列 + 搜索框尺寸调整
- ✅ 去除分割线：无缝Hero布局 + 图片左移定位

**🎨 字体方案**
- 标题字体：Special Gothic Expanded One (Google Fonts)
- 正文字体：Noto Sans SC/JP (支持中日文)
- 标题尺寸：48px英文 + 16px日文，上下垂直布局
- 字体加载：预连接优化 + display=swap策略

**🖼️ Hero区域优化**
- 图片尺寸：700px × 500px，向左偏移70px
- 信息板块：600px × 120px，靠右对齐，向上覆盖30px
- 搜索框：300px × 40px，紧凑设计
- 布局间距：顶部40px预留 + 无分割线设计

**⚡ 反色动画特效**
- 动画方向：由左向右滑动(0.4s)
- 覆盖范围：精确匹配文字内容边界
- 层级管理：背景z-index:1，文字z-index:2
- 颜色变化：黑色→白色文字，黑色背景衬托

**🔧 双语导航内容**
- MUSIC → 音楽 (上下布局)
- SKIING → スキー (上下布局)
- TECH → テクノロジー (上下布局)
- FISHING → 釣り (上下布局)
- ABOUT → プロフィール (上下布局)

### v0.1.5 (2025-07-14) - Hero导航JCSKI风格优化
**🎯 主要更新**
- ✅ Hero左侧导航JCSKI风格重构：双语显示（英文+日文）
- ✅ 导航链接统一化：与顶部导航保持一致的路径
- ✅ 字体大小专业化：英文48px，日文16px，符合JCSKI设计风格
- ✅ 间距紧凑化：菜单项间距8px，行高优化为0.9/1.0
- ✅ 去除装饰元素：移除横线分隔，更简洁专业
- ✅ 响应式优化：移动端字体和间距自适应调整

### v0.1.4 (2025-07-14) - 内容管理系统完善
**🎯 主要更新**
- ✅ 完善内容管理系统API：完整的CRUD操作
- ✅ 实现用户认证系统：JWT登录 + 权限管理
- ✅ 媒体管理系统：图片和音频文件上传/管理
- ✅ 管理后台界面：完整的AdminPosts、AdminMedia、AdminSettings组件
- ✅ 数据库架构：Prisma + SQLite，支持完整的博客数据模型
- ✅ 默认管理员账户：admin@jcski.com / admin123456

**🔧 新增API接口**
- POST /api/auth/login - 用户登录
- GET/POST/PUT/DELETE /api/admin/posts/* - 文章管理
- GET/POST/DELETE /api/admin/media/* - 媒体管理
- GET/PUT /api/admin/settings - 站点设置
- GET /api/admin/stats - 统计数据

**🎨 技术改进**
- 完整的TypeScript类型定义
- JWT认证中间件
- 文件上传处理（multer）
- 数据库迁移和初始化脚本
- 响应式管理后台界面

### v0.1.3 (2025-01-14) - 个人博客导航系统完善
**🎯 主要更新**
- ✅ A板块顶部导航重构：改为5个个人博客领域
- ✅ 完整子页面生成：MUSIC、SKIING、TECH、FISHING、ABOUT
- ✅ 统一页面架构：每页面都有专属设计和预设内容
- ✅ 导航状态管理：当前页面高亮 + 流畅页面跳转
- ✅ SEO全面优化：每页面独立标题、描述、关键词

**🎨 设计特色**
- 每个子页面都有独特的渐变色彩主题
- 统一的页面头部、内容区域、底部设计
- 完整的文章列表和分类预设
- 专业的响应式布局适配

### v0.1.2 (2025-01-14) - Hero区域框架化布局
**🎯 主要更新**
- ✅ Hero区域重新设计：4:6比例左右分割
- ✅ 删除重复侧边导航：避免冗余设计
- ✅ 去除黑色边框：更简洁的视觉效果
- ✅ 页面内容居中：1200px最大宽度容器

### v0.1.0 (2025-01-14) - JCSKI风格完整重构
**🎯 主要更新**
- ✅ 完全按照JCSKI原创设计理念
- ✅ 天空Hero区域：蓝天渐变 + 太阳云朵
- ✅ 专业新闻网格：2:1:1三列布局
- ✅ 彩色TOPICS板块：4个主题卡片
- ✅ 黑色Footer设计：完整信息架构

---

## 🎯 快速导航

### 📖 常用页面
- 🏠 **主页**: http://localhost:3222/
- 🎵 **音乐**: http://localhost:3222/music  
- 🎿 **滑雪**: http://localhost:3222/skiing
- 💻 **科技**: http://localhost:3222/tech
- 🎣 **钓鱼**: http://localhost:3222/fishing
- 👤 **关于**: http://localhost:3222/about
- 🔐 **管理登录**: http://localhost:3222/admin/login
- 🛠️ **管理后台**: http://localhost:3222/admin

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

---

*最后更新: 2025-07-19 | 当前版本: v0.4.0*