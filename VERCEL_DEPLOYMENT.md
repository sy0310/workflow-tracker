# Vercel 部署完整指南

## 问题解决

### 构建错误修复
已修复以下问题：
- ❌ `cd frontend: No such file or directory` - 移除了不存在的 frontend 目录引用
- ✅ 更新了 `package.json` 构建脚本
- ✅ 优化了 `vercel.json` 配置
- ✅ 添加了 `vercel-build.js` 构建脚本

## 部署步骤

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```env
# 数据库配置
DATABASE_URL=postgresql://postgres.npbudtzlkdbnyjdkusfd:1qazXDR%@aws-1-us-east-2.pooler.supabase.com:6543/postgres

# 认证配置
JWT_SECRET=55ae6d994090168e4a61dfa489acfe322391bfbaa6bdedcaddc82ea94a0b2778cf1e6a572ce1789e94e84655d383c72503c4f7ffd99ed924a5e1021102b04474

# Supabase 配置
SUPABASE_URL=https://npbudtzlkdbnyjdkusfd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wYnVkdHpsa2RibnlqZGt1c2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MjcxOTgsImV4cCI6MjA3NTIwMzE5OH0.O5FqO4FUizF128x4_x854H_Vd2HhJoMIqcn5zeieevE

# 服务器配置
NODE_ENV=production
PORT=3000

# 可选：微信提醒配置
WECHAT_WEBHOOK_URL=
SECRETARY_WEBHOOK_URL=
```

### 2. 部署过程

1. **Fork 项目**
   - 访问 GitHub 项目页面
   - 点击 "Fork" 按钮

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 登录
   - 点击 "New Project"
   - 选择 Fork 的项目

3. **配置项目**
   - 项目名称：`workflow-tracker`（或自定义）
   - Framework Preset：`Other`
   - Root Directory：`./`
   - Build Command：`npm run build`
   - Output Directory：`./`
   - Install Command：`npm install`

4. **添加环境变量**
   - 在项目设置中添加上述环境变量
   - 确保所有变量都设置为 `Production` 环境

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成

### 3. 部署后配置

#### 数据库初始化
部署完成后，需要手动初始化数据库：

1. **访问部署的 URL**
   ```
   https://your-project.vercel.app
   ```

2. **使用默认管理员账户登录**
   - 用户名：`admin`
   - 密码：`admin123`

3. **修改默认密码**
   - 登录后立即修改管理员密码
   - 创建其他用户账户

#### 功能测试
1. **任务管理**
   - 创建新任务
   - 分配负责人
   - 设置优先级和截止时间

2. **人员管理**
   - 添加团队成员
   - 上传头像
   - 设置部门信息

3. **AI 助手**
   - 测试自然语言任务创建
   - 验证自动填表功能

4. **提醒功能**
   - 配置微信提醒（可选）
   - 测试任务状态变更通知

## 故障排除

### 常见问题

1. **构建失败**
   ```
   解决方案：
   - 检查环境变量是否正确配置
   - 确保所有依赖都已安装
   - 查看 Vercel 构建日志
   ```

2. **数据库连接失败**
   ```
   解决方案：
   - 验证 DATABASE_URL 格式
   - 检查 Supabase 项目状态
   - 确认网络连接
   ```

3. **页面无法访问**
   ```
   解决方案：
   - 检查路由配置
   - 验证静态文件路径
   - 查看 Vercel 函数日志
   ```

### 日志查看

1. **Vercel Dashboard**
   - 进入项目页面
   - 点击 "Functions" 标签
   - 查看实时日志

2. **构建日志**
   - 在部署页面查看构建过程
   - 检查错误信息

3. **运行时日志**
   - 在 Functions 页面查看运行时日志
   - 监控应用性能

## 性能优化

### 1. 数据库优化
- 使用连接池
- 添加适当的索引
- 定期清理过期数据

### 2. 缓存策略
- 静态资源缓存
- API 响应缓存
- 数据库查询缓存

### 3. 监控和告警
- 设置性能监控
- 配置错误告警
- 监控数据库性能

## 安全配置

### 1. 环境变量安全
- 使用强密码
- 定期轮换密钥
- 限制访问权限

### 2. 数据库安全
- 启用 SSL 连接
- 配置访问控制
- 定期备份数据

### 3. 应用安全
- 启用 HTTPS
- 配置 CORS 策略
- 实施速率限制

## 扩展功能

### 1. 自定义域名
- 在 Vercel 中添加自定义域名
- 配置 DNS 记录
- 启用 SSL 证书

### 2. 团队协作
- 邀请团队成员
- 设置权限管理
- 配置通知系统

### 3. 集成服务
- 企业微信集成
- 邮件通知系统
- 第三方 API 集成

## 维护和更新

### 1. 定期更新
- 更新依赖包
- 修复安全漏洞
- 优化性能

### 2. 数据备份
- 定期备份数据库
- 导出重要数据
- 测试恢复流程

### 3. 监控和维护
- 监控应用状态
- 检查错误日志
- 优化用户体验

## 支持资源

- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Node.js 最佳实践](https://nodejs.org/en/docs/guides/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

## 联系支持

如有问题，请：
1. 查看本文档的故障排除部分
2. 检查 Vercel 和 Supabase 文档
3. 提交 GitHub Issue
4. 联系技术支持

---

🎉 **恭喜！** 您的工作流记录系统已成功部署到 Vercel！
