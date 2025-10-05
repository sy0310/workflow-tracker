const db = require('../database');

async function setupDatabase() {
  try {
    console.log('正在初始化数据库...');
    
    // 初始化数据库表
    await db.initDatabase();
    
    // 创建默认管理员账户
    const bcrypt = require('bcryptjs');
    
    // 检查是否已存在管理员
    const existingAdmin = await db.get(
      'SELECT id FROM users WHERE role = ?',
      ['admin']
    );

    if (!existingAdmin) {
      const username = 'admin';
      const email = 'admin@workflow.com';
      const password = 'admin123';
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      await db.run(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, 'admin']
      );

      console.log('✅ 默认管理员账户创建成功！');
      console.log('用户名:', username);
      console.log('密码:', password);
      console.log('⚠️  请在生产环境中修改默认密码！');
    } else {
      console.log('✅ 管理员账户已存在');
    }

    // 创建示例员工数据
    const existingStaff = await db.get('SELECT id FROM staff LIMIT 1');
    
    if (!existingStaff) {
      console.log('正在创建示例员工数据...');
      
      const staffData = [
        {
          name: '张三',
          wechat_id: 'zhangsan_wx',
          wechat_name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138001',
          department: '技术部',
          position: '前端工程师'
        },
        {
          name: '李四',
          wechat_id: 'lisi_wx',
          wechat_name: '李四',
          email: 'lisi@example.com',
          phone: '13800138002',
          department: '技术部',
          position: '后端工程师'
        },
        {
          name: '王五',
          wechat_id: 'wangwu_wx',
          wechat_name: '王五',
          email: 'wangwu@example.com',
          phone: '13800138003',
          department: '产品部',
          position: '产品经理'
        },
        {
          name: '赵六',
          wechat_id: 'zhaoliu_wx',
          wechat_name: '赵六',
          email: 'zhaoliu@example.com',
          phone: '13800138004',
          department: '秘书处',
          position: '秘书'
        }
      ];

      for (const staff of staffData) {
        await db.run(
          'INSERT INTO staff (name, wechat_id, wechat_name, email, phone, department, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [staff.name, staff.wechat_id, staff.wechat_name, staff.email, staff.phone, staff.department, staff.position]
        );
      }

      console.log('✅ 示例员工数据创建成功！');
    } else {
      console.log('✅ 员工数据已存在');
    }

    // 创建示例任务数据
    const existingTasks = await db.get('SELECT id FROM tasks LIMIT 1');
    
    if (!existingTasks) {
      console.log('正在创建示例任务数据...');
      
      const taskData = [
        {
          title: '网站首页开发',
          description: '开发公司官网首页，包括响应式设计和交互功能',
          assignee_id: 1,
          participants: JSON.stringify([2, 3]),
          priority: 3,
          status: 2,
          start_time: new Date().toISOString(),
          estimated_completion_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 1
        },
        {
          title: '用户管理系统',
          description: '开发用户注册、登录、权限管理功能',
          assignee_id: 2,
          participants: JSON.stringify([1]),
          priority: 2,
          status: 1,
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          estimated_completion_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 1
        },
        {
          title: '产品需求文档',
          description: '编写新产品的需求文档和功能规格说明',
          assignee_id: 3,
          participants: JSON.stringify([4]),
          priority: 2,
          status: 2,
          start_time: new Date().toISOString(),
          estimated_completion_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 1
        }
      ];

      for (const task of taskData) {
        await db.run(
          'INSERT INTO tasks (title, description, assignee_id, participants, priority, status, start_time, estimated_completion_time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [task.title, task.description, task.assignee_id, task.participants, task.priority, task.status, task.start_time, task.estimated_completion_time, task.created_by]
        );
      }

      console.log('✅ 示例任务数据创建成功！');
    } else {
      console.log('✅ 任务数据已存在');
    }

    console.log('\n🎉 数据库初始化完成！');
    console.log('现在您可以启动应用程序了。');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
