const { Pool } = require('pg');
require('dotenv').config();

async function testDepartmentTables() {
    console.log('🔍 开始测试部门表...\n');
    
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL 未配置');
        console.log('请在 .env 文件中设置 DATABASE_URL');
        return;
    }
    
    console.log('📍 数据库 URL:', DATABASE_URL.substring(0, 30) + '...');
    
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        // 测试连接
        console.log('\n1️⃣ 测试数据库连接...');
        await pool.query('SELECT 1');
        console.log('✅ 数据库连接成功\n');
        
        // 检查四个部门表
        const departments = ['产业分析', '创意实践', '活动策划', '资源拓展'];
        
        console.log('2️⃣ 检查部门表是否存在...\n');
        for (const dept of departments) {
            try {
                // 检查表是否存在
                const checkTable = await pool.query(
                    `SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = $1
                    )`,
                    [dept]
                );
                
                const exists = checkTable.rows[0].exists;
                
                if (exists) {
                    // 统计记录数
                    const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${dept}"`);
                    const count = countResult.rows[0].count;
                    console.log(`✅ ${dept}表存在，包含 ${count} 条记录`);
                    
                    // 显示前3条记录的项目名称
                    if (count > 0) {
                        const projects = await pool.query(
                            `SELECT id, 项目名称, 状态, 优先级 FROM "${dept}" ORDER BY 创建时间 DESC LIMIT 3`
                        );
                        console.log(`   示例项目:`);
                        projects.rows.forEach(p => {
                            console.log(`   - [${p.id}] ${p.项目名称} (状态:${p.状态}, 优先级:${p.优先级})`);
                        });
                    }
                } else {
                    console.log(`❌ ${dept}表不存在`);
                }
                console.log('');
            } catch (error) {
                console.error(`❌ 检查${dept}表时出错:`, error.message);
                console.log('');
            }
        }
        
        // 测试API查询
        console.log('3️⃣ 测试查询语句...\n');
        for (const dept of departments) {
            try {
                const sql = `SELECT * FROM "${dept}" WHERE 1=1 ORDER BY 创建时间 DESC`;
                const result = await pool.query(sql);
                console.log(`✅ ${dept}查询成功，返回 ${result.rows.length} 条记录`);
            } catch (error) {
                console.error(`❌ 查询${dept}失败:`, error.message);
            }
        }
        
        console.log('\n✅ 所有测试完成！');
        
    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        console.error('错误详情:', error);
    } finally {
        await pool.end();
    }
}

testDepartmentTables();

