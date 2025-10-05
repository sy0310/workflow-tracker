require('dotenv').config();

async function testDepartmentRouteSimulation() {
  try {
    console.log('🔍 模拟部门路由测试...');
    
    // 导入数据库模块
    const db = require('../database-postgres');
    
    const department = '产业分析';
    const { status, priority } = { status: null, priority: null };
    
    let sql = `SELECT * FROM "${department}" WHERE 1=1`;
    const params = [];
    let paramCount = 1;
    
    if (status) {
      sql += ` AND 状态 = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (priority) {
      sql += ` AND 优先级 = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }
    
    sql += ' ORDER BY 创建时间 DESC';
    
    console.log(`📡 执行 SQL: ${sql}`);
    console.log(`📊 参数: ${JSON.stringify(params)}`);
    
    try {
      const projects = await db.query(sql, params);
      console.log('✅ 查询成功');
      console.log(`📊 项目数量: ${projects.length}`);
      
      if (projects.length > 0) {
        console.log('📋 第一个项目:', projects[0]);
      }
      
    } catch (error) {
      console.log('❌ 查询失败:', error.message);
      console.log('📋 错误详情:', error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('📋 错误详情:', error);
  }
}

testDepartmentRouteSimulation();
