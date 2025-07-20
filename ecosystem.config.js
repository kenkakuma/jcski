module.exports = {
  apps: [
    {
      name: 'jcski-blog',
      script: './.output/server/index.mjs',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3222,
        DATABASE_URL: 'file:/var/www/jcski-blog/prisma/dev.db',
        JWT_SECRET: 'jcski-blog-production-super-secure-jwt-secret-2025',
        BASE_URL: 'http://jcski.com',
        ADMIN_EMAIL: 'admin@jcski.com',
        ADMIN_PASSWORD: 'admin123456'
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}