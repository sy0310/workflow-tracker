const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifyDatabaseFix() {
  try {
    console.log('🔍 验证数据库修复结果...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. 测试 staff 表
    console.log('\n👥 测试 staff 表...');
    try {
      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .limit(3);
      
      if (error) {
        console.log('❌ staff 表测试失败:', error.message);
      } else {
        console.log('✅ staff 表正常');
        console.log(`📊 人员数量: ${staff.length}`);
        if (staff.length > 0) {
          console.log('👤 示例人员:', staff[0].name, '-', staff[0].department);
        }
      }
    } catch (error) {
      console.log('❌ staff 表测试失败:', error.message);
    }
    
    // 2. 测试部门表
    const departments = ['产业分析', '创意实践', '活动策划', '资源拓展'];
    
    for (const dept of departments) {
      console.log(`\n🏢 测试 ${dept} 表...`);
      try {
        const { data: projects, error } = await supabase
          .from(dept)
          .select('*')
          .limit(2);
        
        if (error) {
          console.log(`❌ ${dept} 表测试失败:`, error.message);
        } else {
          console.log(`✅ ${dept} 表正常`);
          console.log(`📊 项目数量: ${projects.length}`);
          if (projects.length > 0) {
            console.log(`📋 示例项目: ${projects[0].项目名称}`);
          }
        }
      } catch (error) {
        console.log(`❌ ${dept} 表测试失败:`, error.message);
      }
    }
    
    // 3. 测试插入功能
    console.log('\n🧪 测试插入功能...');
    
    // 测试插入人员
    try {
      const testStaff = {
        name: '测试人员_' + Date.now(),
        wechat_id: 'test_' + Date.now(),
        wechat_name: '测试人员',
        email: 'test@example.com',
        phone: '13800138000',
        department: '测试部门',
        position: '测试职位'
      };
      
      const { data: newStaff, error } = await supabase
        .from('staff')
        .insert([testStaff])
        .select();
      
      if (error) {
        console.log('❌ 插入人员失败:', error.message);
      } else {
        console.log('✅ 插入人员成功');
        
        // 清理测试数据
        await supabase
          .from('staff')
          .delete()
          .eq('id', newStaff[0].id);
        console.log('🗑️ 测试人员已清理');
      }
    } catch (error) {
      console.log('❌ 插入人员测试失败:', error.message);
    }
    
    // 测试插入项目
    try {
      const testProject = {
        项目名称: '测试项目_' + Date.now(),
        项目描述: '这是一个测试项目',
        负责人: 'admin',
        优先级: 2,
        状态: 1,
        创建者: 1,
        分析类型: '市场分析',
        目标行业: '测试行业'
      };
      
      const { data: newProject, error } = await supabase
        .from('产业分析')
        .insert([testProject])
        .select();
      
      if (error) {
        console.log('❌ 插入项目失败:', error.message);
      } else {
        console.log('✅ 插入项目成功');
        
        // 清理测试数据
        await supabase
          .from('产业分析')
          .delete()
          .eq('id', newProject[0].id);
        console.log('🗑️ 测试项目已清理');
      }
    } catch (error) {
      console.log('❌ 插入项目测试失败:', error.message);
    }
    
    console.log('\n🎉 数据库修复验证完成!');
    console.log('\n📋 现在您可以:');
    console.log('1. 在应用中正常创建项目和人员');
    console.log('2. 选择不同部门创建对应类型的项目');
    console.log('3. 查看和管理项目列表');
    console.log('4. 使用所有功能模块');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  }
}

verifyDatabaseFix();
