const axios = require('axios');
require('dotenv').config();

async function checkFrontendIssue() {
  try {
    console.log('🔍 检查前端加载问题...');
    
    const baseURL = 'http://localhost:3000';
    
    // 1. 测试主页
    console.log('\n📄 测试主页...');
    try {
      const response = await axios.get(baseURL);
      console.log('✅ 主页加载成功');
      console.log('📊 状态码:', response.status);
    } catch (error) {
      console.log('❌ 主页加载失败:', error.message);
      return;
    }
    
    // 2. 测试登录
    console.log('\n🔐 测试登录...');
    let token;
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      token = loginResponse.data.token;
      console.log('✅ 登录成功');
    } catch (error) {
      console.log('❌ 登录失败:', error.response?.data || error.message);
      return;
    }
    
    // 3. 测试各个 API
    console.log('\n📡 测试各个 API...');
    
    const apis = [
      { name: '用户信息', url: '/api/auth/me' },
      { name: '人员列表', url: '/api/staff' },
      { name: '任务列表', url: '/api/tasks' },
      { name: '通知列表', url: '/api/notifications' },
      { name: '产业分析项目', url: '/api/departments/产业分析/projects' },
      { name: '创意实践项目', url: '/api/departments/创意实践/projects' },
      { name: '活动策划项目', url: '/api/departments/活动策划/projects' },
      { name: '资源拓展项目', url: '/api/departments/资源拓展/projects' }
    ];
    
    for (const api of apis) {
      try {
        const response = await axios.get(`${baseURL}${api.url}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${api.name}: ${response.status} (${Array.isArray(response.data) ? response.data.length + ' 项' : 'OK'})`);
      } catch (error) {
        console.log(`❌ ${api.name}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.error || error.message}`);
      }
    }
    
    console.log('\n📋 检查完成!');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkFrontendIssue();
