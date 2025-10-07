/**
 * 测试任务创建功能
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testTaskCreation() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  
  try {
    console.log('🧪 测试任务创建功能...');
    
    // 1. 检查用户表
    console.log('\n📋 检查用户表...');
    const users = await client.query('SELECT id, username, email FROM users LIMIT 5');
    console.log('用户列表:', users.rows);
    
    if (users.rows.length === 0) {
      console.log('⚠️ 没有找到用户，请先注册一个用户');
      return;
    }
    
    const testUserId = users.rows[0].id;
    console.log(`使用用户 ID: ${testUserId} 进行测试`);
    
    // 2. 测试创建任务
    console.log('\n📝 测试创建任务...');
    const taskData = {
      title: 'AI 助手测试任务',
      description: '这是一个由 AI 助手创建的测试任务',
      assignee_id: null, // 暂时不指定负责人
      priority: 2, // 中等优先级
      status: 1, // 待开始
      start_time: new Date().toISOString(),
      estimated_completion_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
      created_by: testUserId
    };
    
    const insertResult = await client.query(`
      INSERT INTO tasks (title, description, assignee_id, priority, status, start_time, estimated_completion_time, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      taskData.title,
      taskData.description,
      taskData.assignee_id,
      taskData.priority,
      taskData.status,
      taskData.start_time,
      taskData.estimated_completion_time,
      taskData.created_by
    ]);
    
    console.log('✅ 任务创建成功!');
    console.log('任务详情:', insertResult.rows[0]);
    
    // 3. 验证任务查询
    console.log('\n📋 验证任务查询...');
    const tasks = await client.query(`
      SELECT t.*, u.username as creator_name
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = $1
    `, [insertResult.rows[0].id]);
    
    console.log('查询结果:', tasks.rows[0]);
    
    // 4. 清理测试数据
    console.log('\n🧹 清理测试数据...');
    await client.query('DELETE FROM tasks WHERE title = $1', ['AI 助手测试任务']);
    console.log('✅ 测试数据已清理');
    
    console.log('\n🎉 任务创建功能测试通过！');
    console.log('\n📝 结论:');
    console.log('- 数据库权限正常');
    console.log('- 任务创建功能正常');
    console.log('- AI 助手应该可以正常创建任务');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行测试
testTaskCreation();
