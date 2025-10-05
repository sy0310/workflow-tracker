const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkDepartmentTables() {
  try {
    console.log('🔍 检查四个部门表结构...');
    
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
    
    // 检查每个部门表
    for (const tableName of departmentTables) {
      console.log(`\n🔍 检查表: ${tableName}`);
      
      try {
        // 查询表结构
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .order('ordinal_position');
        
        if (columnsError) {
          console.log(`❌ 表 ${tableName} 不存在或无法访问: ${columnsError.message}`);
          continue;
        }
        
        console.log('📝 表结构:');
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${defaultValue}`);
        });
        
        // 查询示例数据
        try {
          const { data: rows, error: dataError } = await supabase
            .from(tableName)
            .select('*')
            .limit(2);
          
          if (dataError) {
            console.log(`📊 数据查询失败: ${dataError.message}`);
          } else {
            console.log(`📊 数据行数: ${rows.length}`);
            if (rows.length > 0) {
              console.log(`📋 示例数据:`);
              console.log(JSON.stringify(rows[0], null, 2));
            }
          }
        } catch (error) {
          console.log(`📊 数据查询失败: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`❌ 检查表 ${tableName} 失败: ${error.message}`);
      }
    }
    
    // 也检查一下是否有其他相关的表
    console.log('\n🔍 检查所有表...');
    const { data: allTables, error: allTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!allTablesError && allTables) {
      console.log('📋 数据库中的所有表:');
      allTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkDepartmentTables();
