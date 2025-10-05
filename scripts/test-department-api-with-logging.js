const axios = require('axios');
require('dotenv').config();

async function testDepartmentApiWithLogging() {
  try {
    console.log('🔍 测试部门 API 并记录详细信息...');
    
    const baseURL = 'http://localhost:3000';
    
    // 登录
    console.log('\n🔐 登录...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 登录成功');
    
    // 测试部门 API
    console.log('\n🏢 测试部门 API...');
    try {
      const response = await axios.get(`${baseURL}/api/departments/产业分析/projects`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ API 调用成功');
      console.log('📊 状态码:', response.status);
      console.log('📊 数据长度:', response.data.length);
      console.log('📋 响应数据:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ API 调用失败');
      console.log('📊 状态码:', error.response?.status);
      console.log('📋 错误信息:', error.response?.data);
      console.log('📋 完整错误:', error.message);
      
      if (error.response?.data?.error) {
        console.log('🔍 具体错误:', error.response.data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDepartmentApiWithLogging();
