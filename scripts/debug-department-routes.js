const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debugDepartmentRoutes() {
  try {
    console.log('🔍 调试部门路由问题...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 直接测试部门表的查询
    const departments = ['产业分析', '创意实践', '活动策划', '资源拓展'];
    
    for (const dept of departments) {
      console.log(`\n🏢 测试 ${dept} 表...`);
      
      try {
        // 使用 Supabase 客户端查询
        const { data, error } = await supabase
          .from(dept)
          .select('*')
          .limit(5);
        
        if (error) {
          console.log(`❌ Supabase 查询失败:`, error.message);
          console.log(`📋 错误详情:`, error);
        } else {
          console.log(`✅ Supabase 查询成功`);
          console.log(`📊 数据数量: ${data.length}`);
          if (data.length > 0) {
            console.log(`📋 示例数据:`, Object.keys(data[0]));
          }
        }
        
      } catch (error) {
        console.log(`❌ 查询异常:`, error.message);
      }
    }
    
    // 测试 PostgreSQL 直连查询
    console.log('\n🗄️ 测试 PostgreSQL 直连查询...');
    
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL
      });
      
      const client = await pool.connect();
      
      for (const dept of departments) {
        console.log(`\n📡 直连查询 ${dept} 表...`);
        
        try {
          const result = await client.query(`SELECT * FROM "${dept}" LIMIT 3`);
          console.log(`✅ 直连查询成功`);
          console.log(`📊 数据数量: ${result.rows.length}`);
          if (result.rows.length > 0) {
            console.log(`📋 列名:`, Object.keys(result.rows[0]));
            console.log(`📋 示例数据:`, result.rows[0]);
          }
        } catch (error) {
          console.log(`❌ 直连查询失败:`, error.message);
        }
      }
      
      client.release();
      await pool.end();
      
    } catch (error) {
      console.log(`❌ PostgreSQL 连接失败:`, error.message);
    }
    
    console.log('\n📋 调试完成!');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugDepartmentRoutes();
