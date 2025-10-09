const db = require('../database');

async function initDatabase() {
    try {
        console.log('🔧 开始初始化数据库...');
        
        // 初始化数据库表
        await db.initDatabase();
        
        console.log('✅ 数据库初始化成功！');
        
        // 测试查询
        const users = await db.query('SELECT * FROM users');
        console.log('👥 当前用户数量:', users.length);
        
        const tasks = await db.query('SELECT * FROM tasks');
        console.log('📋 当前任务数量:', tasks.length);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    }
}

initDatabase();

