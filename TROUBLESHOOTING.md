# 前端加载失败故障排查指南

## 问题描述
用户报告前端显示"加载失败"。

## 已确认正常的部分
✅ 后端服务器运行正常 (端口 3000)
✅ 数据库连接正常 (PostgreSQL)
✅ 所有 API 端点响应正常
✅ 用户认证功能正常
✅ 部门项目数据存在

## 可能的问题原因

### 1. 浏览器控制台错误
**排查步骤:**
1. 打开浏览器 (Chrome/Edge)
2. 按 F12 打开开发者工具
3. 切换到 "Console" 标签
4. 刷新页面
5. 查看是否有红色错误信息

**常见错误:**
- `AuthManager is not defined` → auth.js 未正确加载
- `Failed to fetch` → API 请求失败
- `CORS error` → 跨域问题
- `401 Unauthorized` → 认证失败

### 2. 网络请求失败
**排查步骤:**
1. 在开发者工具中切换到 "Network" 标签
2. 刷新页面
3. 查看所有请求的状态码
4. 重点检查:
   - `/api/auth/me` - 应该返回 200
   - `/api/departments/产业分析/projects` - 应该返回 200
   - 任何返回 401/403/500 的请求

### 3. 页面未正确加载
**排查步骤:**
1. 检查页面是否显示登录页面还是主页
2. 如果显示登录页面，尝试重新登录
3. 如果登录后立即跳回登录页面，可能是认证循环问题

### 4. 部门项目显示问题
**排查步骤:**
1. 登录后，点击"部门管理"
2. 点击任意部门卡片（如"产业分析"）
3. 观察是否显示项目列表
4. 如果显示"加载失败"，查看控制台错误

## 快速修复方案

### 方案 1: 清除浏览器缓存
```
1. 按 Ctrl+Shift+Delete
2. 选择"缓存的图片和文件"
3. 点击"清除数据"
4. 刷新页面 (Ctrl+F5)
```

### 方案 2: 重新登录
```
1. 点击右上角"登出"按钮
2. 重新输入用户名: admin
3. 输入密码: admin123
4. 点击登录
```

### 方案 3: 检查环境变量
确认 `.env` 文件包含以下内容:
```
DATABASE_URL=postgresql://postgres.npbudtzlkdbnyjdkusfd:1qazXDR%@aws-1-us-east-2.pooler.supabase.com:6543/postgres
JWT_SECRET=your-secret-key
SUPABASE_URL=https://npbudtzlkdbnyjdkusfd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wYnVkdHpsa2RibnlqZGt1c2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MjcxOTgsImV4cCI6MjA3NTIwMzE5OH0.O5FqO4FUizF128x4_x854H_Vd2HhJoMIqcn5zeieevE
```

### 方案 4: 重启服务器
```bash
# 停止服务器
taskkill /F /IM node.exe

# 启动服务器
npm start
```

## 测试工具

### 测试 1: 后端 API
```bash
node scripts/check-frontend-issue.js
```
所有 API 应该返回 ✅

### 测试 2: 前端页面
访问: http://localhost:3000/test-frontend.html
查看所有测试是否通过

### 测试 3: 直接 API 调用
在浏览器中打开:
```
http://localhost:3000/api/departments/产业分析/projects
```
应该看到 JSON 数据或 401 错误（需要登录）

## 详细错误信息收集

如果问题仍然存在，请提供以下信息:

1. **浏览器控制台截图**
   - 按 F12 → Console 标签
   - 截图所有错误信息

2. **网络请求截图**
   - 按 F12 → Network 标签
   - 刷新页面
   - 截图所有红色（失败）的请求

3. **具体错误描述**
   - 在哪个页面出现问题？
   - 点击什么按钮后出现问题？
   - 显示什么错误信息？

## 联系支持
如果以上方案都无法解决问题，请提供:
- 浏览器版本
- 操作系统版本
- 控制台错误截图
- 网络请求截图
