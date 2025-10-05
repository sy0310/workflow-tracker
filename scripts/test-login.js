const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
  try {
    console.log('🔐 测试登录功能...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('📍 项目 URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. 检查用户表是否存在并查看所有用户
    console.log('\n👤 检查用户表...');
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ 查询用户表失败:', usersError.message);
      return;
    }
    
    console.log('✅ 用户表连接成功');
    console.log(`📊 用户数量: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('👥 用户列表:');
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}, 角色: ${user.role}, 状态: ${user.is_active ? '活跃' : '未激活'}`);
      });
    } else {
      console.log('⚠️  用户表为空，正在创建管理员用户...');
      
      // 创建管理员用户
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
        console.error('❌ 创建用户失败:', createError.message);
        console.log('\n🔧 手动创建用户的方法：');
        console.log('1. 访问 Supabase Dashboard');
        console.log('2. 点击 "Table Editor"');
        console.log('3. 选择 "users" 表');
        console.log('4. 点击 "Insert row"');
        console.log('5. 填写以下数据：');
        console.log('   用户名: admin');
        console.log('   邮箱: admin@workflow.com');
        console.log('   密码哈希: ' + passwordHash);
        console.log('   角色: admin');
        console.log('   状态: true');
        return;
      }
      
      console.log('✅ 管理员用户创建成功！');
      console.log('👤 用户信息:');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   用户名: ${newUser.username}`);
      console.log(`   邮箱: ${newUser.email}`);
      console.log(`   角色: ${newUser.role}`);
    }
    
    // 2. 测试登录验证
    console.log('\n🔐 测试登录验证...');
    const testUsername = 'admin';
    const testPassword = 'admin123';
    
    // 查找用户
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('username', testUsername)
      .eq('is_active', true)
      .single();
    
    if (findError) {
      console.error('❌ 查找用户失败:', findError.message);
      return;
    }
    
    if (!user) {
      console.error('❌ 用户不存在或未激活');
      return;
    }
    
    console.log('✅ 找到用户:', user.username);
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isValidPassword) {
      console.log('✅ 密码验证成功！');
      console.log('🎉 登录测试通过！');
      console.log('\n📱 现在可以访问 Vercel 部署的 URL 进行登录：');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
    } else {
      console.error('❌ 密码验证失败');
      console.log('🔧 可能的原因：');
      console.log('   1. 密码哈希值不正确');
      console.log('   2. 数据库中存储的密码哈希有问题');
      console.log('\n💡 解决方案：');
      console.log('   重新创建用户或更新密码哈希');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testLogin();
