const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const config = require('./config/production');

// 根据环境变量选择数据库
const usePostgres = process.env.DATABASE_URL;
const db = usePostgres ? require('./database-postgres') : require('./database');

const app = express();

// 只在非 Vercel 环境创建 HTTP 服务器和 Socket.IO
let server, io;
if (!process.env.VERCEL) {
  server = http.createServer(app);
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
}

// 中间件
app.use(cors({
  origin: config.security.corsOrigins,
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// 导入路由
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io 连接处理（只在非 Vercel 环境）
if (!process.env.VERCEL && io) {
  io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);
    
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`用户 ${socket.id} 加入房间 ${room}`);
    });
    
    socket.on('disconnect', () => {
      console.log('用户断开连接:', socket.id);
    });
  });
}

// 定时任务 - 只在非 Vercel 环境运行
if (!process.env.VERCEL) {
  // 定时任务 - 检查任务提醒
  cron.schedule(config.cron.checkDeadlines, () => {
    console.log('执行每日任务提醒检查');
    require('./services/notificationService').checkTaskDeadlines();
  });

  // 定时任务 - 每小时检查即将到期的任务
  cron.schedule(config.cron.checkUpcoming, () => {
    console.log('检查即将到期的任务');
    require('./services/notificationService').checkUpcomingTasks();
  });
}

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 登录页面路由
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

const PORT = config.server.port;
const HOST = config.server.host;

// 检查是否在 Vercel 环境
if (process.env.VERCEL) {
  // Vercel 环境：导出应用
  module.exports = app;
} else {
  // 本地环境：启动服务器
  if (server) {
    server.listen(PORT, HOST, () => {
      console.log(`服务器运行在 ${HOST}:${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
  }
  
  module.exports = { app, io };
}
