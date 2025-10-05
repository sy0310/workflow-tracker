const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDepartmentInsert() {
  try {
    console.log('🧪 测试部门表插入功能...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 测试四个部门表
    const departments = [
      { name: '产业分析', table: '产业分析' },
      { name: '创意实践', table: '创意实践' },
      { name: '活动策划', table: '活动策划' },
      { name: '资源拓展', table: '资源拓展' }
    ];
    
    for (const dept of departments) {
      console.log(`\n🔍 测试表: ${dept.name}`);
      
      try {
        // 先查询表结构（通过插入一条最小数据来了解结构）
        const testData = {
          项目名称: `测试项目_${dept.name}_${Date.now()}`,
          项目描述: '这是一个测试项目',
          负责人: 'admin',
          优先级: 2,
          状态: 1,
          创建者: 1
        };
        
        console.log('📝 尝试插入测试数据:', testData);
        
        const { data, error } = await supabase
          .from(dept.table)
          .insert([testData])
          .select();
        
        if (error) {
          console.log(`❌ 插入失败: ${error.message}`);
          
          // 如果是因为表不存在或结构问题，提供解决方案
          if (error.message.includes('Could not find the table')) {
            console.log(`💡 表 ${dept.table} 不存在，需要创建`);
          } else if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.log(`💡 表结构不匹配，需要更新表结构`);
          }
        } else {
          console.log(`✅ 插入成功! 数据:`, data);
          
          // 删除测试数据
          if (data && data[0] && data[0].id) {
            await supabase
              .from(dept.table)
              .delete()
              .eq('id', data[0].id);
            console.log('🗑️ 测试数据已清理');
          }
        }
        
      } catch (error) {
        console.log(`❌ 测试表 ${dept.name} 失败:`, error.message);
      }
    }
    
    console.log('\n📋 总结:');
    console.log('如果所有表都插入失败，说明需要在 Supabase Dashboard 中执行建表 SQL');
    console.log('如果部分表成功，说明表已存在但结构可能需要调整');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDepartmentInsert();
