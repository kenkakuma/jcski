module.exports = {
  apps: [
    {
      name: 'jcski-blog',
      port: '3222',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3222,
        DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
        JWT_SECRET: process.env.JWT_SECRET || 'jcski-blog-production-jwt-secret',
        BASE_URL: process.env.BASE_URL || 'http://localhost:3222',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@jcski.com',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123456'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}