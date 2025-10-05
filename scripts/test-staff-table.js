const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testStaffTable() {
  try {
    console.log('🧪 测试 staff 表...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 测试 staff 表
    console.log('🔍 检查 staff 表...');
    
    try {
      // 先查询现有数据
      const { data: existingStaff, error: queryError } = await supabase
        .from('staff')
        .select('*')
        .limit(1);
      
      if (queryError) {
        console.log('❌ 查询 staff 表失败:', queryError.message);
        
        if (queryError.message.includes('Could not find the table')) {
          console.log('💡 staff 表不存在，需要创建');
          return;
        }
      } else {
        console.log('✅ staff 表存在');
        if (existingStaff && existingStaff.length > 0) {
          console.log('📋 示例数据:', existingStaff[0]);
          console.log('📋 可用字段:', Object.keys(existingStaff[0]));
        } else {
          console.log('📋 staff 表为空');
        }
      }
      
      // 测试插入
      const testStaff = {
        name: '测试人员',
        wechat_id: 'test_' + Date.now(),
        wechat_name: '测试人员',
        email: 'test@example.com',
        phone: '13800138000',
        department: '测试部门',
        position: '测试职位'
      };
      
      console.log('📝 尝试插入测试数据:', testStaff);
      
      const { data: insertResult, error: insertError } = await supabase
        .from('staff')
        .insert([testStaff])
        .select();
      
      if (insertError) {
        console.log('❌ 插入失败:', insertError.message);
      } else {
        console.log('✅ 插入成功! 数据:', insertResult);
        
        // 清理测试数据
        if (insertResult && insertResult[0] && insertResult[0].id) {
          await supabase
            .from('staff')
            .delete()
            .eq('id', insertResult[0].id);
          console.log('🗑️ 测试数据已清理');
        }
      }
      
    } catch (error) {
      console.log('❌ 测试 staff 表失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testStaffTable();
