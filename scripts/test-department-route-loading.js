require('dotenv').config();

async function testDepartmentRouteLoading() {
  try {
    console.log('🔍 测试部门路由加载...');
    
    // 测试直接导入部门路由
    console.log('\n📦 导入部门路由模块...');
    try {
      const departmentRoutes = require('../routes/departments');
      console.log('✅ 部门路由模块导入成功');
      
      // 检查路由方法
      if (departmentRoutes && typeof departmentRoutes === 'function') {
        console.log('✅ 路由模块是函数类型');
        
        // 创建一个简单的 Express 应用来测试路由
        const express = require('express');
        const app = express();
        
        // 使用路由
        app.use('/api/departments', departmentRoutes);
        
        console.log('✅ 路由注册成功');
        
        // 测试路由路径
        app._router.stack.forEach(function(r){
          if (r.route && r.route.path){
            console.log('📍 注册的路由:', r.route.path);
          }
        });
        
      } else {
        console.log('❌ 路由模块类型错误:', typeof departmentRoutes);
      }
      
    } catch (error) {
      console.log('❌ 部门路由模块导入失败:', error.message);
      console.log('📋 错误详情:', error.stack);
    }
    
    // 测试数据库连接
    console.log('\n🗄️ 测试数据库连接...');
    try {
      const usePostgres = process.env.DATABASE_URL;
      const db = usePostgres ? require('../database-postgres') : require('../database');
      
      if (db) {
        console.log('✅ 数据库模块加载成功');
        console.log('📊 数据库类型:', usePostgres ? 'PostgreSQL' : 'SQLite');
        
        // 测试查询
        const result = await db.query('SELECT 1 as test');
        console.log('✅ 数据库查询测试成功');
        
      } else {
        console.log('❌ 数据库模块加载失败');
      }
    } catch (error) {
      console.log('❌ 数据库连接测试失败:', error.message);
    }
    
    console.log('\n📋 部门路由加载测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('📋 错误详情:', error.stack);
  }
}

testDepartmentRouteLoading();
