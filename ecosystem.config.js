/**
 * JCSKI Blog PM2配置
 * v0.5.0 内存优化 - AWS EC2 t2.micro (1GB RAM) 优化配置
 */
module.exports = {
  apps: [
    {
      name: 'jcski-blog',
      script: 'npm',
      args: 'run preview',
      env_file: '.env.production',
      
      // 实例和集群配置 - 1GB内存限制优化
      instances: 1,                    // 单实例模式，避免内存竞争
      exec_mode: 'fork',              // Fork模式，非cluster模式
      
      // Node.js内存优化参数
      node_args: [
        '--max-old-space-size=512'    // 限制老生代堆内存为512MB
      ],
      
      // PM2内存和性能限制
      max_memory_restart: '600M',     // 内存使用超过600MB时重启
      min_uptime: '30s',             // 最小运行时间30秒才算成功启动
      max_restarts: 5,               // 最大重启次数
      restart_delay: 5000,           // 重启延迟5秒
      
      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3222,
        DATABASE_URL: 'file:/var/www/jcski-blog/prisma/dev.db',
        JWT_SECRET: 'jcski-blog-production-super-secure-jwt-secret-2025',
        BASE_URL: 'https://jcski.com',  // HTTPS URL
        ADMIN_EMAIL: 'admin@jcski.com',
        ADMIN_PASSWORD: 'admin123456',
        
        // Node.js内存和GC优化环境变量 (与node_args重复，移除避免冲突)
        UV_THREADPOOL_SIZE: 4,        // 线程池大小限制
        NODE_NO_WARNINGS: 1           // 禁用警告输出节省内存
      },
      
      // 日志配置优化
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log', 
      log_file: './logs/combined.log',
      time: true,
      log_type: 'json',             // JSON格式日志便于分析
      merge_logs: true,             // 合并多进程日志
      
      // 自动化和监控
      autorestart: true,            // 自动重启
      watch: false,                 // 生产环境不启用文件监控
      ignore_watch: ['node_modules', 'logs'], // 忽略监控目录
      
      // 健康检查和性能监控
      pid_file: './logs/jcski-blog.pid',
      cron_restart: '0 4 * * *',    // 每天凌晨4点重启，清理内存
      
      // 优雅关闭配置
      kill_timeout: 5000,           // 5秒后强制杀死进程
      listen_timeout: 8000,         // 8秒监听超时
      shutdown_with_message: true,  // 关闭时发送消息
      
      // v0.5.0 新增配置
      increment_var: 'PORT',        // 端口增量变量
      source_map_support: false,    // 禁用source map以节省内存
      disable_trace: true,          // 禁用调用栈跟踪以节省CPU
      
      // 错误处理优化
      exp_backoff_restart_delay: 100, // 指数退避重启延迟
      max_restarts_per_hour: 10       // 每小时最大重启次数
    }
  ],
  
  // 全局PM2配置优化
  deploy: {
    production: {
      user: 'ec2-user',
      host: ['54.168.203.21'],
      ref: 'origin/main',
      repo: 'https://github.com/kenkakuma/jcski.git',
      path: '/var/www/jcski-blog',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
}