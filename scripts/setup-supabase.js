const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY 环境变量未设置');
  process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabase() {
  try {
    console.log('🚀 开始设置 Supabase 数据库...');
    console.log('📍 项目 URL:', supabaseUrl);

    // 测试连接
    console.log('🔗 测试数据库连接...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('⚠️  表不存在，需要先执行 SQL 脚本创建表');
      console.log('📝 请在 Supabase Dashboard 的 SQL Editor 中执行 scripts/setup-supabase-schema.sql');
      return;
    } else if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return;
    }

    console.log('✅ 数据库连接成功！');

    // 检查是否已有管理员用户
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (existingAdmin) {
      console.log('✅ 管理员用户已存在');
    } else {
      console.log('👤 创建默认管理员用户...');
      
      // 使用 bcrypt 加密密码
      const bcrypt = require('bcryptjs');
      const password = 'admin123';
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const { data: newAdmin, error: adminError } = await supabase
        .from('users')
        .insert([
          {
            username: 'admin',
            email: 'admin@workflow.com',
            password_hash: passwordHash,
            role: 'admin'
          }
        ])
        .select()
        .single();

      if (adminError) {
        console.error('❌ 创建管理员用户失败:', adminError.message);
      } else {
        console.log('✅ 管理员用户创建成功！');
        console.log('👤 用户名: admin');
        console.log('🔑 密码: admin123');
        console.log('⚠️  请在生产环境中修改默认密码！');
      }
    }

    // 检查是否已有员工数据
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .limit(1);

    if (existingStaff && existingStaff.length > 0) {
      console.log('✅ 员工数据已存在');
    } else {
      console.log('👥 创建示例员工数据...');
      
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

      const { data: newStaff, error: staffError } = await supabase
        .from('staff')
        .insert(staffData)
        .select();

      if (staffError) {
        console.error('❌ 创建员工数据失败:', staffError.message);
      } else {
        console.log('✅ 示例员工数据创建成功！');
        console.log(`👥 创建了 ${newStaff.length} 个员工`);
      }
    }

    // 检查是否已有任务数据
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);

    if (existingTasks && existingTasks.length > 0) {
      console.log('✅ 任务数据已存在');
    } else {
      console.log('📋 创建示例任务数据...');
      
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

      const { data: newTasks, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select();

      if (taskError) {
        console.error('❌ 创建任务数据失败:', taskError.message);
      } else {
        console.log('✅ 示例任务数据创建成功！');
        console.log(`📋 创建了 ${newTasks.length} 个任务`);
      }
    }

    console.log('\n🎉 Supabase 数据库设置完成！');
    console.log('🌐 现在可以启动应用程序了：');
    console.log('   npm start');
    console.log('\n📱 访问地址：');
    console.log('   http://localhost:3000');
    console.log('\n👤 默认管理员账户：');
    console.log('   用户名: admin');
    console.log('   密码: admin123');

  } catch (error) {
    console.error('❌ 设置失败:', error.message);
    process.exit(1);
  }
}

setupSupabase();
