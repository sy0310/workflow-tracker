const { Pool } = require('pg');
require('dotenv').config();

async function checkTableStructure() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        const departments = ['产业分析', '创意实践', '活动策划', '资源拓展'];
        
        for (const dept of departments) {
            console.log(`\n${dept}表结构:`);
            const result = await pool.query(
                `SELECT column_name, data_type, character_maximum_length 
                 FROM information_schema.columns 
                 WHERE table_name = $1 
                 ORDER BY ordinal_position`,
                [dept]
            );
            
            result.rows.forEach(col => {
                const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
                console.log(`  ${col.column_name}: ${col.data_type}${length}`);
            });
        }
    } catch (error) {
        console.error('错误:', error);
    } finally {
        await pool.end();
    }
}

checkTableStructure();

