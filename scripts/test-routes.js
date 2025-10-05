const axios = require('axios');
require('dotenv').config();

async function testRoutes() {
  try {
    console.log('🔍 测试路由配置...');
    
    const baseURL = 'http://localhost:3000';
    
    // 先登录获取 token
    console.log('\n🔐 登录获取 token...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 登录成功');
    
    // 测试各种路由
    const routes = [
      { method: 'GET', path: '/api/auth/me', name: '获取用户信息' },
      { method: 'GET', path: '/api/staff', name: '获取人员列表' },
      { method: 'GET', path: '/api/tasks', name: '获取任务列表' },
      { method: 'GET', path: '/api/notifications', name: '获取通知列表' },
      { method: 'GET', path: '/api/departments/产业分析/projects', name: '获取产业分析项目' },
      { method: 'GET', path: '/api/departments/创意实践/projects', name: '获取创意实践项目' },
      { method: 'GET', path: '/api/departments/活动策划/projects', name: '获取活动策划项目' },
      { method: 'GET', path: '/api/departments/资源拓展/projects', name: '获取资源拓展项目' }
    ];
    
    console.log('\n📡 测试各个路由...');
    
    for (const route of routes) {
      try {
        const config = {
          method: route.method,
          url: baseURL + route.path,
          headers: {}
        };
        
        // 需要认证的路由添加 token
        if (route.path.includes('/api/')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await axios(config);
        console.log(`✅ ${route.name}: ${response.status}`);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`   📊 数据数量: ${response.data.length}`);
        }
        
      } catch (error) {
        console.log(`❌ ${route.name}: ${error.response?.status || 'ERROR'}`);
        if (error.response?.status === 404) {
          console.log(`   💡 路由不存在: ${route.path}`);
        } else if (error.response?.data) {
          console.log(`   📝 错误信息: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
        }
      }
    }
    
    console.log('\n📋 路由测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRoutes();
