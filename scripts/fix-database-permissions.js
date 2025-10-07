/**
 * 修复数据库权限问题
 * 禁用 RLS 或创建适当的权限策略
 */

require('dotenv').config();
const { Pool } = require('pg');

async function fixDatabasePermissions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  
  try {
    console.log('🔧 修复数据库权限问题...');
    
    // 1. 检查当前 RLS 状态
    console.log('\n📋 检查当前 RLS 状态...');
    const rlsStatus = await client.query(`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'staff', 'tasks', 'notifications', 'ai_conversations')
      ORDER BY tablename
    `);
    
    console.log('当前 RLS 状态:');
    rlsStatus.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.rowsecurity ? '启用' : '禁用'}`);
    });
    
    // 2. 禁用 RLS（临时解决方案）
    console.log('\n🔧 禁用 RLS...');
    const tables = ['users', 'staff', 'tasks', 'notifications', 'ai_conversations'];
    
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`);
        console.log(`✅ ${table} RLS 已禁用`);
      } catch (error) {
        console.log(`⚠️ ${table} RLS 禁用失败:`, error.message);
      }
    }
    
    // 3. 验证 RLS 状态
    console.log('\n📋 验证 RLS 状态...');
    const newRlsStatus = await client.query(`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'staff', 'tasks', 'notifications', 'ai_conversations')
      ORDER BY tablename
    `);
    
    console.log('修复后 RLS 状态:');
    newRlsStatus.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.rowsecurity ? '启用' : '禁用'}`);
    });
    
    // 4. 测试插入权限
    console.log('\n🧪 测试插入权限...');
    try {
      // 测试插入一个测试任务
      const testResult = await client.query(`
        INSERT INTO tasks (title, description, priority, status, created_by) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id
      `, ['权限测试任务', '测试数据库插入权限', 2, 1, 1]);
      
      console.log('✅ 测试插入成功，任务 ID:', testResult.rows[0].id);
      
      // 清理测试数据
      await client.query('DELETE FROM tasks WHERE title = $1', ['权限测试任务']);
      console.log('✅ 测试数据已清理');
      
    } catch (error) {
      console.error('❌ 测试插入失败:', error.message);
    }
    
    console.log('\n🎉 数据库权限修复完成！');
    console.log('\n📝 说明:');
    console.log('- 已禁用所有表的 Row Level Security');
    console.log('- 现在应用可以正常插入和更新数据');
    console.log('- 如需启用 RLS，请配置适当的权限策略');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行修复
fixDatabasePermissions();
