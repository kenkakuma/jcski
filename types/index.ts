// 博客文章类型
export interface BlogPost {
  id: number
  title: string
  content: string
  excerpt: string
  slug: string
  coverImage?: string
  featuredImage?: string
  audioFile?: string
  tags: string[]
  category: string
  published: boolean
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

// 用户类型
export interface User {
  id: number
  email: string
  username: string
  password: string
  role: 'admin' | 'user'
  createdAt: Date
}

// 媒体文件类型
export interface MediaFile {
  id: number
  filename: string
  originalName: string
  path: string
  mimetype: string
  size: number
  type: 'image' | 'audio'
  createdAt: Date
}

// Hero内容类型
export interface HeroContent {
  id: number
  type: 'music' | 'skiing' | 'tech' | 'fishing' | 'about'
  title: string
  subtitle: string
  description: string
  image?: string
  active: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}