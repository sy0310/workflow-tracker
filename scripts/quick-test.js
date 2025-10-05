const axios = require('axios');
require('dotenv').config();

async function quickTest() {
  try {
    console.log('🔍 快速测试服务器状态...');
    
    const baseURL = 'http://localhost:3000';
    
    // 测试服务器是否运行
    try {
      const response = await axios.get(baseURL, { timeout: 3000 });
      console.log('✅ 服务器运行正常');
    } catch (error) {
      console.log('❌ 服务器连接失败:', error.message);
      return;
    }
    
    // 测试登录
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      }, { timeout: 5000 });
      
      console.log('✅ 登录成功');
      const token = loginResponse.data.token;
      
      // 测试部门路由
      const deptResponse = await axios.get(`${baseURL}/api/departments/产业分析/projects`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      
      console.log('✅ 部门路由正常');
      console.log(`📊 项目数量: ${deptResponse.data.length}`);
      
    } catch (error) {
      console.log('❌ 登录或部门路由失败:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

quickTest();
