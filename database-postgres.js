const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL 连接池配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.npbudtzlkdbnyjdkusfd:1qazXDR%@aws-1-us-east-2.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 初始化数据库表
async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('正在初始化 PostgreSQL 数据库...');
    
    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建员工表
    await client.query(`
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
      )
    `);

    // 创建任务表
    await client.query(`
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
      )
    `);

    // 创建提醒记录表
    await client.query(`
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
      )
    `);

    // 创建AI对话记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        conversation_id VARCHAR(100),
        user_message TEXT,
        ai_response TEXT,
        task_data TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id)`);

    // 创建触发器函数
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // 创建触发器
    await client.query(`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await client.query(`
      CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('PostgreSQL 数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 通用查询方法
async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('查询错误:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 通用执行方法
async function run(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return { 
      id: result.rows[0]?.id || result.insertId || 0, 
      changes: result.rowCount || 0 
    };
  } catch (error) {
    console.error('执行错误:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 获取单个记录
async function get(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('获取记录错误:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 关闭连接池
async function close() {
  await pool.end();
  console.log('PostgreSQL 连接池已关闭');
}

module.exports = {
  initDatabase,
  query,
  run,
  get,
  close,
  pool
};
