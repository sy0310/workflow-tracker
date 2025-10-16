// 检查 PostgreSQL 数据库中的实际数据
const db = require('./database-postgres');

async function checkData() {
  try {
    console.log('检查 PostgreSQL 数据库中的数据...');
    
    // 1. 检查所有 tasks 表的数据
    console.log('\n=== 所有 tasks 数据 ===');
    const allTasks = await db.query('SELECT id, title, description FROM tasks ORDER BY id');
    console.log(`总共 ${allTasks.length} 条任务记录:`);
    
    allTasks.forEach(task => {
      console.log(`ID: ${task.id}, Title: "${task.title}"`);
      if (task.description) {
        try {
          const desc = JSON.parse(task.description);
          if (desc.department) {
            console.log(`  Department: "${desc.department}"`);
          }
        } catch (e) {
          console.log(`  Description: ${task.description.substring(0, 100)}...`);
        }
      }
    });
    
    // 2. 测试特定的部门查询
    console.log('\n=== 测试部门查询 ===');
    const departments = ['活动策划', '创意实践', '产业分析', '资源拓展'];
    
    for (const dept of departments) {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM tasks WHERE description LIKE $1',
        [`%"department":"${dept}"%`]
      );
      console.log(`部门 "${dept}": ${result[0].count} 个项目`);
    }
    
    // 3. 检查是否有任何包含 department 字段的数据
    console.log('\n=== 包含 department 字段的数据 ===');
    const deptTasks = await db.query(
      'SELECT id, title, description FROM tasks WHERE description LIKE $1',
      ['%"department":%']
    );
    console.log(`找到 ${deptTasks.length} 条包含部门信息的记录:`);
    
    deptTasks.forEach(task => {
      try {
        const desc = JSON.parse(task.description);
        console.log(`ID: ${task.id}, Title: "${task.title}", Department: "${desc.department}"`);
      } catch (e) {
        console.log(`ID: ${task.id}, Title: "${task.title}", Raw description: ${task.description}`);
      }
    });
    
  } catch (error) {
    console.error('检查数据时出错:', error);
  } finally {
    await db.close();
  }
}

checkData();
