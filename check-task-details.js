// 检查任务详细信息
const db = require('./database-postgres');

async function checkTaskDetails() {
  try {
    console.log('检查任务详细信息...');
    
    // 获取任务 3 的完整信息
    const task = await db.query('SELECT * FROM tasks WHERE id = 3');
    
    if (task.length > 0) {
      console.log('任务详情:');
      console.log(JSON.stringify(task[0], null, 2));
      
      // 检查 description 字段
      if (task[0].description) {
        console.log('\nDescription 字段内容:');
        console.log(task[0].description);
        
        try {
          const parsed = JSON.parse(task[0].description);
          console.log('\n解析后的 JSON:');
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('Description 不是有效的 JSON 格式');
        }
      }
    } else {
      console.log('未找到 ID 为 3 的任务');
    }
    
    // 检查是否有其他任务
    const allTasks = await db.query('SELECT id, title, description FROM tasks');
    console.log(`\n数据库中总共有 ${allTasks.length} 条任务记录`);
    
  } catch (error) {
    console.error('检查任务详情时出错:', error);
  } finally {
    await db.close();
  }
}

checkTaskDetails();
