# AI 任务创建故障排查指南

## 🔍 问题诊断步骤

### 1. 检查服务器日志

当 AI 任务创建失败时，**请查看服务器控制台输出的详细日志**。日志会显示：

```
📥 收到创建任务请求
请求体: { ... }
用户信息: { ... }
🔧 数据库类型: PostgreSQL 或 SQLite
📝 创建任务请求: { ... }
```

如果看到错误，会显示：
```
❌ 创建任务错误: ...
❌ 错误类型: ...
❌ 错误消息: ...
```

### 2. 检查浏览器控制台

打开浏览器的开发者工具（F12），查看 Console 标签页，你会看到：

```
📤 准备创建任务: { ... }
🔑 Token 已获取，准备发送请求
📡 服务器响应状态: 500
❌ 创建任务失败: { ... }
```

## 🛠️ 常见问题及解决方案

### 问题 1: 数据库连接失败

**错误信息：**
```
数据库连接池未初始化
```

**解决方案：**

#### 选项 A: 使用 SQLite（本地开发推荐）

1. **初始化数据库：**
   ```bash
   node scripts/init-database.js
   ```

2. **确保没有设置 DATABASE_URL 环境变量：**
   - 检查 `.env` 文件，注释掉或删除 `DATABASE_URL` 行
   - 重启服务器

#### 选项 B: 使用 PostgreSQL/Supabase

1. **配置环境变量：**
   创建或编辑 `.env` 文件：
   ```env
   DATABASE_URL=your-postgresql-connection-string
   ```

2. **测试连接：**
   ```bash
   node -e "const db = require('./database-postgres'); db.testConnection();"
   ```

3. **初始化数据库表：**
   - 登录 Supabase Dashboard
   - 执行 `scripts/setup-supabase-schema.sql`

### 问题 2: Token 认证失败

**错误信息：**
```
访问令牌缺失 或 访问令牌无效
```

**解决方案：**

1. **重新登录：**
   - 退出当前账号
   - 重新登录
   - 再次尝试创建任务

2. **清除浏览器缓存：**
   - 按 Ctrl+Shift+Delete
   - 清除缓存和 Cookie
   - 刷新页面

### 问题 3: 任务数据格式错误

**错误信息：**
```
任务数据不完整
```

**解决方案：**

1. **检查 AI 返回的数据：**
   - 查看浏览器控制台的 `📤 准备创建任务:` 日志
   - 确保包含 `任务名称` 字段

2. **重新开始对话：**
   - 点击"清除对话"按钮
   - 重新描述任务需求
   - 确保提供完整信息

### 问题 4: 数据库表不存在

**错误信息：**
```
relation "tasks" does not exist
或
no such table: tasks
```

**解决方案：**

对于 SQLite:
```bash
node scripts/init-database.js
```

对于 PostgreSQL/Supabase:
```bash
node scripts/setup-supabase.js
```

或在 Supabase SQL Editor 中执行：
```bash
scripts/setup-supabase-schema.sql
```

## 📋 完整测试流程

### 1. 启动服务器
```bash
npm start
```

### 2. 查看启动日志
应该看到：
```
✅ PostgreSQL 连接成功
或
⚠️  PostgreSQL 未配置（将使用 SQLite）
```

### 3. 登录系统
- 访问 http://localhost:3000/login.html
- 使用管理员账号登录

### 4. 测试 AI 助手
- 进入主页
- 打开 AI 助手
- 输入：`创建一个测试任务，负责人张三，优先级高`

### 5. 检查日志
- **浏览器控制台**应显示详细的请求和响应日志
- **服务器控制台**应显示数据库操作日志

## 🔧 开发调试技巧

### 启用详细日志

在 `.env` 文件中添加：
```env
NODE_ENV=development
```

### 测试 AI API

```bash
# 测试 AI 聊天
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "创建一个测试任务"}'

# 测试任务创建
curl -X POST http://localhost:3000/api/ai/create-task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"taskData": {"任务名称": "测试", "负责人": "张三", "优先级": "高", "状态": "待开始"}}'
```

### 查看数据库内容

SQLite:
```bash
sqlite3 workflow.db "SELECT * FROM tasks;"
```

PostgreSQL:
```bash
psql YOUR_DATABASE_URL -c "SELECT * FROM tasks;"
```

## 📞 获取帮助

如果问题仍未解决，请提供以下信息：

1. **服务器控制台的完整错误日志**
2. **浏览器控制台的错误信息**
3. **使用的数据库类型**（SQLite/PostgreSQL）
4. **环境变量配置**（隐藏敏感信息）
5. **复现步骤**

## 🎯 快速修复命令

```bash
# 1. 重新初始化 SQLite 数据库
node scripts/init-database.js

# 2. 创建管理员账号
node scripts/create-admin.js

# 3. 重启服务器
npm start
```

## ✅ 验证修复是否成功

1. 服务器启动无错误
2. 登录成功
3. AI 助手响应正常
4. 任务创建成功
5. 可以在任务列表中看到新创建的任务

