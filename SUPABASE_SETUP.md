# Supabase 数据库配置指南

## 概述

您已经创建了 Supabase 数据库，现在需要完成以下配置步骤：

1. 获取 Supabase API 密钥
2. 在 Supabase 中创建数据库表
3. 配置环境变量
4. 测试连接

## 步骤 1：获取 Supabase API 密钥

1. **登录 Supabase Dashboard**
   - 访问 [supabase.com](https://supabase.com)
   - 使用您的 GitHub 账户登录
   - 选择您的项目

2. **获取 API 密钥**
   - 在左侧菜单中点击 "Settings" → "API"
   - 复制 "Project URL" 和 "anon public" 密钥
   - 您会看到类似这样的信息：
     ```
     Project URL: https://npbudtzlkdbnyjdkusfd.supabase.co
     anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

## 步骤 2：在 Supabase 中创建数据库表

1. **打开 SQL Editor**
   - 在 Supabase Dashboard 左侧菜单中点击 "SQL Editor"
   - 点击 "New query"

2. **执行 SQL 脚本**
   - 复制 `scripts/setup-supabase-schema.sql` 文件的内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 按钮执行

3. **验证表创建**
   - 在左侧菜单中点击 "Table Editor"
   - 您应该看到以下表：
     - users（用户表）
     - staff（员工表）
     - tasks（任务表）
     - notifications（提醒表）
     - ai_conversations（AI对话表）

## 步骤 3：配置环境变量

### 本地开发环境

1. **创建 .env 文件**
   ```bash
   cp env.example .env
   ```

2. **编辑 .env 文件**
   ```env
   # Supabase 配置
   SUPABASE_URL=https://npbudtzlkdbnyjdkusfd.supabase.co
   SUPABASE_ANON_KEY=your-actual-supabase-anon-key-here
   
   # 其他配置
   NODE_ENV=development
   JWT_SECRET=your-jwt-secret-here
   PORT=3000
   ```

### Vercel 部署环境

1. **在 Vercel 项目中添加环境变量**
   - 进入 Vercel 项目设置
   - 点击 "Environment Variables"
   - 添加以下变量：

   ```
   SUPABASE_URL = https://npbudtzlkdbnyjdkusfd.supabase.co
   SUPABASE_ANON_KEY = your-actual-supabase-anon-key-here
   NODE_ENV = production
   JWT_SECRET = your-jwt-secret-here
   ```

2. **重新部署**
   - 保存环境变量后，Vercel 会自动重新部署
   - 或者手动点击 "Redeploy"

## 步骤 4：测试连接

### 本地测试

1. **启动应用**
   ```bash
   npm start
   ```

2. **访问应用**
   - 打开浏览器访问 http://localhost:3000
   - 使用默认管理员账户登录：
     - 用户名：admin
     - 密码：admin123

3. **测试功能**
   - 创建任务
   - 添加员工
   - 使用 AI 助手

### 生产环境测试

1. **访问部署的 URL**
   - 例如：https://your-project.vercel.app

2. **测试所有功能**
   - 用户注册和登录
   - 任务管理
   - 员工管理
   - AI 助手

## 数据库管理

### 查看数据

1. **在 Supabase Dashboard 中**
   - 点击 "Table Editor"
   - 选择要查看的表
   - 可以查看、编辑、删除数据

2. **使用 SQL 查询**
   - 在 "SQL Editor" 中编写查询语句
   - 例如：`SELECT * FROM users;`

### 备份数据

1. **导出数据**
   - 在 Supabase Dashboard 中点击 "Settings" → "Database"
   - 使用 "Backup" 功能

2. **定期备份**
   - 建议设置定期自动备份
   - 或者手动导出重要数据

## 安全配置

### Row Level Security (RLS)

1. **启用 RLS**
   ```sql
   -- 为用户表启用 RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- 为员工表启用 RLS
   ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
   
   -- 为任务表启用 RLS
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   ```

2. **创建安全策略**
   ```sql
   -- 用户只能查看和更新自己的数据
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid()::text = id::text);
   
   CREATE POLICY "Users can update own profile" ON users
     FOR UPDATE USING (auth.uid()::text = id::text);
   ```

### API 密钥管理

1. **保护 API 密钥**
   - 不要在代码中硬编码 API 密钥
   - 使用环境变量存储
   - 定期轮换密钥

2. **限制访问**
   - 在 Supabase 中配置 API 访问限制
   - 设置适当的 CORS 策略

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 SUPABASE_URL 和 SUPABASE_ANON_KEY 是否正确
   - 确认 Supabase 项目状态正常

2. **表不存在**
   - 重新执行 SQL 脚本
   - 检查表名是否正确

3. **权限错误**
   - 检查 RLS 策略
   - 确认用户权限设置

### 获取帮助

1. **Supabase 文档**
   - 访问 [supabase.com/docs](https://supabase.com/docs)

2. **社区支持**
   - Supabase Discord
   - GitHub Issues

3. **技术支持**
   - Supabase 付费支持

## 下一步

配置完成后，您可以：

1. **部署到 Vercel**
2. **邀请团队成员使用**
3. **配置微信提醒功能**
4. **自定义功能扩展**

## 重要提醒

⚠️ **安全注意事项：**
- 请立即修改默认管理员密码
- 定期备份数据库
- 监控访问日志
- 使用强密码

🎉 **恭喜！** 您的 Supabase 数据库配置完成，现在可以开始使用工作流记录系统了！
