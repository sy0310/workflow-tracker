#!/usr/bin/env node

/**
 * 简单的 Supabase 连接测试
 * 使用您提供的代码片段进行测试
 */

const { createClient } = require('@supabase/supabase-js');

// 使用您提供的配置
const supabase = createClient(
  'https://htgghiyahgaiwxdsukmv.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2doaXlhaGdhaXd4ZHN1a212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTYzOTMsImV4cCI6MjA3NjEzMjM5M30.HSkHQnyKFoilEWXBAfX7QpDXr9v93zmh8awgbgDL-vs'
);

async function testConnection() {
  console.log('🚀 测试 Supabase 连接...');
  console.log('📍 URL:', 'https://htgghiyahgaiwxdsukmv.supabase.co');
  
  try {
    // 使用您提供的查询
    const { data, error } = await supabase
      .from('todos')
      .select();
    
    if (error) {
      console.log('❌ 查询失败:', error.message);
      console.log('🔍 错误详情:', error);
      
      // 尝试其他简单的查询
      console.log('\n🔄 尝试其他查询...');
      
      // 尝试查询一个可能存在的表
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
        
      if (usersError) {
        console.log('❌ users 表查询失败:', usersError.message);
      } else {
        console.log('✅ users 表查询成功');
      }
      
      // 尝试查询 staff 表
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('count')
        .limit(1);
        
      if (staffError) {
        console.log('❌ staff 表查询失败:', staffError.message);
      } else {
        console.log('✅ staff 表查询成功');
      }
      
    } else {
      console.log('✅ 查询成功！');
      console.log('📊 数据:', data);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testConnection();
