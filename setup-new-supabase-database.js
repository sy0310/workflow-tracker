#!/usr/bin/env node

/**
 * 新 Supabase 数据库完整设置脚本
 * 为新的 Supabase 数据库创建所有必要的表和初始数据
 */

const { createClient } = require('@supabase/supabase-js');

// 新的 Supabase 配置
const supabaseUrl = 'https://htgghiyahgaiwxdsukmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2doaXlhaGdhaXd4ZHN1a212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTYzOTMsImV4cCI6MjA3NjEzMjM5M30.HSkHQnyKFoilEWXBAfX7QpDXr9v93zmh8awgbgDL-vs';

console.log('🚀 设置新的 Supabase 数据库');
console.log('============================');
console.log('📍 数据库 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    try {
        console.log('\n📋 准备创建数据库表...');
        
        // 由于 Supabase 客户端无法直接执行 DDL 语句，
        // 我们需要提供完整的 SQL 脚本供用户在 Dashboard 中执行
        
        const completeSQLScript = `
-- ============================================
-- 工作流记录系统数据库初始化脚本
-- 请在 Supabase Dashboard 的 SQL Editor 中执行
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

-- 6. 创建您提到的 todos 表（可选）
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

-- ============================================
-- 脚本执行完成
-- ============================================
        `;
        
        console.log('📝 完整的 SQL 脚本：');
        console.log('============================================');
        console.log(completeSQLScript);
        console.log('============================================');
        
        console.log('\n💡 执行步骤：');
        console.log('1. 打开 Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. 选择您的项目: htgghiyahgaiwxdsukmv');
        console.log('3. 点击左侧菜单的 "SQL Editor"');
        console.log('4. 点击 "New query"');
        console.log('5. 复制上面的 SQL 脚本并粘贴到编辑器中');
        console.log('6. 点击 "Run" 按钮执行脚本');
        console.log('7. 等待执行完成（通常需要几秒钟）');
        
        console.log('\n✅ 执行完成后，您的数据库将包含：');
        console.log('   - users 表（用户管理）');
        console.log('   - staff 表（员工管理）');
        console.log('   - tasks 表（任务管理）');
        console.log('   - notifications 表（提醒管理）');
        console.log('   - ai_conversations 表（AI对话记录）');
        console.log('   - todos 表（待办事项）');
        console.log('   - 默认管理员账户（用户名: admin, 密码: admin123）');
        console.log('   - 示例员工和任务数据');
        
        return true;
        
    } catch (error) {
        console.error('❌ 设置数据库时发生错误:', error.message);
        return false;
    }
}

async function testAfterSetup() {
    console.log('\n🧪 等待您执行 SQL 脚本后，我们可以测试数据库...');
    console.log('💡 执行完 SQL 脚本后，请运行以下命令测试：');
    console.log('   node simple-supabase-test.js');
}

async function main() {
    console.log('开始设置新的 Supabase 数据库...\n');
    
    const setupSuccess = await setupDatabase();
    
    if (setupSuccess) {
        await testAfterSetup();
        console.log('\n🎉 数据库设置指南完成！');
        console.log('📋 请按照上面的步骤在 Supabase Dashboard 中执行 SQL 脚本');
    }
}

// 运行设置
main().catch(console.error);
