# GitHub 部署指南

GitHub 提供了多种免费部署方式，让您可以轻松地将工作流记录系统部署到线上。

## 部署方式对比

| 平台 | 免费额度 | 数据库 | 后端支持 | 部署难度 | 推荐度 |
|------|----------|--------|----------|----------|--------|
| Vercel | 100GB 带宽/月 | 需要外部 | ✅ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Railway | $5 额度/月 | 内置 | ✅ | ⭐ | ⭐⭐⭐⭐ |
| Netlify | 100GB 带宽/月 | 需要外部 | ⚠️ | ⭐⭐⭐ | ⭐⭐⭐ |
| GitHub Pages | 1GB 存储 | 无 | ❌ | ⭐⭐⭐⭐ | ⭐⭐ |

## 1. Vercel 部署（推荐）

### 优点
- 自动部署，支持 Git 推送触发
- 全球 CDN，访问速度快
- 免费额度充足
- 支持环境变量和自定义域名

### 部署步骤

1. **Fork 项目到您的 GitHub**
   ```
   点击项目页面右上角的 "Fork" 按钮
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账户登录
   - 点击 "New Project"
   - 选择您 fork 的项目

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   NODE_ENV = production
   JWT_SECRET = your-super-secret-jwt-key
   DB_PATH = /tmp/workflow.db
   ```

4. **自动部署**
   - Vercel 会自动检测到 Node.js 项目
   - 推送到 main 分支会自动部署
   - 访问生成的域名即可使用

### 数据库方案
由于 Vercel 是无服务器环境，需要使用外部数据库：
- **PlanetScale** (MySQL，免费)
- **Supabase** (PostgreSQL，免费)
- **MongoDB Atlas** (MongoDB，免费)

## 2. Railway 部署

### 优点
- 内置数据库支持
- 一键部署
- 支持持久化存储
- 自动 HTTPS

### 部署步骤

1. **Fork 项目**

2. **连接 Railway**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 账户登录
   - 点击 "Deploy from GitHub repo"
   - 选择您的项目

3. **配置环境变量**
   ```
   NODE_ENV = production
   JWT_SECRET = your-super-secret-jwt-key
   PORT = $PORT
   ```

4. **添加数据库**
   - 在 Railway 项目中添加 "PostgreSQL" 服务
   - 系统会自动配置数据库连接

## 3. Netlify 部署

### 优点
- 静态站点优化
- 表单处理
- 免费额度充足

### 限制
- 主要面向静态站点
- 需要额外配置后端功能

### 部署步骤

1. **Fork 项目**

2. **连接 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 使用 GitHub 账户登录
   - 点击 "New site from Git"
   - 选择您的项目

3. **配置构建**
   ```
   Build command: npm run build
   Publish directory: public
   ```

## 4. GitHub Pages 部署

### 优点
- 完全免费
- 与 GitHub 深度集成
- 自动 HTTPS

### 限制
- 仅支持静态内容
- 需要额外配置后端

### 部署步骤

1. **启用 GitHub Pages**
   - 进入项目 Settings
   - 找到 "Pages" 选项
   - 选择 "GitHub Actions" 作为源

2. **配置工作流**
   项目已包含 `.github/workflows/deploy.yml` 文件

3. **推送代码**
   ```bash
   git push origin main
   ```

## 数据库配置

### 方案一：外部数据库（推荐）

#### PlanetScale (MySQL)
```javascript
// 创建 .env 文件
DATABASE_URL=mysql://username:password@host:port/database
```

#### Supabase (PostgreSQL)
```javascript
// 创建 .env 文件
DATABASE_URL=postgresql://username:password@host:port/database
```

#### MongoDB Atlas
```javascript
// 创建 .env 文件
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### 方案二：Railway 内置数据库
Railway 提供内置的 PostgreSQL 数据库，无需额外配置。

## 环境变量配置

### 必需变量
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3000
```

### 可选变量
```env
# 微信提醒
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key
SECRETARY_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=secretary_key

# 数据库
DATABASE_URL=your-database-url

# 文件上传
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=5242880
```

## 部署后配置

### 1. 创建管理员账户
部署完成后，访问您的应用：
```
https://your-app.vercel.app
```

使用默认管理员账户登录：
- 用户名：admin
- 密码：admin123

**重要：** 登录后立即修改密码！

### 2. 配置微信提醒（可选）
1. 在企业微信中创建机器人
2. 获取 webhook URL
3. 在环境变量中配置

### 3. 自定义域名（可选）
- Vercel: 在项目设置中添加自定义域名
- Railway: 在项目设置中配置域名
- Netlify: 在站点设置中添加自定义域名

## 自动化部署

### GitHub Actions 配置
项目已包含自动化部署配置：

- **Vercel**: `.github/workflows/vercel.yml`
- **Railway**: `.github/workflows/railway.yml`
- **GitHub Pages**: `.github/workflows/deploy.yml`

### 触发部署
每次推送到 main 分支都会自动触发部署：
```bash
git add .
git commit -m "Update features"
git push origin main
```

## 监控和维护

### 1. 查看部署状态
- Vercel: 项目 Dashboard
- Railway: 项目 Dashboard
- Netlify: 站点 Dashboard

### 2. 查看日志
- Vercel: Functions 日志
- Railway: 部署日志
- Netlify: 构建日志

### 3. 性能监控
- 使用各平台内置的监控工具
- 配置告警通知

## 故障排除

### 常见问题

1. **部署失败**
   - 检查环境变量配置
   - 查看构建日志
   - 确认依赖安装成功

2. **数据库连接失败**
   - 检查数据库 URL 格式
   - 确认数据库服务可用
   - 检查网络连接

3. **静态资源加载失败**
   - 检查文件路径
   - 确认文件存在
   - 检查权限设置

### 获取帮助
- 查看平台文档
- 提交 GitHub Issue
- 联系平台支持

## 成本估算

### 免费额度
- **Vercel**: 100GB 带宽/月，1000 次函数调用/月
- **Railway**: $5 额度/月
- **Netlify**: 100GB 带宽/月，300 分钟构建时间/月
- **GitHub Pages**: 1GB 存储，100GB 带宽/月

### 升级建议
当用户量增长时，可以考虑：
- 升级到付费计划
- 使用专门的云服务器
- 配置 CDN 加速

## 安全建议

1. **更改默认密码**
2. **使用强密码**
3. **定期更新依赖**
4. **配置 HTTPS**
5. **备份数据**
6. **监控访问日志**

选择适合您需求的部署方式，开始使用您的工作流记录系统吧！
