// JCSKI Blog SEO Composable - 动态Meta标签管理
import type { SEOData, ArticleSEOData } from '~/utils/seo'
import { 
  generateMetaTags, 
  generateArticleSEO, 
  generateCategorySEO, 
  generateHomeSEO,
  DEFAULT_SEO
} from '~/utils/seo'

export interface UseSEOOptions {
  title?: string
  description?: string
  image?: string
  keywords?: string[]
  type?: 'website' | 'article' | 'profile'
  locale?: string
}

/**
 * SEO管理のメインComposable
 */
export const useSEO = (initialData?: Partial<SEOData>) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const baseUrl = config.public.baseUrl || 'https://jcski.com'

  // 現在のSEOデータをリアクティブに管理
  const seoData = ref<SEOData>({
    ...DEFAULT_SEO,
    ...initialData,
    url: baseUrl + route.path
  })

  /**
   * SEOデータを更新
   */
  const updateSEO = (newData: Partial<SEOData>) => {
    seoData.value = {
      ...seoData.value,
      ...newData,
      url: newData.url || baseUrl + route.path
    }
  }

  /**
   * Meta tagをページのheadに設定
   */
  const applySEO = () => {
    const metaTags = generateMetaTags(seoData.value)
    
    // ページタイトル
    useHead({
      title: seoData.value.title,
      meta: metaTags.map(tag => ({
        ...(tag.name ? { name: tag.name } : {}),
        ...(tag.property ? { property: tag.property } : {}),
        content: tag.content
      })),
      link: [
        {
          rel: 'canonical',
          href: seoData.value.url
        }
      ]
    })

    // JSON-LD構造化データ - 完整实现
    const scripts = []
    
    // 基础网站结构化数据 - 所有页面都包含
    const websiteData = generateWebsiteStructuredData()
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(websiteData)
    })

    // 根据页面类型添加特定结构化数据
    if (seoData.value.type === 'article') {
      const articleData = generateArticleStructuredData(seoData.value as ArticleSEOData)
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(articleData)
      })
    } else if (seoData.value.type === 'profile') {
      const personData = generatePersonStructuredData()
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(personData)
      })
    } else {
      // 分类页面和首页的面包屑导航
      const breadcrumbItems = generateBreadcrumbItems(route.path)
      if (breadcrumbItems.length > 1) {
        const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbItems)
        scripts.push({
          type: 'application/ld+json',
          children: JSON.stringify(breadcrumbData)
        })
      }
    }

    // 添加Blog结构化数据（首页专用）
    if (route.path === '/') {
      const blogData = generateBlogStructuredData()
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(blogData)
      })
    }

    useHead({
      script: scripts
    })
  }

  /**
   * 記事のSEOデータを設定
   */
  const setArticleSEO = (article: any) => {
    const articleSEO = generateArticleSEO(article, baseUrl)
    updateSEO(articleSEO)
    applySEO()
  }

  /**
   * カテゴリページのSEOデータを設定
   */
  const setCategorySEO = (category: string) => {
    const categorySEO = generateCategorySEO(category, baseUrl)
    updateSEO(categorySEO)
    applySEO()
  }

  /**
   * ホームページのSEOデータを設定
   */
  const setHomeSEO = () => {
    const homeSEO = generateHomeSEO(baseUrl)
    updateSEO(homeSEO)
    applySEO()
  }

  /**
   * カスタムSEOデータを設定
   */
  const setCustomSEO = (options: UseSEOOptions) => {
    updateSEO(options)
    applySEO()
  }

  return {
    seoData: readonly(seoData),
    updateSEO,
    applySEO,
    setArticleSEO,
    setCategorySEO,
    setHomeSEO,
    setCustomSEO
  }
}

/**
 * 記事用のJSON-LD構造化データ生成
 */
function generateArticleStructuredData(seo: ArticleSEOData) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': seo.title,
    'description': seo.description,
    'author': {
      '@type': 'Person',
      'name': seo.author || 'JCSKI',
      'url': `${useRuntimeConfig().public.baseUrl}/about`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'JCSKI BLOG',
      'logo': {
        '@type': 'ImageObject',
        'url': `${useRuntimeConfig().public.baseUrl}/images/logo.png`,
        'width': 200,
        'height': 60
      }
    },
    'datePublished': seo.publishedTime,
    'dateModified': seo.modifiedTime || seo.publishedTime,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': seo.url
    },
    'image': {
      '@type': 'ImageObject',
      'url': seo.image,
      'width': 1200,
      'height': 630
    },
    'articleSection': seo.category,
    'keywords': seo.keywords?.join(', '),
    'wordCount': seo.wordCount,
    'timeRequired': `PT${seo.readingTime}M`,
    'inLanguage': 'ja-JP'
  }

  // タグがある場合は追加
  if (seo.tags && seo.tags.length > 0) {
    structuredData['keywords'] = seo.tags.join(', ')
  }

  return structuredData
}

/**
 * パンくずリスト用のJSON-LD構造化データ生成
 */
export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  }
}

/**
 * ウェブサイト用の基本構造化データ
 */
export function generateWebsiteStructuredData() {
  const config = useRuntimeConfig()
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'JCSKI BLOG',
    'description': 'JCSKI（ジェーシースキー）の個人ブログ。音楽制作、スキー、最新テクノロジー、釣りに関する記事を発信しています。',
    'url': config.public.baseUrl,
    'author': {
      '@type': 'Person',
      'name': 'JCSKI',
      'url': `${config.public.baseUrl}/about`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'JCSKI BLOG',
      'logo': {
        '@type': 'ImageObject',
        'url': `${config.public.baseUrl}/images/logo.png`,
        'width': 200,
        'height': 60
      }
    },
    'inLanguage': 'ja-JP'
  }
}

/**
 * 個人プロフィール用の構造化データ
 */
export function generatePersonStructuredData() {
  const config = useRuntimeConfig()
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': 'JCSKI',
    'description': '音楽制作、Web開発、スキー、釣りに関する専門知識を持つクリエイター',
    'url': `${config.public.baseUrl}/about`,
    'image': `${config.public.baseUrl}/images/about-avatar.jpg`,
    'sameAs': [
      // ソーシャルメディアリンクがある場合は追加
    ],
    'knowsAbout': [
      '音楽制作',
      'Web開発', 
      'スキー',
      '釣り',
      'JavaScript',
      'Vue.js',
      'DTM'
    ],
    'worksFor': {
      '@type': 'Organization',
      'name': 'JCSKI BLOG'
    }
  }
}

/**
 * Blog结构化数据生成（首页专用）
 */
export function generateBlogStructuredData() {
  const config = useRuntimeConfig()
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'JCSKI BLOG',
    'description': 'JCSKI（ジェーシースキー）の個人ブログ。音楽制作、スキー、最新テクノロジー、釣りに関する記事を発信しています。専門的な知識と実体験を基にした詳しい情報をお届けします。',
    'url': config.public.baseUrl,
    'author': {
      '@type': 'Person',
      'name': 'JCSKI',
      'url': `${config.public.baseUrl}/about`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'JCSKI BLOG',
      'logo': {
        '@type': 'ImageObject',
        'url': `${config.public.baseUrl}/images/logo.png`,
        'width': 200,
        'height': 60
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': config.public.baseUrl
    },
    'inLanguage': 'ja-JP',
    'keywords': 'JCSKI, 音楽, スキー, テクノロジー, 釣り, 個人ブログ, ライフスタイル, 技術ブログ',
    'genre': ['テクノロジー', '音楽', 'スキー', '釣り', 'ライフスタイル'],
    'about': [
      {
        '@type': 'Thing',
        'name': '音楽制作',
        'description': 'DTM、楽器、音響機材に関する情報'
      },
      {
        '@type': 'Thing', 
        'name': 'テクノロジー',
        'description': 'Web開発、プログラミング、最新技術トレンド'
      },
      {
        '@type': 'Thing',
        'name': 'スキー',
        'description': 'スキー技術、用品、ゲレンデ情報'
      },
      {
        '@type': 'Thing',
        'name': '釣り',
        'description': '釣り技術、用品、釣り場情報'
      }
    ]
  }
}

/**
 * 面包屑导航路径生成
 */
function generateBreadcrumbItems(path: string): Array<{name: string, url: string}> {
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl
  const items = [{name: 'HOME', url: baseUrl}]
  
  // 路径映射
  const pathMap: Record<string, string> = {
    '/music': 'MUSIC - 音楽',
    '/tech': 'TECH - テクノロジー', 
    '/skiing': 'SKIING - スキー',
    '/fishing': 'FISHING - 釣り',
    '/about': 'ABOUT - プロフィール'
  }
  
  if (pathMap[path]) {
    items.push({
      name: pathMap[path],
      url: baseUrl + path
    })
  }
  
  return items
}

/**
 * Organization结构化数据生成
 */
export function generateOrganizationStructuredData() {
  const config = useRuntimeConfig()
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'JCSKI BLOG',
    'description': 'JCSKI（ジェーシースキー）が運営する個人ブログサイト',
    'url': config.public.baseUrl,
    'logo': {
      '@type': 'ImageObject',
      'url': `${config.public.baseUrl}/images/logo.png`,
      'width': 200,
      'height': 60
    },
    'founder': {
      '@type': 'Person',
      'name': 'JCSKI'
    },
    'foundingDate': '2025',
    'sameAs': [
      // ソーシャルメディアリンクがある場合は追加
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'url': `${config.public.baseUrl}/about`
    }
  }
}

/**
 * 搜索功能结构化数据生成
 */
export function generateSearchActionStructuredData() {
  const config = useRuntimeConfig()
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': config.public.baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${config.public.baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}