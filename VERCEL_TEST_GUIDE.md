# Vercel 部署和测试指南

## ✅ 代码已推送到 GitHub

刚刚已将最新代码推送到 GitHub，Vercel 会自动检测并开始部署。

## 📋 部署状态检查

### 1. 访问 Vercel Dashboard
打开浏览器访问：https://vercel.com/dashboard

### 2. 查看部署状态
- 在项目列表中找到 `workflow-tracker`
- 查看最新的部署状态：
  - 🟡 **Building** - 正在构建
  - 🟢 **Ready** - 部署成功
  - 🔴 **Error** - 部署失败

### 3. 部署时间
通常需要 **1-3 分钟**完成部署

---

## 🔍 测试步骤

### 部署成功后：

#### 1. 获取 Vercel URL
- 在 Vercel Dashboard 中点击项目
- 复制部署的 URL（通常是 `https://workflow-tracker-xxx.vercel.app`）

#### 2. 访问应用
```
https://your-project.vercel.app
```

#### 3. 测试登录
- 用户名：`admin`
- 密码：`admin123`

#### 4. 测试部门功能
1. 登录后点击 "部门管理"
2. 点击任意部门卡片（如"产业分析"）
3. 应该能看到项目列表
4. 尝试创建新项目

---

## ⚠️ 重要提示

### Vercel 环境变量
确保在 Vercel Dashboard 中已配置以下环境变量：

```
DATABASE_URL=postgresql://postgres.npbudtzlkdbnyjdkusfd:1qazXDR%@aws-1-us-east-2.pooler.supabase.com:6543/postgres
JWT_SECRET=your-secret-key
SUPABASE_URL=https://npbudtzlkdbnyjdkusfd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wYnVkdHpsa2RibnlqZGt1c2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MjcxOTgsImV4cCI6MjA3NTIwMzE5OH0.O5FqO4FUizF128x4_x854H_Vd2HhJoMIqcn5zeieevE
```

### 配置环境变量步骤：
1. 在 Vercel Dashboard 中打开项目
2. 点击 **Settings** → **Environment Variables**
3. 添加上述环境变量
4. 点击 **Save**
5. 重新部署（**Deployments** → 最新部署 → **Redeploy**）

---

## 🐛 常见问题

### 问题 1: 部署失败
**解决方案：**
- 查看 Vercel 部署日志
- 检查环境变量是否正确配置
- 确认 Supabase 数据库表已创建

### 问题 2: 登录失败
**解决方案：**
- 确认 Supabase 数据库中 `users` 表存在
- 确认已执行 `scripts/fix-database-tables.sql`
- 检查 JWT_SECRET 环境变量

### 问题 3: 部门项目加载失败
**解决方案：**
- 确认 Supabase 中四个部门表已创建
- 检查 DATABASE_URL 环境变量
- 查看 Vercel 函数日志

---

## 📊 监控和调试

### 查看 Vercel 日志
1. 在 Vercel Dashboard 中打开项目
2. 点击 **Deployments**
3. 点击最新的部署
4. 查看 **Functions** 标签中的日志

### 实时日志
```
vercel logs --follow
```

---

## 🎯 测试清单

部署成功后，请测试以下功能：

- [ ] 访问主页
- [ ] 用户登录
- [ ] 查看部门管理
- [ ] 点击部门卡片
- [ ] 查看项目列表
- [ ] 创建新项目
- [ ] 创建人员
- [ ] 查看任务列表

---

## 📞 获取帮助

如果遇到问题，请提供：
1. Vercel 部署 URL
2. 部署状态截图
3. 浏览器控制台错误信息
4. Vercel 函数日志

---

## 🔄 快速重新部署

如果需要重新部署：

```bash
# 方法 1: 通过 Git 推送
git commit --allow-empty -m "Redeploy"
git push origin main

# 方法 2: 通过 Vercel Dashboard
# Deployments → 最新部署 → Redeploy
```

---

## ✨ 本次更新内容

- ✅ 修复 `AuthManager is not defined` 错误
- ✅ 在 `index.html` 中添加 `auth.js` 引用
- ✅ 创建认证中间件 `middleware/authenticateToken.js`
- ✅ 添加缓存清除指引页面
- ✅ 完善故障排查文档

---

**预计部署时间：1-3 分钟**

请等待部署完成后，访问 Vercel URL 进行测试。
