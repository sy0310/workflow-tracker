# 工作流记录系统部署指南

## 部署选项

### 1. 云服务器部署（推荐）

#### 使用Docker部署（最简单）

1. **克隆项目**
```bash
git clone https://github.com/your-username/workflow-tracker.git
cd workflow-tracker
```

2. **配置环境变量**
```bash
cp env.example .env
# 编辑.env文件，设置必要的配置
```

3. **启动服务**
```bash
docker-compose up -d
```

4. **访问系统**
- HTTP: http://your-server-ip
- HTTPS: https://your-server-ip（需要配置SSL证书）

#### 手动部署

1. **安装Node.js**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

2. **安装项目依赖**
```bash
git clone https://github.com/your-username/workflow-tracker.git
cd workflow-tracker
npm install
```

3. **初始化数据库**
```bash
node -e "require('./database').initDatabase().then(() => console.log('数据库初始化完成'))"
```

4. **配置环境变量**
```bash
cp env.example .env
nano .env  # 编辑配置文件
```

5. **启动服务**
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

6. **配置Nginx反向代理（可选）**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 云平台部署

#### Heroku部署

1. **创建Heroku应用**
```bash
heroku create your-app-name
```

2. **设置环境变量**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set WECHAT_WEBHOOK_URL=your-webhook-url
```

3. **部署**
```bash
git push heroku main
```

#### Vercel部署

1. **安装Vercel CLI**
```bash
npm install -g vercel
```

2. **部署**
```bash
vercel --prod
```

#### Railway部署

1. **连接GitHub仓库**
2. **设置环境变量**
3. **自动部署**

### 3. 本地部署（测试用）

```bash
# 克隆项目
git clone https://github.com/your-username/workflow-tracker.git
cd workflow-tracker

# 安装依赖
npm install

# 初始化数据库
node -e "require('./database').initDatabase().then(() => console.log('数据库初始化完成'))"

# 启动服务
npm start
```

访问：http://localhost:3000

## 环境变量配置

### 必需配置
```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 认证密钥（生产环境必须更改）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 数据库路径
DB_PATH=./data/workflow.db
```

### 可选配置
```env
# 微信提醒（可选）
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key
SECRETARY_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=secretary_key

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# 日志
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 安全
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 数据库配置

### SQLite（默认）
- 文件位置：`./data/workflow.db`
- 自动创建，无需额外配置

### PostgreSQL（可选）
如需使用PostgreSQL：
1. 安装pg依赖：`npm install pg`
2. 修改database.js配置
3. 设置DATABASE_URL环境变量

## 安全配置

### 1. 更改默认密钥
```env
JWT_SECRET=your-very-long-and-random-secret-key-here
```

### 2. 配置HTTPS
- 使用Let's Encrypt免费SSL证书
- 或购买商业SSL证书

### 3. 防火墙设置
```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 4. 定期备份
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp data/workflow.db backups/workflow_$DATE.db
```

## 性能优化

### 1. 启用Gzip压缩
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. 静态资源CDN
- 将头像等静态资源上传到CDN
- 配置CDN域名

### 3. 数据库优化
- 定期清理过期数据
- 添加必要的数据库索引

## 监控和日志

### 1. 应用监控
```bash
# 使用PM2管理进程
npm install -g pm2
pm2 start server.js --name workflow-tracker
pm2 startup
pm2 save
```

### 2. 日志管理
```bash
# 配置日志轮转
npm install -g pm2-logrotate
pm2 install pm2-logrotate
```

### 3. 健康检查
- 访问 `/api/staff` 检查服务状态
- 设置监控告警

## 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查找占用端口的进程
lsof -i :3000
# 杀死进程
kill -9 PID
```

2. **数据库权限问题**
```bash
# 设置正确的文件权限
chmod 664 data/workflow.db
chown www-data:www-data data/workflow.db
```

3. **内存不足**
```bash
# 增加swap空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

4. **文件上传失败**
```bash
# 检查上传目录权限
chmod 755 uploads/
chmod 755 uploads/avatars/
```

### 日志查看
```bash
# 查看应用日志
pm2 logs workflow-tracker

# 查看系统日志
journalctl -u your-service-name -f
```

## 维护和更新

### 1. 备份数据
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backups/workflow_backup_$DATE.tar.gz data/ uploads/
```

### 2. 更新应用
```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重启服务
pm2 restart workflow-tracker
```

### 3. 数据库迁移
```bash
# 运行数据库迁移脚本
node scripts/migrate.js
```

## 多用户访问配置

### 1. 注册功能
- 系统支持用户注册
- 默认角色为普通用户
- 管理员可以管理用户

### 2. 权限控制
- 普通用户：创建和管理自己的任务
- 管理员：管理所有用户和任务

### 3. 数据隔离
- 每个用户只能看到自己的任务
- 管理员可以看到所有任务

## 联系和支持

如有问题，请：
1. 查看项目README.md
2. 提交GitHub Issue
3. 联系项目维护者

## 许可证

本项目采用MIT许可证，详见LICENSE文件。
