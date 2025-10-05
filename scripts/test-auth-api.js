const axios = require('axios');
require('dotenv').config();

async function testAuthAPI() {
  try {
    console.log('🔐 测试认证 API...');
    
    // 假设本地服务运行在 3000 端口
    const baseURL = 'http://localhost:3000';
    
    console.log('\n📡 测试登录 API...');
    
    // 测试登录
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ 登录成功!');
    console.log('🔑 Token:', loginResponse.data.token);
    console.log('👤 用户信息:', loginResponse.data.user);
    
    // 测试获取用户信息
    console.log('\n📡 测试获取用户信息 API...');
    
    const userResponse = await axios.get(`${baseURL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ 获取用户信息成功!');
    console.log('👤 用户详情:', userResponse.data.user);
    
    console.log('\n🎉 所有 API 测试通过!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API 错误:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ 连接失败: 请确保服务器正在运行 (npm start)');
    } else {
      console.error('❌ 测试失败:', error.message);
    }
  }
}

testAuthAPI();
