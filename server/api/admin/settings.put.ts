import { prisma } from '~/lib/prisma'
import { verifyToken } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'PUT') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const userId = verifyToken(token)
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  const { siteName, siteDescription, heroTitle, heroSubtitle, heroDescription, heroImage, backgroundMusic, socialLinks } = await readBody(event)

  try {
    // 查找现有设置
    const existingSettings = await prisma.siteSettings.findFirst()
    
    const settings = existingSettings
      ? await prisma.siteSettings.update({
          where: { id: existingSettings.id },
          data: {
            siteName: siteName || existingSettings.siteName,
            siteDescription: siteDescription || existingSettings.siteDescription,
            heroTitle: heroTitle || existingSettings.heroTitle,
            heroSubtitle: heroSubtitle || existingSettings.heroSubtitle,
            heroDescription: heroDescription || existingSettings.heroDescription,
            heroImage: heroImage !== undefined ? heroImage : existingSettings.heroImage,
            backgroundMusic: backgroundMusic !== undefined ? backgroundMusic : existingSettings.backgroundMusic,
            socialLinks: socialLinks || existingSettings.socialLinks
          }
        })
      : await prisma.siteSettings.create({
          data: {
            siteName: siteName || 'JCSKI',
            siteDescription: siteDescription || 'Personal Blog',
            heroTitle: heroTitle || 'JCSKI',
            heroSubtitle: heroSubtitle || 'INSPIRE JCSKI いろいろな発見',
            heroDescription: heroDescription || '様々なジャンルを超えた音楽や情報をお届けし、日常生活に新しいインスピレーションをもたらします。',
            heroImage,
            backgroundMusic,
            socialLinks: socialLinks || '[]'
          }
        })

    return {
      success: true,
      data: settings
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update settings'
    })
  }
})