import { prisma } from '~/lib/prisma'
import { verifyToken } from '~/utils/auth'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'

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
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
      filter: ({ mimetype }) => {
        // Only allow images and audio files
        return mimetype && (mimetype.startsWith('image/') || mimetype.startsWith('audio/'))
      }
    })

    const [fields, files] = await form.parse(event.node.req)
    
    const uploadedFiles = []
    const fileList = Array.isArray(files.file) ? files.file : [files.file].filter(Boolean)

    for (const file of fileList) {
      if (!file) continue

      // Generate unique filename
      const ext = path.extname(file.originalFilename || '')
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`
      const newPath = path.join(uploadDir, uniqueName)

      // Move file to final location
      await fs.rename(file.filepath, newPath)

      // Determine file type
      const fileType = file.mimetype?.startsWith('image/') ? 'image' : 
                      file.mimetype?.startsWith('audio/') ? 'audio' : 'other'

      // Save to database
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