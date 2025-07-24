import { prisma } from '~/lib/prisma'
import { verifyToken } from '~/utils/auth'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
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

  try {
    // Ensure upload directory exists first
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB - 移除文件大小限制，由压缩后处理
      multiples: true,
      filter: ({ mimetype }) => {
        // 支持更多图片格式和音频文件
        return mimetype && (
          mimetype.startsWith('image/') || 
          mimetype.startsWith('audio/') ||
          mimetype === 'image/svg+xml' ||
          mimetype === 'image/bmp' ||
          mimetype === 'image/tiff' ||
          mimetype === 'image/heic' ||
          mimetype === 'image/heif'
        )
      }
    })

    const [fields, files] = await form.parse(event.node.req)
    
    const uploadedFiles = []
    const fileList = Array.isArray(files.file) ? files.file : [files.file].filter(Boolean)

    for (const file of fileList) {
      if (!file) continue

      const fileType = file.mimetype?.startsWith('image/') ? 'image' : 
                      file.mimetype?.startsWith('audio/') ? 'audio' : 'other'

      let finalPath = file.filepath
      let finalSize = file.size || 0
      let finalMimetype = file.mimetype || 'application/octet-stream'
      
      // Generate unique filename
      const ext = path.extname(file.originalFilename || '')
      const baseName = `${Date.now()}-${Math.random().toString(36).substring(2)}`
      
      if (fileType === 'image' && file.mimetype !== 'image/svg+xml') {
        // 压缩图片到800x600
        try {
          const compressedName = `${baseName}.jpg` // 统一转换为jpg格式
          const compressedPath = path.join(uploadDir, compressedName)
          
          await sharp(file.filepath)
            .resize(800, 600, {
              fit: 'inside', // 保持比例，确保图片不会被拉伸
              withoutEnlargement: true // 如果原图更小则不放大
            })
            .jpeg({
              quality: 85, // 高质量压缩
              progressive: true
            })
            .toFile(compressedPath)
          
          // 删除原始文件
          await fs.unlink(file.filepath)
          
          // 获取压缩后的文件信息
          const compressedStats = await fs.stat(compressedPath)
          finalPath = compressedPath
          finalSize = compressedStats.size
          finalMimetype = 'image/jpeg'
          
          // 最终文件路径
          const uniqueName = compressedName
          const newPath = compressedPath
          
          // Save to database
          const savedFile = await prisma.mediaFile.create({
            data: {
              filename: uniqueName,
              originalName: file.originalFilename || uniqueName,
              path: `/uploads/${uniqueName}`,
              mimetype: finalMimetype,
              size: finalSize,
              type: fileType
            }
          })

          uploadedFiles.push(savedFile)
          
        } catch (compressError) {
          console.error('Image compression failed:', compressError)
          // 如果压缩失败，使用原始文件
          const uniqueName = `${baseName}${ext}`
          const newPath = path.join(uploadDir, uniqueName)
          await fs.rename(file.filepath, newPath)
          
          const savedFile = await prisma.mediaFile.create({
            data: {
              filename: uniqueName,
              originalName: file.originalFilename || uniqueName,
              path: `/uploads/${uniqueName}`,
              mimetype: file.mimetype || 'application/octet-stream',
              size: file.size || 0,
              type: fileType
            }
          })

          uploadedFiles.push(savedFile)
        }
      } else {
        // 非图片文件或SVG文件直接移动
        const uniqueName = `${baseName}${ext}`
        const newPath = path.join(uploadDir, uniqueName)
        await fs.rename(file.filepath, newPath)
        
        const savedFile = await prisma.mediaFile.create({
          data: {
            filename: uniqueName,
            originalName: file.originalFilename || uniqueName,
            path: `/uploads/${uniqueName}`,
            mimetype: file.mimetype || 'application/octet-stream',
            size: file.size || 0,
            type: fileType
          }
        })

        uploadedFiles.push(savedFile)
      }
    }

    return {
      success: true,
      data: {
        files: uploadedFiles,
        message: `成功上传 ${uploadedFiles.length} 个文件`
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'File upload failed'
    })
  }
})