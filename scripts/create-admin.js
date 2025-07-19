const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // 检查是否已存在管理员用户
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:')
      console.log('Email:', existingAdmin.email)
      console.log('Username:', existingAdmin.username)
      return
    }

    // 创建管理员用户
    const hashedPassword = await bcrypt.hash('admin123456', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@jcski.com',
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      }
    })

    console.log('Admin user created successfully:')
    console.log('Email:', admin.email)
    console.log('Username:', admin.username)
    console.log('Password: admin123456')
    console.log('Role:', admin.role)

    // 创建默认站点设置
    await prisma.siteSettings.create({
      data: {
        siteName: 'JCSKI BLOG',
        siteDescription: 'JCSKI Personal Blog - J-WAVE Style Tech & Creative Blog',
        heroTitle: 'JCSKI',
        heroSubtitle: 'INSPIRE JCSKI いろいろな発見',
        heroDescription: '様々なジャンルを超えた音楽や情報をお届けし、日常生活に新しいインスピレーションをもたらします。',
        socialLinks: JSON.stringify([
          { name: 'Twitter', url: 'https://twitter.com/jcski', icon: '🐦' },
          { name: 'GitHub', url: 'https://github.com/jcski', icon: '🐱' },
          { name: 'Email', url: 'mailto:contact@jcski.com', icon: '📧' }
        ])
      }
    })

    console.log('Default site settings created')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()