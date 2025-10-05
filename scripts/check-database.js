const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('🔍 检查数据库连接和用户数据...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      console.error('❌ SUPABASE_ANON_KEY 环境变量未设置');
      return;
    }
    
    console.log('📍 项目 URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 检查用户表
    console.log('👤 检查用户表...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ 查询用户表失败:', usersError.message);
      return;
    }
    
    console.log('✅ 用户表连接成功');
    console.log(`📊 用户数量: ${users.length}`);
    
    if (users.length > 0) {
      console.log('👥 用户列表:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 角色: ${user.role}, 状态: ${user.is_active ? '活跃' : '未激活'}`);
      });
      
      // 检查管理员用户
      const admin = users.find(u => u.username === 'admin');
      if (admin) {
        console.log('✅ 找到管理员用户');
        console.log(`   用户名: ${admin.username}`);
        console.log(`   邮箱: ${admin.email}`);
        console.log(`   角色: ${admin.role}`);
        console.log(`   状态: ${admin.is_active ? '活跃' : '未激活'}`);
        console.log(`   创建时间: ${admin.created_at}`);
      } else {
        console.log('⚠️  未找到管理员用户');
      }
    } else {
      console.log('⚠️  用户表为空，需要初始化数据');
    }
    
    // 检查员工表
    console.log('\n👥 检查员工表...');
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*');
    
    if (staffError) {
      console.error('❌ 查询员工表失败:', staffError.message);
    } else {
      console.log('✅ 员工表连接成功');
      console.log(`📊 员工数量: ${staff.length}`);
    }
    
    // 检查任务表
    console.log('\n📋 检查任务表...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      console.error('❌ 查询任务表失败:', tasksError.message);
    } else {
      console.log('✅ 任务表连接成功');
      console.log(`📊 任务数量: ${tasks.length}`);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkDatabase();
