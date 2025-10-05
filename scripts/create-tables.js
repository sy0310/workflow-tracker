const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createTables() {
  try {
    console.log('🚀 开始创建 Supabase 数据库表...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      console.error('❌ SUPABASE_ANON_KEY 环境变量未设置');
      return;
    }
    
    console.log('📍 项目 URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 创建表的 SQL 语句
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
        participants TEXT,
        priority INTEGER DEFAULT 2,
        status INTEGER DEFAULT 1,
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
        notification_type VARCHAR(20),
        message TEXT,
        status INTEGER DEFAULT 1,
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
        task_data TEXT,
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

      -- 7. 创建触发器函数
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- 8. 创建触发器
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    
    console.log('📋 执行 SQL 创建表...');
    
    // 由于 Supabase 客户端不支持直接执行 SQL，我们需要手动在 Supabase Dashboard 中执行
    console.log('⚠️  请手动在 Supabase Dashboard 中执行以下 SQL:');
    console.log('1. 访问 https://supabase.com/dashboard');
    console.log('2. 选择您的项目');
    console.log('3. 点击 "SQL Editor"');
    console.log('4. 点击 "New query"');
    console.log('5. 复制并粘贴以下 SQL 代码:');
    console.log('\n' + '='.repeat(50));
    console.log(createTablesSQL);
    console.log('='.repeat(50));
    console.log('\n6. 点击 "Run" 执行');
    console.log('\n执行完成后，运行以下命令创建管理员用户:');
    console.log('node scripts/create-admin-user.js');
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }
}

createTables();
