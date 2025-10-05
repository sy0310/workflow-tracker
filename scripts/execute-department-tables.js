const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

async function executeDepartmentTables() {
  try {
    console.log('🔧 执行部门表创建脚本...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 读取 SQL 文件
    const sqlContent = fs.readFileSync('scripts/create-department-tables.sql', 'utf8');
    
    console.log('📋 准备执行的 SQL 内容:');
    console.log('='.repeat(50));
    console.log(sqlContent);
    console.log('='.repeat(50));
    
    // 由于 Supabase 客户端可能不支持直接执行复杂 SQL，我们提供手动执行的指导
    console.log('\n💡 请在 Supabase Dashboard 中手动执行以下步骤:');
    console.log('\n1. 访问 Supabase Dashboard');
    console.log('   https://supabase.com/dashboard/project/npbudtzlkdbnyjdkusfd');
    console.log('\n2. 点击左侧菜单 "SQL Editor"');
    console.log('\n3. 点击 "New query"');
    console.log('\n4. 复制上面的 SQL 内容并粘贴到编辑器中');
    console.log('\n5. 点击 "Run" 执行');
    console.log('\n6. 执行完成后，四个部门表将被创建并填充示例数据');
    
    console.log('\n📋 将要创建的表:');
    console.log('  - 产业分析');
    console.log('  - 创意实践');
    console.log('  - 活动策划');
    console.log('  - 资源拓展');
    
    console.log('\n🎯 每个表包含的字段:');
    console.log('  - 基础字段: 项目名称、项目描述、负责人、参与人员、优先级、状态等');
    console.log('  - 部门特有字段: 根据部门业务特点设计的专业字段');
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  }
}

executeDepartmentTables();
