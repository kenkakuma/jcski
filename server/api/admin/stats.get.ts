import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const [totalPosts, publishedPosts, draftPosts, mediaFiles] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.blogPost.count({ where: { published: false } }),
      prisma.mediaFile.count()
    ])

    return {
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        mediaFiles
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch stats'
    })
  }
})