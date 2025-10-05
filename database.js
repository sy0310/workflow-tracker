const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'workflow.db');
const db = new sqlite3.Database(dbPath);

// 初始化数据库表
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 员工信息表
      db.run(`
        CREATE TABLE IF NOT EXISTS staff (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          wechat_id TEXT UNIQUE,
          wechat_name TEXT,
          email TEXT,
          phone TEXT,
          avatar_url TEXT,
          department TEXT,
          position TEXT,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 任务表
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          assignee_id INTEGER,
          participants TEXT, -- JSON数组存储参与人ID
          priority INTEGER DEFAULT 1, -- 1:低, 2:中, 3:高, 4:紧急
          status INTEGER DEFAULT 1, -- 1:待开始, 2:进行中, 3:已完成, 4:已取消
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          start_time DATETIME,
          estimated_completion_time DATETIME,
          actual_completion_time DATETIME,
          created_by INTEGER,
          FOREIGN KEY (assignee_id) REFERENCES staff (id),
          FOREIGN KEY (created_by) REFERENCES staff (id)
        )
      `);

      // 提醒记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER,
          recipient_id INTEGER,
          notification_type TEXT, -- 'direct', 'secretary'
          message TEXT,
          status INTEGER DEFAULT 1, -- 1:待发送, 2:已发送, 3:已读
          scheduled_time DATETIME,
          sent_time DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks (id),
          FOREIGN KEY (recipient_id) REFERENCES staff (id)
        )
      `);

      // AI对话记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          conversation_id TEXT,
          user_message TEXT,
          ai_response TEXT,
          task_data TEXT, -- JSON格式的任务数据
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES staff (id)
        )
      `);

      // 用户认证表
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user', -- admin, user
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 用户会话表
      db.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      console.log('数据库表初始化完成');
      resolve();
    });
  });
}

// 通用查询方法
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// 通用执行方法
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// 获取单个记录
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// 关闭数据库连接
function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  initDatabase,
  query,
  run,
  get,
  close
};
