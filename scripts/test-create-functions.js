const axios = require('axios');
require('dotenv').config();

async function testCreateFunctions() {
  try {
    console.log('🧪 测试创建任务和人员功能...');
    
    // 假设本地服务运行在 3000 端口
    const baseURL = 'http://localhost:3000';
    
    // 1. 先登录获取 token
    console.log('\n🔐 登录获取 token...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 登录成功，获得 token');
    
    // 2. 创建人员
    console.log('\n👥 测试创建人员...');
    const staffData = {
      name: '张三',
      wechat_id: 'zhangsan001',
      wechat_name: '张三',
      email: 'zhangsan@test.com',
      phone: '13800138001',
      department: '技术部',
      position: '工程师'
    };
    
    try {
      const staffResponse = await axios.post(`${baseURL}/api/staff`, staffData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ 创建人员成功!');
      console.log('👤 人员信息:', staffResponse.data);
      const staffId = staffResponse.data.id;
      
      // 3. 创建任务
      console.log('\n📋 测试创建任务...');
      const taskData = {
        title: '测试任务',
        description: '这是一个测试任务',
        assignee_id: staffId,
        participants: [staffId],
        priority: 2,
        start_time: new Date().toISOString(),
        estimated_completion_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: loginResponse.data.user.id
      };
      
      const taskResponse = await axios.post(`${baseURL}/api/tasks`, taskData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ 创建任务成功!');
      console.log('📋 任务信息:', taskResponse.data);
      
      // 4. 验证数据
      console.log('\n🔍 验证创建的数据...');
      
      // 获取人员列表
      const staffListResponse = await axios.get(`${baseURL}/api/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`👥 人员总数: ${staffListResponse.data.length}`);
      
      // 获取任务列表
      const taskListResponse = await axios.get(`${baseURL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`📋 任务总数: ${taskListResponse.data.length}`);
      
      console.log('\n🎉 所有创建功能测试通过!');
      
    } catch (createError) {
      if (createError.response) {
        console.error('❌ 创建失败:', createError.response.status, createError.response.data);
      } else {
        console.error('❌ 创建失败:', createError.message);
      }
    }
    
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

testCreateFunctions();
