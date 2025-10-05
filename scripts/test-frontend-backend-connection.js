const axios = require('axios');
require('dotenv').config();

async function testFrontendBackendConnection() {
  try {
    console.log('🔍 测试前端与后端连接...');
    
    // 假设本地服务运行在 3000 端口
    const baseURL = 'http://localhost:3000';
    
    console.log('\n📡 测试基础连接...');
    
    // 1. 测试主页
    try {
      const response = await axios.get(baseURL);
      console.log('✅ 主页连接成功');
    } catch (error) {
      console.log('❌ 主页连接失败:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 服务器未运行，请执行: npm start');
        return;
      }
    }
    
    // 2. 测试登录功能
    console.log('\n🔐 测试登录功能...');
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ 登录成功');
        const token = loginResponse.data.token;
        
        // 3. 测试人员 API
        console.log('\n👥 测试人员 API...');
        try {
          const staffResponse = await axios.get(`${baseURL}/api/staff`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('✅ 人员 API 正常');
          console.log(`📊 人员数量: ${staffResponse.data.length}`);
        } catch (error) {
          console.log('❌ 人员 API 失败:', error.response?.data || error.message);
        }
        
        // 4. 测试部门项目 API
        console.log('\n🏢 测试部门项目 API...');
        const departments = ['产业分析', '创意实践', '活动策划', '资源拓展'];
        
        for (const dept of departments) {
          try {
            const deptResponse = await axios.get(`${baseURL}/api/departments/${encodeURIComponent(dept)}/projects`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✅ ${dept} API 正常`);
            console.log(`📊 项目数量: ${deptResponse.data.length}`);
          } catch (error) {
            console.log(`❌ ${dept} API 失败:`, error.response?.data || error.message);
          }
        }
        
        // 5. 测试创建人员
        console.log('\n🧪 测试创建人员...');
        try {
          const createStaffResponse = await axios.post(`${baseURL}/api/staff`, {
            name: '测试人员_' + Date.now(),
            wechat_id: 'test_' + Date.now(),
            wechat_name: '测试人员',
            email: 'test@example.com',
            phone: '13800138000',
            department: '测试部门',
            position: '测试职位'
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (createStaffResponse.status === 201) {
            console.log('✅ 创建人员成功');
            
            // 清理测试数据
            await axios.delete(`${baseURL}/api/staff/${createStaffResponse.data.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('🗑️ 测试人员已清理');
          }
        } catch (error) {
          console.log('❌ 创建人员失败:', error.response?.data || error.message);
        }
        
        // 6. 测试创建项目
        console.log('\n🧪 测试创建项目...');
        try {
          const createProjectResponse = await axios.post(`${baseURL}/api/departments/产业分析/projects`, {
            项目名称: '测试项目_' + Date.now(),
            项目描述: '这是一个测试项目',
            负责人: 'admin',
            优先级: 2,
            状态: 1,
            创建者: 1,
            分析类型: '市场分析',
            目标行业: '测试行业'
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (createProjectResponse.status === 201) {
            console.log('✅ 创建项目成功');
            
            // 清理测试数据
            await axios.delete(`${baseURL}/api/departments/产业分析/projects/${createProjectResponse.data.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('🗑️ 测试项目已清理');
          }
        } catch (error) {
          console.log('❌ 创建项目失败:', error.response?.data || error.message);
        }
        
      } else {
        console.log('❌ 登录失败');
      }
    } catch (error) {
      console.log('❌ 登录测试失败:', error.response?.data || error.message);
    }
    
    console.log('\n📋 连接测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFrontendBackendConnection();
