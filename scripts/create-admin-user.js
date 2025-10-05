const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminUser() {
  try {
    console.log('🚀 开始创建管理员用户...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      console.error('❌ SUPABASE_ANON_KEY 环境变量未设置');
      return;
    }
    
    console.log('📍 项目 URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 检查是否已存在管理员用户
    console.log('🔍 检查现有用户...');
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin');
    
    if (checkError) {
      console.error('❌ 检查用户失败:', checkError.message);
      return;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️  管理员用户已存在，更新密码...');
      
      // 更新现有管理员用户
      const password = 'admin123';
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          is_active: true,
          role: 'admin'
        })
        .eq('username', 'admin')
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ 更新管理员用户失败:', updateError.message);
      } else {
        console.log('✅ 管理员用户密码更新成功！');
        console.log('👤 用户名: admin');
        console.log('🔑 密码: admin123');
        console.log('📧 邮箱:', updatedUser.email);
        console.log('🎭 角色:', updatedUser.role);
      }
    } else {
      console.log('👤 创建新的管理员用户...');
      
      // 创建新的管理员用户
      const password = 'admin123';
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            username: 'admin',
            email: 'admin@workflow.com',
            password_hash: passwordHash,
            role: 'admin',
            is_active: true
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ 创建管理员用户失败:', createError.message);
      } else {
        console.log('✅ 管理员用户创建成功！');
        console.log('👤 用户名: admin');
        console.log('🔑 密码: admin123');
        console.log('📧 邮箱:', newUser.email);
        console.log('🎭 角色:', newUser.role);
        console.log('🆔 ID:', newUser.id);
      }
    }
    
    // 验证登录
    console.log('\n🔐 验证登录...');
    const { data: loginTest, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('is_active', true)
      .single();
    
    if (loginError) {
      console.error('❌ 登录验证失败:', loginError.message);
    } else {
      console.log('✅ 登录验证成功！');
      console.log('👤 用户信息:');
      console.log(`   用户名: ${loginTest.username}`);
      console.log(`   邮箱: ${loginTest.email}`);
      console.log(`   角色: ${loginTest.role}`);
      console.log(`   状态: ${loginTest.is_active ? '活跃' : '未激活'}`);
      console.log(`   创建时间: ${loginTest.created_at}`);
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }
}

createAdminUser();
