const { Pool } = require('pg');
require('dotenv').config();

async function testDepartmentQuery() {
  try {
    console.log('🔍 测试部门查询...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    const client = await pool.connect();
    
    const department = '产业分析';
    const sql = `SELECT * FROM "${department}" WHERE 1=1 ORDER BY 创建时间 DESC`;
    
    console.log(`📡 执行查询: ${sql}`);
    
    try {
      const result = await client.query(sql);
      console.log('✅ 查询成功');
      console.log(`📊 数据数量: ${result.rows.length}`);
      
      if (result.rows.length > 0) {
        console.log('📋 第一行数据:', result.rows[0]);
      }
      
    } catch (error) {
      console.log('❌ 查询失败:', error.message);
      console.log('📋 错误详情:', error);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDepartmentQuery();
