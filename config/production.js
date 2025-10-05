module.exports = {
  // 数据库配置
  database: {
    path: process.env.DB_PATH || './data/workflow.db'
  },

  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
  },

  // 认证配置
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-production-secret-key-change-this',
    tokenExpiration: '7d'
  },

  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  },

  // 微信提醒配置
  wechat: {
    webhookUrl: process.env.WECHAT_WEBHOOK_URL || '',
    secretaryWebhookUrl: process.env.SECRETARY_WEBHOOK_URL || ''
  },

  // 定时任务配置
  cron: {
    checkDeadlines: '0 9 * * *', // 每天9点检查到期任务
    checkUpcoming: '0 * * * *'    // 每小时检查即将到期任务
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  },

  // 安全配置
  security: {
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15分钟
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100 // 每个窗口最大请求数
  }
};
