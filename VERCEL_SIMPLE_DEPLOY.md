# Vercel 简化部署指南

## 问题解决

Vercel 会自动检测 Node.js 项目，不需要复杂的构建配置。

### 修复内容
- ❌ 移除 `build` 脚本
- ❌ 删除 `vercel-build.js`
- ✅ 简化 `package.json` 脚本
- ✅ 优化 `vercel.json` 配置

## 部署步骤

### 1. Fork 项目到您的 GitHub

1. 访问项目 GitHub 页面
2. 点击 "Fork" 按钮
3. 选择您的 GitHub 账户

### 2. 连接 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 登录
3. 点击 "New Project"
4. 选择您 Fork 的项目

### 3. 配置项目

Vercel 会自动检测到 Node.js 项目，使用默认配置：

- **Framework Preset**: `Other`
- **Root Directory**: `./`
- **Build Command**: 留空（Vercel 会自动处理）
- **Output Directory**: 留空
- **Install Command**: `npm install`

### 4. 添加环境变量

在项目设置中添加以下环境变量：

```env
DATABASE_URL=postgresql://postgres.npbudtzlkdbnyjdkusfd:1qazXDR%@aws-1-us-east-2.pooler.supabase.com:6543/postgres
JWT_SECRET=55ae6d994090168e4a61dfa489acfe322391bfbaa6bdedcaddc82ea94a0b2778cf1e6a572ce1789e94e84655d383c72503c4f7ffd99ed924a5e1021102b04474
NODE_ENV=production
SUPABASE_URL=https://npbudtzlkdbnyjdkusfd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wYnVkdHpsa2RibnlqZGt1c2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MjcxOTgsImV4cCI6MjA3NTIwMzE5OH0.O5FqO4FUizF128x4_x854H_Vd2HhJoMIqcn5zeieevE
```

### 5. 部署

1. 点击 "Deploy" 按钮
2. 等待部署完成（通常 1-2 分钟）
3. 访问生成的 URL

## 部署后配置

### 1. 访问应用

访问 Vercel 生成的 URL，例如：
```
https://workflow-tracker-username.vercel.app
```

### 2. 数据库初始化

首次访问时，系统会自动初始化数据库（如果尚未初始化）。

### 3. 登录系统

使用默认管理员账户：
- **用户名**: `admin`
- **密码**: `admin123`

**重要**: 登录后立即修改密码！

### 4. 测试功能

1. **创建任务**
   - 点击 "任务管理"
   - 点击 "创建任务"
   - 填写任务信息

2. **添加员工**
   - 点击 "人员管理"
   - 点击 "添加人员"
   - 填写员工信息

3. **使用 AI 助手**
   - 点击 "AI助手"
   - 输入任务描述，例如：
     ```
     创建一个网站开发任务，负责人是张三，参与人有李四和王五，优先级高，明天开始，一周后完成
     ```

## 自动部署

每次推送代码到 GitHub 的 main 分支，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update features"
git push origin main
```

## 环境变量管理

### 添加环境变量

1. 进入 Vercel 项目设置
2. 点击 "Environment Variables"
3. 添加变量：
   - **Name**: 变量名
   - **Value**: 变量值
   - **Environment**: 选择环境（Production/Preview/Development）

### 更新环境变量

1. 修改环境变量值
2. 保存更改
3. 重新部署应用

## 自定义域名

### 添加自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 输入您的域名
3. 按照提示配置 DNS 记录
4. Vercel 会自动申请 SSL 证书

## 监控和日志

### 查看部署日志

1. 在 Vercel Dashboard 中点击项目
2. 查看 "Deployments" 页面
3. 点击具体的部署查看日志

### 查看运行时日志

1. 在项目页面点击 "Functions"
2. 查看实时日志
3. 监控应用性能

## 故障排除

### 常见问题

1. **部署失败**
   ```
   解决方案：
   - 检查环境变量是否正确
   - 查看部署日志
   - 确保所有依赖都已安装
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
   - 查看 Vercel 函数日志
   - 验证静态文件路径
   ```

### 获取帮助

1. **Vercel 文档**: [vercel.com/docs](https://vercel.com/docs)
2. **GitHub Issues**: 在项目页面提交 Issue
3. **社区支持**: Vercel Discord 社区

## 成功部署检查清单

- [ ] 项目成功部署到 Vercel
- [ ] 环境变量正确配置
- [ ] 可以访问应用首页
- [ ] 可以登录管理员账户
- [ ] 可以创建任务
- [ ] 可以添加员工
- [ ] AI 助手功能正常
- [ ] 数据库连接正常

## 下一步

部署成功后，您可以：

1. **邀请团队成员使用**
2. **配置微信提醒功能**
3. **添加自定义域名**
4. **扩展功能模块**
5. **优化性能**

---

🎉 **恭喜！** 您的工作流记录系统已成功部署到 Vercel！
