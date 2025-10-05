const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkExistingTableStructure() {
  try {
    console.log('🔍 检查现有表结构...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 测试四个部门表
    const departments = ['产业分析', '创意实践', '活动策划', '资源拓展'];
    
    for (const tableName of departments) {
      console.log(`\n🔍 检查表: ${tableName}`);
      
      try {
        // 尝试查询表结构，通过插入最小数据来测试
        const testCases = [
          { 项目名称: '测试1', 项目描述: '测试', 负责人: 'admin' },
          { 项目名称: '测试2', 项目描述: '测试', 负责人: 'admin', 优先级: 2 },
          { 项目名称: '测试3', 项目描述: '测试', 负责人: 'admin', 优先级: 2, 状态: 1 },
          { 项目名称: '测试4', 项目描述: '测试', 负责人: 'admin', 优先级: 2, 状态: 1, 创建者: 1 },
          { 项目名称: '测试5', 项目描述: '测试', 负责人: 'admin', 优先级: 2, 状态: 1, 创建时间: new Date().toISOString() }
        ];
        
        let foundColumns = [];
        
        for (let i = 0; i < testCases.length; i++) {
          const testData = testCases[i];
          console.log(`  测试 ${i + 1}: 尝试插入字段`, Object.keys(testData));
          
          const { data, error } = await supabase
            .from(tableName)
            .insert([testData])
            .select();
          
          if (!error) {
            console.log(`  ✅ 成功! 字段 ${Object.keys(testData).join(', ')} 存在`);
            foundColumns = Object.keys(testData);
            
            // 清理测试数据
            if (data && data[0] && data[0].id) {
              await supabase
                .from(tableName)
                .delete()
                .eq('id', data[0].id);
            }
            break;
          } else {
            console.log(`  ❌ 失败: ${error.message}`);
            // 如果是因为缺少字段，继续下一个测试
            if (error.message.includes('column') && error.message.includes('does not exist')) {
              continue;
            } else {
              break;
            }
          }
        }
        
        console.log(`📋 表 ${tableName} 的可用字段:`, foundColumns);
        
      } catch (error) {
        console.log(`❌ 检查表 ${tableName} 失败:`, error.message);
      }
    }
    
    console.log('\n💡 建议:');
    console.log('1. 如果表结构不完整，需要在 Supabase Dashboard 中执行完整的建表 SQL');
    console.log('2. 或者修改代码以适应当前表结构');
    console.log('3. 执行 scripts/create-department-tables.sql 中的 SQL 语句');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkExistingTableStructure();
