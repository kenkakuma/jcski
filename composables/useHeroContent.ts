/**
 * Hero内容管理 Composable
 * 
 * 功能:
 * - 从 Content Studio 读取 Hero 配置
 * - 提供统一的 Hero 内容接口
 * - 支持备用数据库数据源
 */

export interface HeroContent {
  menuItem: string
  title: string
  subtitle: string
  description: string
  isActive: boolean
  displayOrder: number
}

export interface HeroConfig {
  [key: string]: {
    title: string
    subtitle: string
    description: string
    active: boolean
    order: number
  }
}

/**
 * 转换Content配置格式为HeroContent格式
 */
function transformHeroConfig(config: HeroConfig): HeroContent[] {
  return Object.entries(config).map(([key, value]) => ({
    menuItem: key,
    title: value.title,
    subtitle: value.subtitle,
    description: value.description,
    isActive: value.active,
    displayOrder: value.order
  }))
}

/**
 * 获取Hero内容（混合数据源）
 */
export function useHeroContent() {
  return useAsyncData('hero-content', async () => {
    try {
      // 优先从 Content Studio 获取
      const heroConfig = await queryContent('/hero/config').findOne()
      
      if (heroConfig && Object.keys(heroConfig).length > 0) {
        // 提取frontmatter数据
        const configData: HeroConfig = {}
        
        // 从frontmatter中提取hero配置
        Object.keys(heroConfig).forEach(key => {
          if (key !== '_path' && key !== '_dir' && key !== '_draft' && key !== '_partial' && key !== '_locale' && key !== '_type' && key !== '_id' && key !== '_source' && key !== '_file' && key !== '_extension' && key !== 'body' && key !== 'excerpt' && key !== 'title' && key !== 'description') {
            configData[key] = heroConfig[key]
          }
        })
        
        if (Object.keys(configData).length > 0) {
          const heroData = transformHeroConfig(configData)
          
          console.log('✅ Hero内容从Content Studio加载成功:', heroData.length, '项')
          return heroData
        }
      }
      
      // 备用：从数据库API获取
      console.log('⚠️ Content Studio Hero配置为空，尝试从数据库获取...')
      
      const databaseHero = await $fetch('/api/hero').catch(error => {
        console.warn('数据库Hero内容获取失败:', error)
        return []
      })
      
      if (Array.isArray(databaseHero) && databaseHero.length > 0) {
        console.log('✅ Hero内容从数据库加载成功:', databaseHero.length, '项')
        return databaseHero
      }
      
      // 如果都失败，返回默认配置
      console.log('⚠️ 使用默认Hero配置')
      return [
        {
          menuItem: 'music',
          title: '音楽の世界',
          subtitle: '音楽制作・発見',
          description: '音楽制作、器具レビュー、新しい音楽の発見について。クリエイティブな音楽体験をお届けします。',
          isActive: true,
          displayOrder: 1
        },
        {
          menuItem: 'skiing',
          title: 'スキーの冒険',
          subtitle: 'スキー・スノーボード',
          description: 'スキー技術、装備レビュー、雪山の魅力を共有。ウィンタースポーツの楽しさを発見しましょう。',
          isActive: true,
          displayOrder: 2
        },
        {
          menuItem: 'tech',
          title: 'テクノロジー',
          subtitle: '技術・プログラミング',
          description: 'Web開発、AI技術、最新テクノロジーについて。プログラミングの世界を探求します。',
          isActive: true,
          displayOrder: 3
        },
        {
          menuItem: 'fishing',
          title: '釣りの世界',
          subtitle: '釣り・アウトドア',
          description: '釣り技術、装備情報、釣り場レポート。自然との触れ合いを通じた体験を共有します。',
          isActive: true,
          displayOrder: 4
        },
        {
          menuItem: 'about',
          title: 'プロフィール',
          subtitle: '私について',
          description: 'JCSKIの紹介、ブログの理念、連絡先について。このブログの背景と目的をご紹介します。',
          isActive: true,
          displayOrder: 5
        }
      ]
      
    } catch (error) {
      console.error('Hero内容获取失败:', error)
      throw error
    }
  })
}

/**
 * 根据menuItem获取特定Hero内容
 */
export function useHeroItem(menuItem: string) {
  return useAsyncData(`hero-item-${menuItem}`, async () => {
    const { data: heroData } = await useHeroContent()
    
    if (!heroData.value) return null
    
    return heroData.value.find(item => item.menuItem === menuItem) || null
  })
}