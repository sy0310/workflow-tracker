const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 导入路由
const staffRoutes = require('./routes/staff');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');

// 使用路由
app.use('/api/staff', staffRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io 连接处理
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

// 定时任务 - 检查任务提醒
cron.schedule('0 9 * * *', () => {
  console.log('执行每日任务提醒检查');
  require('./services/notificationService').checkTaskDeadlines();
});

// 定时任务 - 每小时检查即将到期的任务
cron.schedule('0 * * * *', () => {
  console.log('检查即将到期的任务');
  require('./services/notificationService').checkUpcomingTasks();
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = { app, io };
