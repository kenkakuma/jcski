import { prisma } from '~/lib/prisma'
import { verifyToken } from '~/utils/auth'
import multer from 'multer'
import path from 'path'
import { promises as fs } from 'fs'

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

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

  return new Promise((resolve, reject) => {
    upload.single('file')(event.node.req, event.node.res, async (err) => {
      if (err) {
        reject(createError({
          statusCode: 400,
          statusMessage: err.message
        }))
        return
      }

      const file = event.node.req.file
      if (!file) {
        reject(createError({
          statusCode: 400,
          statusMessage: 'No file uploaded'
        }))
        return
      }

      try {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'audio'
        const relativePath = `/uploads/${file.filename}`
        
        const mediaFile = await prisma.mediaFile.create({
          data: {
            filename: file.filename,
            originalName: file.originalname,
            path: relativePath,
            mimetype: file.mimetype,
            size: file.size,
            type: fileType
          }
        })

        resolve({
          success: true,
          data: mediaFile
        })
      } catch (error) {
        reject(createError({
          statusCode: 500,
          statusMessage: 'Failed to save file info'
        }))
      }
    })
  })
})