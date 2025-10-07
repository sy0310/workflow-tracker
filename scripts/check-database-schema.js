/**
 * 检查数据库表结构
 */

require('dotenv').config();
const { Pool } = require('pg');

async function checkDatabaseSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  
  try {
    console.log('🔍 检查数据库表结构...');
    
    // 1. 检查所有表
    console.log('\n📋 所有表:');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 2. 检查 tasks 表结构
    console.log('\n📋 tasks 表结构:');
    const tasksColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      ORDER BY ordinal_position
    `);
    
    tasksColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 3. 检查是否有部门表
    console.log('\n📋 检查部门表:');
    const departmentTables = ['产业分析', '创意实践', '活动策划', '资源拓展'];
    
    for (const dept of departmentTables) {
      try {
        const result = await client.query(`
          SELECT column_name, data_type
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [dept]);
        
        if (result.rows.length > 0) {
          console.log(`\n  ${dept} 表结构:`);
          result.rows.forEach(row => {
            console.log(`    ${row.column_name}: ${row.data_type}`);
          });
        } else {
          console.log(`  ${dept}: 表不存在`);
        }
      } catch (error) {
        console.log(`  ${dept}: 表不存在 (${error.message})`);
      }
    }
    
    // 4. 检查用户表
    console.log('\n📋 users 表结构:');
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    usersColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行检查
checkDatabaseSchema();
