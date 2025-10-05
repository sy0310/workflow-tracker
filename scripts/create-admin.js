const bcrypt = require('bcryptjs');
const db = require('../database');

async function createAdmin() {
  try {
    console.log('开始创建管理员账户...');

    // 检查是否已存在管理员
    const existingAdmin = await db.get(
      'SELECT id FROM users WHERE role = ?',
      ['admin']
    );

    if (existingAdmin) {
      console.log('管理员账户已存在，跳过创建');
      process.exit(0);
    }

    // 创建管理员账户
    const username = 'admin';
    const email = 'admin@workflow.com';
    const password = 'admin123'; // 生产环境中应该使用更复杂的密码

    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 插入管理员记录
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, 'admin']
    );

    console.log('管理员账户创建成功！');
    console.log('用户名:', username);
    console.log('邮箱:', email);
    console.log('密码:', password);
    console.log('角色:', 'admin');
    console.log('\n请在生产环境中修改默认密码！');

  } catch (error) {
    console.error('创建管理员账户失败:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
