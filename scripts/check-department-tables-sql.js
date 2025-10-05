const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkDepartmentTablesWithSQL() {
  try {
    console.log('🔍 使用 SQL 检查部门表结构...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 四个部门表名
    const departmentTables = [
      '产业分析',
      '创意实践', 
      '活动运营',
      '资源拓展'
    ];
    
    console.log('📋 检查以下部门表:');
    departmentTables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });
    
    // 首先检查所有表
    console.log('\n🔍 检查所有表...');
    const { data: allTables, error: allTablesError } = await supabase.rpc('get_all_tables', {});
    
    if (allTablesError) {
      console.log('❌ 无法获取表列表，尝试直接查询部门表...');
    } else {
      console.log('📋 数据库中的所有表:');
      allTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // 直接尝试查询每个部门表
    for (const tableName of departmentTables) {
      console.log(`\n🔍 尝试查询表: ${tableName}`);
      
      try {
        // 尝试查询表数据
        const { data: rows, error: dataError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (dataError) {
          console.log(`❌ 表 ${tableName} 不存在或无法访问: ${dataError.message}`);
        } else {
          console.log(`✅ 表 ${tableName} 存在`);
          if (rows && rows.length > 0) {
            console.log(`📋 表结构 (基于第一行数据):`);
            Object.keys(rows[0]).forEach(key => {
              const value = rows[0][key];
              const type = typeof value;
              console.log(`  - ${key}: ${type} (示例值: ${value})`);
            });
          } else {
            console.log(`📋 表 ${tableName} 为空，但结构未知`);
          }
        }
      } catch (error) {
        console.log(`❌ 查询表 ${tableName} 失败: ${error.message}`);
      }
    }
    
    // 尝试获取表结构信息
    console.log('\n🔍 尝试获取表结构信息...');
    const { data: tableInfo, error: tableInfoError } = await supabase
      .rpc('get_table_columns', { table_name: '产业分析' });
    
    if (tableInfoError) {
      console.log('❌ 无法通过 RPC 获取表结构信息');
      console.log('💡 建议：请在 Supabase Dashboard 中查看表结构');
    } else {
      console.log('📋 表结构信息:', tableInfo);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkDepartmentTablesWithSQL();
