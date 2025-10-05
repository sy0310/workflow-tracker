const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkTables() {
  try {
    console.log('🔍 检查数据库表结构...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('📍 项目 URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. 检查所有表
    console.log('\n📋 检查所有表...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ 查询表列表失败:', tablesError.message);
      return;
    }
    
    console.log('✅ 找到的表:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 2. 检查每个表的结构
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n🔍 检查表 ${tableName} 的结构:`);
      
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');
      
      if (columnsError) {
        console.error(`❌ 查询表 ${tableName} 结构失败:`, columnsError.message);
        continue;
      }
      
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${defaultValue}`);
      });
      
      // 3. 检查表中的数据
      try {
        const { data: rows, error: dataError } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);
        
        if (dataError) {
          console.log(`  📊 数据查询失败: ${dataError.message}`);
        } else {
          console.log(`  📊 数据行数: ${rows.length}`);
          if (rows.length > 0) {
            console.log(`  📋 示例数据:`, JSON.stringify(rows[0], null, 2));
          }
        }
      } catch (error) {
        console.log(`  📊 数据查询失败: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkTables();
