// 创建一个测试项目来验证 API
const http = require('http');

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function createTestProject() {
  try {
    console.log('创建测试项目...');
    
    // 1. 登录获取 token
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.statusCode !== 200) {
      console.error('登录失败:', loginResponse.body);
      return;
    }
    
    const loginData = JSON.parse(loginResponse.body);
    const token = loginData.token;
    console.log('✅ 登录成功');
    
    // 2. 创建测试项目
    const projectData = {
      项目名称: '测试项目',
      项目描述: '这是一个测试项目',
      负责人: '管理员',
      优先级: 2,
      状态: 1,
      开始时间: '2024-10-16T00:00:00Z',
      预计完成时间: '2024-10-20T00:00:00Z',
      活动类型: '商务活动',
      目标受众: 'VIP客户'
    };
    
    const encodedDept = encodeURIComponent('活动策划');
    const createResponse = await makeRequest(`/api/departments/${encodedDept}/projects`, 'POST', projectData, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('创建项目响应状态:', createResponse.statusCode);
    console.log('创建项目响应内容:', createResponse.body);
    
    if (createResponse.statusCode === 201) {
      console.log('✅ 项目创建成功');
      
      // 3. 验证项目是否创建成功
      const listResponse = await makeRequest(`/api/departments/${encodedDept}/projects`, 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      
      console.log('查询项目响应状态:', listResponse.statusCode);
      console.log('查询项目响应内容:', listResponse.body);
    }
    
  } catch (error) {
    console.error('创建测试项目时出错:', error);
  }
}

createTestProject();
