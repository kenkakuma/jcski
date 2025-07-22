// JCSKI Blog SEO工具库 - 动态Meta标签系统
export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  category?: string
  locale?: string
  siteName?: string
}

export interface ArticleSEOData extends SEOData {
  excerpt: string
  readingTime?: number
  wordCount?: number
}

// 基础SEO配置
export const DEFAULT_SEO: SEOData = {
  title: 'JCSKI BLOG - 個人ブログ | 音楽・スキー・テクノロジー・釣り',
  description: 'JCSKI（ジェーシースキー）の個人ブログ。音楽制作、スキー、最新テクノロジー、釣りに関する記事を発信しています。専門的な知識と実体験を基にした詳しい情報をお届けします。',
  keywords: ['JCSKI', '音楽', 'スキー', 'テクノロジー', '釣り', '個人ブログ', 'ライフスタイル'],
  type: 'website',
  locale: 'ja_JP',
  siteName: 'JCSKI BLOG',
  image: '/images/og-default.jpg'
}

// 分类页面SEO配置
export const CATEGORY_SEO: Record<string, Partial<SEOData>> = {
  MUSIC: {
    title: 'MUSIC - 音楽制作と音響技術 | JCSKI BLOG',
    description: '音楽制作、DAW操作、音響機材のレビューと使い方。プロ仕様の楽曲制作テクニックから初心者向けの基礎知識まで幅広く解説します。',
    keywords: ['音楽制作', 'DAW', '楽器', 'DTM', 'ミキシング', 'マスタリング'],
    image: '/images/music.webp'
  },
  SKIING: {
    title: 'SKIING - スキー技術と雪山情報 | JCSKI BLOG', 
    description: 'スキー技術の上達法、スキー場情報、ウィンタースポーツ用品レビュー。初心者から上級者まで役立つスキー情報をお届けします。',
    keywords: ['スキー', 'スノーボード', 'ウィンタースポーツ', 'ゲレンデ', 'スキー用品'],
    image: '/images/skiing.webp'
  },
  TECH: {
    title: 'TECH - 最新テクノロジーと開発技術 | JCSKI BLOG',
    description: 'Web開発、プログラミング、最新テクノロジーのトレンド解説。Vue.js、React、Node.jsなどのフレームワーク情報も充実。',
    keywords: ['プログラミング', 'Web開発', 'JavaScript', 'Vue.js', 'React', 'Node.js'],
    image: '/images/tech.webp'
  },
  FISHING: {
    title: 'FISHING - 釣り技術と釣り場情報 | JCSKI BLOG',
    description: '釣り技術、釣り場レポート、釣具レビュー。海釣りから渓流釣りまで、実践的な釣り情報を詳しく紹介します。',
    keywords: ['釣り', '海釣り', '川釣り', '釣具', 'フィッシング', '釣り場'],
    image: '/images/fishing.webp'
  },
  ABOUT: {
    title: 'ABOUT - JCSKIについて | JCSKI BLOG',
    description: 'JCSKI（ジェーシースキー）のプロフィール、経歴、スキル、連絡先情報。音楽制作からWeb開発まで幅広い分野で活動しています。',
    keywords: ['JCSKI', 'プロフィール', '経歴', 'スキル', '連絡先'],
    type: 'profile',
    image: '/images/about-avatar.jpg'
  }
}

/**
 * 文字列から読み取り時間を計算（日本語対応）
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1
  
  // 日本語文字数計算（ひらがな、カタカナ、漢字、英数字）
  const japaneseChars = content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []
  const englishWords = content.match(/[A-Za-z0-9]+/g) || []
  
  // 日本語: 1分間に約400文字、英語: 1分間に約200語
  const japaneseTime = japaneseChars.length / 400
  const englishTime = englishWords.length / 200
  
  const totalMinutes = japaneseTime + englishTime
  return Math.max(1, Math.ceil(totalMinutes))
}

/**
 * 文字数カウント
 */
export function countWords(content: string): number {
  if (!content) return 0
  
  const japaneseChars = content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []
  const englishWords = content.match(/[A-Za-z0-9]+/g) || []
  
  return japaneseChars.length + englishWords.length
}

/**
 * 記事のSEOデータを生成
 */
export function generateArticleSEO(article: any, baseUrl: string = ''): ArticleSEOData {
  const readingTime = calculateReadingTime(article.content || '')
  const wordCount = countWords(article.content || '')
  
  const seoData: ArticleSEOData = {
    title: `${article.title} | JCSKI BLOG`,
    description: article.excerpt || article.title,
    excerpt: article.excerpt || '',
    keywords: [
      'JCSKI',
      ...(article.tags || []),
      article.category,
      ...(CATEGORY_SEO[article.category]?.keywords || [])
    ].filter(Boolean),
    image: optimizeSocialImage(article, article.category),
    url: baseUrl ? `${baseUrl}/posts/${article.slug}` : `/posts/${article.slug}`,
    type: 'article',
    author: article.author?.username || 'JCSKI',
    publishedTime: article.createdAt,
    modifiedTime: article.updatedAt,
    tags: article.tags || [],
    category: article.category,
    locale: 'ja_JP',
    siteName: 'JCSKI BLOG',
    readingTime,
    wordCount
  }
  
  return seoData
}

/**
 * カテゴリページのSEOデータを生成
 */
export function generateCategorySEO(category: string, baseUrl: string = ''): SEOData {
  const categoryData = CATEGORY_SEO[category.toUpperCase()]
  
  if (!categoryData) {
    return {
      ...DEFAULT_SEO,
      url: baseUrl ? `${baseUrl}/${category.toLowerCase()}` : `/${category.toLowerCase()}`
    }
  }
  
  return {
    ...DEFAULT_SEO,
    ...categoryData,
    url: baseUrl ? `${baseUrl}/${category.toLowerCase()}` : `/${category.toLowerCase()}`
  }
}

/**
 * ホームページのSEOデータを生成
 */
export function generateHomeSEO(baseUrl: string = ''): SEOData {
  return {
    ...DEFAULT_SEO,
    url: baseUrl,
    image: optimizeSocialImage(null, 'HOME')
  }
}

/**
 * Meta要素のHTML文字列を生成
 */
export function generateMetaTags(seo: SEOData): Array<{[key: string]: string}> {
  const tags: Array<{[key: string]: string}> = []
  
  // 基本的なメタタグ
  if (seo.description) {
    tags.push({ name: 'description', content: seo.description })
  }
  
  if (seo.keywords && seo.keywords.length > 0) {
    tags.push({ name: 'keywords', content: seo.keywords.join(', ') })
  }
  
  if (seo.author) {
    tags.push({ name: 'author', content: seo.author })
  }
  
  // Open Graph タグ - v0.5.0 最適化
  tags.push({ property: 'og:title', content: optimizeForSEO(seo.title, 95) }) // OG title max length
  tags.push({ property: 'og:description', content: optimizeForSEO(seo.description, 300) }) // OG description max length
  tags.push({ property: 'og:type', content: seo.type || 'website' })
  tags.push({ property: 'og:site_name', content: seo.siteName || 'JCSKI BLOG' })
  tags.push({ property: 'og:locale', content: seo.locale || 'ja_JP' })
  
  // プライマリロケール追加
  tags.push({ property: 'og:locale:alternate', content: 'en_US' })
  
  if (seo.url) {
    tags.push({ property: 'og:url', content: seo.url })
  }
  
  // 画像の完全URL確保とalt属性最適化
  if (seo.image) {
    const imageUrl = seo.image.startsWith('http') ? seo.image : `https://jcski.com${seo.image}`
    tags.push({ property: 'og:image', content: imageUrl })
    tags.push({ property: 'og:image:secure_url', content: imageUrl }) // HTTPS版も明示
    tags.push({ property: 'og:image:type', content: getImageMimeType(seo.image) })
    tags.push({ property: 'og:image:width', content: '1200' })
    tags.push({ property: 'og:image:height', content: '630' })
    tags.push({ property: 'og:image:alt', content: generateImageAltText(seo) })
  }
  
  // サイト固有の情報追加
  if (seo.type === 'website' || seo.type === 'blog') {
    tags.push({ property: 'og:determiner', content: 'auto' })
  }
  
  // 記事のリッチプレビュー用追加情報
  if (seo.type === 'article' && (seo as ArticleSEOData).readingTime) {
    const readingTime = (seo as ArticleSEOData).readingTime
    tags.push({ property: 'og:description', content: `${seo.description} （読み時間: 約${readingTime}分）` })
  }
  
  // 記事固有のメタタグ
  if (seo.type === 'article') {
    if (seo.author) {
      tags.push({ property: 'article:author', content: seo.author })
    }
    if (seo.publishedTime) {
      tags.push({ property: 'article:published_time', content: seo.publishedTime })
    }
    if (seo.modifiedTime) {
      tags.push({ property: 'article:modified_time', content: seo.modifiedTime })
    }
    if (seo.category) {
      tags.push({ property: 'article:section', content: seo.category })
    }
    if (seo.tags && seo.tags.length > 0) {
      seo.tags.forEach(tag => {
        tags.push({ property: 'article:tag', content: tag })
      })
    }
  }
  
  // Twitter Card タグ - v0.5.0 最適化
  tags.push({ name: 'twitter:card', content: 'summary_large_image' })
  tags.push({ name: 'twitter:site', content: '@JCSKI' })
  tags.push({ name: 'twitter:creator', content: '@JCSKI' })
  tags.push({ name: 'twitter:title', content: optimizeForSEO(seo.title, 70) }) // Twitter title max length
  tags.push({ name: 'twitter:description', content: optimizeForSEO(seo.description, 200) }) // Twitter description max length
  
  if (seo.image) {
    const imageUrl = seo.image.startsWith('http') ? seo.image : `https://jcski.com${seo.image}`
    tags.push({ name: 'twitter:image', content: imageUrl })
    tags.push({ name: 'twitter:image:alt', content: generateImageAltText(seo) })
  }
  
  // 記事専用Twitter情報
  if (seo.type === 'article') {
    tags.push({ name: 'twitter:label1', content: 'カテゴリー' })
    tags.push({ name: 'twitter:data1', content: seo.category || 'BLOG' })
    
    const articleSeo = seo as ArticleSEOData
    if (articleSeo.readingTime) {
      tags.push({ name: 'twitter:label2', content: '読み時間' })
      tags.push({ name: 'twitter:data2', content: `約${articleSeo.readingTime}分` })
    }
  }
  
  // Facebook App ID (将来の使用のため)
  // tags.push({ property: 'fb:app_id', content: 'YOUR_APP_ID' })
  
  return tags
}

/**
 * 文字列をSEO適応形式に変換（タイトル用）
 */
export function optimizeForSEO(text: string, maxLength: number = 60): string {
  if (!text) return ''
  
  // HTMLタグを除去
  const cleanText = text.replace(/<[^>]*>/g, '')
  
  // 長さを制限
  if (cleanText.length <= maxLength) {
    return cleanText
  }
  
  return cleanText.slice(0, maxLength - 3) + '...'
}

/**
 * Slugから適切なOG画像を推測
 */
export function getOGImageFromSlug(slug: string, category?: string): string {
  // カテゴリがある場合
  if (category && CATEGORY_SEO[category.toUpperCase()]?.image) {
    return CATEGORY_SEO[category.toUpperCase()]?.image || DEFAULT_SEO.image || ''
  }
  
  // Slugからカテゴリを推測
  if (slug.includes('music') || slug.includes('音楽')) {
    return '/images/music.webp'
  }
  if (slug.includes('ski') || slug.includes('スキー')) {
    return '/images/skiing.webp'
  }
  if (slug.includes('tech') || slug.includes('テクノロジー')) {
    return '/images/tech.webp'
  }
  if (slug.includes('fish') || slug.includes('釣り')) {
    return '/images/fishing.webp'
  }
  
  return DEFAULT_SEO.image || ''
}

/**
 * 画像ファイルのMIMEタイプを推定
 */
export function getImageMimeType(imageUrl: string): string {
  const extension = imageUrl.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'image/jpeg'
  }
}

/**
 * SEOデータに基づいた画像のalt属性を生成
 */
export function generateImageAltText(seo: SEOData): string {
  const elements = []
  
  // カテゴリーがある場合は含める
  if (seo.category && seo.category !== 'BLOG') {
    const categoryNames: Record<string, string> = {
      'MUSIC': '音楽制作',
      'TECH': 'テクノロジー',
      'SKIING': 'スキー',
      'FISHING': '釣り'
    }
    elements.push(categoryNames[seo.category] || seo.category)
  }
  
  // 記事タイトルまたはページタイトル
  elements.push(seo.title.replace(' | JCSKI BLOG', ''))
  
  // サイト名
  elements.push('JCSKI BLOG')
  
  return elements.join(' - ')
}

/**
 * ソーシャルメディア用画像URL最適化
 * 現有画像リソースの活用とfallback処理
 */
export function optimizeSocialImage(article: any, category?: string): string {
  // 優先順位: featuredImage > coverImage > カテゴリ別デフォルト > サイトデフォルト
  
  // 1. 記事専用の特色画像
  if (article?.featuredImage) {
    return article.featuredImage.startsWith('http') 
      ? article.featuredImage 
      : `https://jcski.com${article.featuredImage}`
  }
  
  // 2. 記事のカバー画像
  if (article?.coverImage) {
    return article.coverImage.startsWith('http') 
      ? article.coverImage 
      : `https://jcski.com${article.coverImage}`
  }
  
  // 3. カテゴリ別デフォルト画像
  const articleCategory = article?.category || category
  if (articleCategory && CATEGORY_SEO[articleCategory.toUpperCase()]?.image) {
    const categoryImage = CATEGORY_SEO[articleCategory.toUpperCase()]?.image
    return categoryImage?.startsWith('http') 
      ? categoryImage 
      : `https://jcski.com${categoryImage}`
  }
  
  // 4. サイト全体のデフォルト画像
  const defaultImage = DEFAULT_SEO.image
  return defaultImage?.startsWith('http') 
    ? defaultImage 
    : `https://jcski.com${defaultImage}`
}

/**
 * v0.5.0 最適化されたSEOデータ生成
 * ソーシャルメディア最適化とOpen Graph強化
 */
export function generateOptimizedSEO(data: Partial<SEOData>, baseUrl: string = 'https://jcski.com'): SEOData {
  return {
    ...DEFAULT_SEO,
    ...data,
    url: data.url || baseUrl,
    image: data.image || optimizeSocialImage(data),
    title: data.title ? optimizeForSEO(data.title, 60) : DEFAULT_SEO.title,
    description: data.description ? optimizeForSEO(data.description, 160) : DEFAULT_SEO.description
  }
}