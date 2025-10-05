const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixRLSPolicies() {
  try {
    console.log('🔧 修复 RLS 策略...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('📍 项目 URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. 检查当前 RLS 状态
    console.log('\n📋 检查 RLS 状态...');
    
    // 2. 提供修复 RLS 的 SQL 命令
    console.log('\n🔧 请在 Supabase Dashboard 中执行以下 SQL 命令：');
    console.log('\n=== 修复 RLS 策略 ===');
    console.log(`
-- 1. 禁用 RLS（临时解决方案）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. 或者创建允许匿名访问的策略
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow anonymous access" ON users;
-- CREATE POLICY "Allow anonymous access" ON users FOR ALL USING (true) WITH CHECK (true);

-- 3. 对其他表也执行相同操作
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- 4. 验证 RLS 状态
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'staff', 'tasks', 'notifications', 'user_sessions');
    `);
    
    console.log('\n📝 执行步骤：');
    console.log('1. 访问 https://supabase.com/dashboard/project/npbudtzlkdbnyjdkusfd/editor/17366');
    console.log('2. 点击 "SQL Editor"');
    console.log('3. 点击 "New query"');
    console.log('4. 复制上面的 SQL 代码');
    console.log('5. 点击 "Run" 执行');
    console.log('6. 执行完成后，再次运行登录测试');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixRLSPolicies();
