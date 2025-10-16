#!/usr/bin/env node

/**
 * 测试新的 Supabase 数据库连接
 * 验证新的数据库配置是否正常工作
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 新的 Supabase 配置
const supabaseUrl = 'https://htgghiyahgaiwxdsukmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2doaXlhaGdhaXd4ZHN1a212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTYzOTMsImV4cCI6MjA3NjEzMjM5M30.HSkHQnyKFoilEWXBAfX7QpDXr9v93zmh8awgbgDL-vs';

console.log('🚀 测试新的 Supabase 数据库连接');
console.log('=====================================');
console.log('📍 新 Supabase URL:', supabaseUrl);
console.log('🔑 API Key:', `${supabaseKey.substring(0, 20)}...`);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBasicConnection() {
    try {
        console.log('\n🔗 测试基本连接...');
        
        // 测试基本连接（不依赖特定表）
        const { data, error } = await supabase.rpc('version');
        
        if (error) {
            console.log('⚠️  RPC 调用失败，尝试其他方法测试连接...');
            
            // 尝试获取数据库信息
            const { data: dbInfo, error: dbError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .limit(1);
                
            if (dbError) {
                console.log('⚠️  无法访问 information_schema，尝试简单查询...');
                
                // 尝试一个简单的查询
                const { data: simpleData, error: simpleError } = await supabase
                    .from('pg_tables')
                    .select('tablename')
                    .limit(1);
                    
                if (simpleError) {
                    console.log('❌ 数据库连接失败:', simpleError.message);
                    return false;
                }
            }
        }
        
        console.log('✅ 数据库连接成功！');
        return true;
        
    } catch (error) {
        console.error('❌ 连接测试过程中发生错误:', error.message);
        return false;
    }
}

async function checkExistingTables() {
    try {
        console.log('\n📊 检查现有表...');
        
        // 尝试查询现有的表
        const tables = ['users', 'staff', 'tasks', 'notifications', 'ai_conversations', 'todos'];
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase.from(table).select('count').limit(1);
                if (error && error.code === 'PGRST116') {
                    console.log(`❌ 表 ${table} 不存在`);
                } else if (error) {
                    console.log(`⚠️  表 ${table} 存在但访问受限:`, error.message);
                } else {
                    console.log(`✅ 表 ${table} 存在`);
                }
            } catch (err) {
                console.log(`❌ 检查表 ${table} 时出错:`, err.message);
            }
        }
        
        // 特别检查您提到的 todos 表
        console.log('\n📋 特别检查 todos 表...');
        try {
            const { data, error } = await supabase.from('todos').select('*').limit(5);
            if (error) {
                console.log('❌ todos 表不存在或无法访问:', error.message);
            } else {
                console.log('✅ todos 表存在');
                console.log('📊 todos 表数据示例:', data);
            }
        } catch (err) {
            console.log('❌ 查询 todos 表时出错:', err.message);
        }
        
    } catch (error) {
        console.error('❌ 检查表时发生错误:', error.message);
    }
}

async function createWorkflowTables() {
    try {
        console.log('\n🔧 准备创建工作流系统所需的表...');
        
        // 显示需要创建的表的 SQL
        console.log('💡 您需要在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL 来创建表：');
        console.log('');
        
        const createTablesSQL = `
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

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);

-- 7. 更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 为需要 updated_at 的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. 插入默认管理员用户（密码是 'admin123' 的哈希值）
INSERT INTO users (username, email, password_hash, role) 
VALUES (
  'admin', 
  'admin@workflow.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'admin'
) ON CONFLICT (username) DO NOTHING;
        `;
        
        console.log(createTablesSQL);
        console.log('');
        console.log('📝 请复制上述 SQL 到 Supabase Dashboard 的 SQL Editor 中执行');
        
    } catch (error) {
        console.error('❌ 准备创建表时发生错误:', error.message);
    }
}

async function main() {
    console.log('开始测试新的 Supabase 数据库...\n');
    
    const connectionSuccess = await testBasicConnection();
    
    if (connectionSuccess) {
        await checkExistingTables();
        await createWorkflowTables();
        
        console.log('\n🎉 新数据库连接测试完成！');
        console.log('✅ 数据库连接正常');
        console.log('💡 如果看到表不存在的提示，请按照上面的 SQL 创建必要的表');
    } else {
        console.log('\n❌ 数据库连接失败！');
        console.log('💡 请检查以下项目:');
        console.log('   1. Supabase URL 是否正确');
        console.log('   2. API Key 是否有效');
        console.log('   3. 网络连接是否正常');
        console.log('   4. Supabase 项目是否正常运行');
    }
}

// 运行测试
main().catch(console.error);
