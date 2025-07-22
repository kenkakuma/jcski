// JCSKI Blog JSON-LD结构化数据管理 Composable
import type { ArticleSEOData } from '~/utils/seo'
import { 
  generateWebsiteStructuredData, 
  generateBreadcrumbStructuredData,
  generateBlogStructuredData,
  generateOrganizationStructuredData,
  generateSearchActionStructuredData
} from '~/composables/useSEO'

/**
 * JSON-LD结构化数据管理的专用Composable
 */
export const useJsonLD = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'https://jcski.com'

  /**
   * 为文章页面生成完整的JSON-LD结构化数据集合
   */
  const generateArticleJsonLD = (article: any): object[] => {
    const jsonLDData: object[] = []

    // 1. 基础网站结构化数据
    jsonLDData.push(generateWebsiteStructuredData())

    // 2. 文章BlogPosting结构化数据
    const articleStructured = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${baseUrl}/posts/${article.slug}`,
      'url': `${baseUrl}/posts/${article.slug}`,
      'headline': article.title,
      'description': article.excerpt || article.title,
      'articleBody': article.content,
      'author': {
        '@type': 'Person',
        '@id': `${baseUrl}/about#person`,
        'name': article.author?.username || 'JCSKI',
        'url': `${baseUrl}/about`
      },
      'publisher': {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        'name': 'JCSKI BLOG',
        'logo': {
          '@type': 'ImageObject',
          'url': `${baseUrl}/images/logo.png`,
          'width': 200,
          'height': 60
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${baseUrl}/posts/${article.slug}`
      },
      'image': {
        '@type': 'ImageObject',
        'url': article.featuredImage || article.coverImage || `${baseUrl}/images/${article.category?.toLowerCase() || 'news'}.webp`,
        'width': 1200,
        'height': 630
      },
      'datePublished': article.createdAt,
      'dateModified': article.updatedAt || article.createdAt,
      'articleSection': article.category,
      'keywords': Array.isArray(article.tags) 
        ? article.tags.join(', ') 
        : (typeof article.tags === 'string' 
          ? JSON.parse(article.tags || '[]').join(', ')
          : ''),
      'wordCount': calculateWordCount(article.content || ''),
      'timeRequired': `PT${calculateReadingTime(article.content || '')}M`,
      'inLanguage': 'ja-JP',
      'isAccessibleForFree': true,
      'copyrightHolder': {
        '@type': 'Person',
        'name': 'JCSKI'
      },
      'copyrightYear': new Date(article.createdAt).getFullYear()
    }

    // 如果文章被置顶，添加特殊标记
    if (article.isPinned) {
      articleStructured['@type'] = ['BlogPosting', 'Article']
      articleStructured['articleSection'] = 'Featured'
    }

    jsonLDData.push(articleStructured)

    // 3. 面包屑导航
    const breadcrumbItems = [
      { name: 'HOME', url: baseUrl },
      { name: 'BLOG', url: `${baseUrl}#blog` },
      { name: article.title, url: `${baseUrl}/posts/${article.slug}` }
    ]
    
    jsonLDData.push(generateBreadcrumbStructuredData(breadcrumbItems))

    return jsonLDData
  }

  /**
   * 为分类页面生成JSON-LD结构化数据
   */
  const generateCategoryJsonLD = (category: string): object[] => {
    const jsonLDData: object[] = []

    // 1. 基础网站结构化数据
    jsonLDData.push(generateWebsiteStructuredData())

    // 2. 分类页面结构化数据
    const categoryNames: Record<string, {ja: string, en: string, description: string}> = {
      'MUSIC': {
        ja: '音楽',
        en: 'Music',
        description: '音楽制作、楽器、DTM、音響機材に関する記事'
      },
      'TECH': {
        ja: 'テクノロジー', 
        en: 'Technology',
        description: 'Web開発、プログラミング、最新技術トレンドに関する記事'
      },
      'SKIING': {
        ja: 'スキー',
        en: 'Skiing', 
        description: 'スキー技術、用品、ゲレンデ情報に関する記事'
      },
      'FISHING': {
        ja: '釣り',
        en: 'Fishing',
        description: '釣り技術、用品、釣り場情報に関する記事'
      },
      'ABOUT': {
        ja: 'プロフィール',
        en: 'About',
        description: 'JCSKI（ジェーシースキー）のプロフィール情報'
      }
    }

    const categoryInfo = categoryNames[category.toUpperCase()]
    
    if (categoryInfo) {
      const categoryStructured = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${baseUrl}/${category.toLowerCase()}#page`,
        'url': `${baseUrl}/${category.toLowerCase()}`,
        'name': `${categoryInfo.en} - ${categoryInfo.ja} | JCSKI BLOG`,
        'description': categoryInfo.description,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${baseUrl}#website`
        },
        'about': {
          '@type': 'Thing',
          'name': categoryInfo.ja,
          'description': categoryInfo.description
        },
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'HOME',
              'item': baseUrl
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': `${categoryInfo.en} - ${categoryInfo.ja}`,
              'item': `${baseUrl}/${category.toLowerCase()}`
            }
          ]
        },
        'inLanguage': 'ja-JP'
      }

      jsonLDData.push(categoryStructured)
    }

    return jsonLDData
  }

  /**
   * 为首页生成JSON-LD结构化数据
   */
  const generateHomePageJsonLD = (): object[] => {
    const jsonLDData: object[] = []

    // 1. 基础网站结构化数据
    jsonLDData.push(generateWebsiteStructuredData())

    // 2. Blog结构化数据
    jsonLDData.push(generateBlogStructuredData())

    // 3. Organization结构化数据
    jsonLDData.push(generateOrganizationStructuredData())

    // 4. 搜索功能结构化数据
    jsonLDData.push(generateSearchActionStructuredData())

    // 5. 主页WebPage结构化数据
    const homePageStructured = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${baseUrl}#webpage`,
      'url': baseUrl,
      'name': 'JCSKI BLOG - 個人ブログ | 音楽・スキー・テクノロジー・釣り',
      'description': 'JCSKI（ジェーシースキー）の個人ブログ。音楽制作、スキー、最新テクノロジー、釣りに関する記事を発信しています。専門的な知識と実体験を基にした詳しい情報をお届けします。',
      'isPartOf': {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`
      },
      'primaryImageOfPage': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/images/og-default.jpg`,
        'width': 1200,
        'height': 630
      },
      'datePublished': '2025-07-13',
      'dateModified': new Date().toISOString().split('T')[0],
      'inLanguage': 'ja-JP',
      'potentialAction': [
        {
          '@type': 'ReadAction',
          'target': baseUrl
        },
        {
          '@type': 'SearchAction',
          'target': `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      ]
    }

    jsonLDData.push(homePageStructured)

    return jsonLDData
  }

  /**
   * 应用JSON-LD结构化数据到页面
   */
  const applyJsonLD = (jsonLDArray: object[]) => {
    const scripts = jsonLDArray.map(data => ({
      type: 'application/ld+json',
      children: JSON.stringify(data)
    }))

    useHead({
      script: scripts
    })
  }

  return {
    generateArticleJsonLD,
    generateCategoryJsonLD,
    generateHomePageJsonLD,
    applyJsonLD
  }
}

// 辅助函数
function calculateWordCount(content: string): number {
  if (!content) return 0
  
  const japaneseChars = content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []
  const englishWords = content.match(/[A-Za-z0-9]+/g) || []
  
  return japaneseChars.length + englishWords.length
}

function calculateReadingTime(content: string): number {
  if (!content) return 1
  
  const japaneseChars = content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []
  const englishWords = content.match(/[A-Za-z0-9]+/g) || []
  
  const japaneseTime = japaneseChars.length / 400
  const englishTime = englishWords.length / 200
  
  const totalMinutes = japaneseTime + englishTime
  return Math.max(1, Math.ceil(totalMinutes))
}