# 新 Supabase 数据库设置总结

## 🎉 配置完成！

您已经成功更新了项目配置，使用新的 Supabase 数据库：

### 📍 新数据库信息
- **URL**: `https://htgghiyahgaiwxdsukmv.supabase.co`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2doaXlhaGdhaXd4ZHN1a212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTYzOTMsImV4cCI6MjA3NjEzMjM5M30.HSkHQnyKFoilEWXBAfX7QpDXr9v93zmh8awgbgDL-vs`

### ✅ 已完成的配置更新
1. ✅ 更新了 `config/supabase.js` 文件
2. ✅ 更新了 `env.example` 文件
3. ✅ 更新了 `VERCEL_DEPLOYMENT.md` 文件

### 📋 接下来需要做的步骤

#### 1. 在 Supabase Dashboard 中创建数据库表

**重要**: 新的 Supabase 数据库是空的，需要手动创建表。

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目: `htgghiyahgaiwxdsukmv`
3. 点击左侧菜单的 "SQL Editor"
4. 点击 "New query"
5. 复制并执行以下 SQL 脚本：

```sql
-- ============================================
-- 工作流记录系统数据库初始化脚本
-- ============================================

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建员工表
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  wechat_id VARCHAR(50) UNIQUE,
  wechat_name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  department VARCHAR(100),
  position VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assignee_id INTEGER,
  participants TEXT, -- JSON 数组存储参与人ID
  priority INTEGER DEFAULT 2, -- 1:低, 2:中, 3:高, 4:紧急
  status INTEGER DEFAULT 1, -- 1:待开始, 2:进行中, 3:已完成, 4:已取消
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  start_time TIMESTAMP WITH TIME ZONE,
  estimated_completion_time TIMESTAMP WITH TIME ZONE,
  actual_completion_time TIMESTAMP WITH TIME ZONE,
  created_by INTEGER,
  FOREIGN KEY (assignee_id) REFERENCES staff (id),
  FOREIGN KEY (created_by) REFERENCES users (id)
);

-- 4. 创建提醒记录表
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  task_id INTEGER,
  recipient_id INTEGER,
  notification_type VARCHAR(20), -- 'direct', 'secretary'
  message TEXT,
  status INTEGER DEFAULT 1, -- 1:待发送, 2:已发送, 3:已读
  scheduled_time TIMESTAMP WITH TIME ZONE,
  sent_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id),
  FOREIGN KEY (recipient_id) REFERENCES staff (id)
);

-- 5. 创建AI对话记录表
CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  conversation_id VARCHAR(100),
  user_message TEXT,
  ai_response TEXT,
  task_data TEXT, -- JSON格式的任务数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 6. 创建您提到的 todos 表
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  user_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 7. 创建索引
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id);

-- 8. 更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 为需要 updated_at 的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. 插入默认管理员用户（密码是 'admin123' 的哈希值）
INSERT INTO users (username, email, password_hash, role) 
VALUES (
  'admin', 
  'admin@workflow.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'admin'
) ON CONFLICT (username) DO NOTHING;

-- 11. 插入示例员工数据
INSERT INTO staff (name, wechat_id, wechat_name, email, phone, department, position) VALUES
('张三', 'zhangsan_wx', '张三', 'zhangsan@example.com', '13800138001', '技术部', '前端工程师'),
('李四', 'lisi_wx', '李四', 'lisi@example.com', '13800138002', '技术部', '后端工程师'),
('王五', 'wangwu_wx', '王五', 'wangwu@example.com', '13800138003', '产品部', '产品经理'),
('赵六', 'zhaoliu_wx', '赵六', 'zhaoliu@example.com', '13800138004', '秘书处', '秘书')
ON CONFLICT (wechat_id) DO NOTHING;

-- 12. 插入示例任务数据
INSERT INTO tasks (title, description, assignee_id, participants, priority, status, start_time, estimated_completion_time, created_by) VALUES
('网站首页开发', '开发公司官网首页，包括响应式设计和交互功能', 1, '[2, 3]', 3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', 1),
('用户管理系统', '开发用户注册、登录、权限管理功能', 2, '[1]', 2, 1, CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '14 days', 1),
('产品需求文档', '编写新产品的需求文档和功能规格说明', 3, '[4]', 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '5 days', 1)
ON CONFLICT DO NOTHING;

-- 13. 插入示例 todos 数据
INSERT INTO todos (title, description, completed, user_id) VALUES
('完成项目文档', '编写项目的技术文档和用户手册', false, 1),
('代码审查', '审查团队成员的代码提交', false, 1),
('准备演示', '准备下周的产品演示材料', false, 1)
ON CONFLICT DO NOTHING;
```

#### 2. 在 Vercel 中更新环境变量

在您的 Vercel 项目设置中添加以下环境变量：

```
SUPABASE_URL = https://htgghiyahgaiwxdsukmv.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2doaXlhaGdhaXd4ZHN1a212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTYzOTMsImV4cCI6MjA3NjEzMjM5M30.HSkHQnyKFoilEWXBAfX7QpDXr9v93zmh8awgbgDL-vs
```

#### 3. 测试数据库连接

执行完 SQL 脚本后，运行以下命令测试连接：

```bash
node simple-supabase-test.js
```

### 🎯 数据库将包含的表

执行 SQL 脚本后，您的数据库将包含：

1. **users** - 用户管理表
2. **staff** - 员工管理表  
3. **tasks** - 任务管理表
4. **notifications** - 提醒管理表
5. **ai_conversations** - AI对话记录表
6. **todos** - 待办事项表（您提到的）

### 🔑 默认登录信息

- **用户名**: `admin`
- **密码**: `admin123`

### 📞 需要帮助？

如果您在执行过程中遇到任何问题，请：

1. 检查 Supabase Dashboard 中的 SQL Editor 是否有错误信息
2. 确认环境变量是否正确配置
3. 运行测试脚本验证连接

---

🎉 **恭喜！** 您的新 Supabase 数据库配置已完成！
