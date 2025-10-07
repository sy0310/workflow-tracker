/**
 * 测试 AI 任务创建 API
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testAITaskCreation() {
  try {
    console.log('🧪 测试 AI 任务创建 API...');
    
    // 1. 生成测试 JWT token
    const testUser = {
      userId: 1,
      username: 'admin',
      email: 'admin@workflow.com'
    };
    
    const token = jwt.sign(testUser, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
    console.log('✅ 生成测试 token:', token.substring(0, 20) + '...');
    
    // 2. 准备测试数据
    const taskData = {
      部门: '产业分析',
      任务名称: '测试任务',
      任务描述: '这是一个测试任务',
      负责人: 'admin',
      优先级: '中',
      状态: '待开始',
      开始时间: new Date().toISOString(),
      预计完成时间: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('📝 测试数据:', taskData);
    
    // 3. 测试 API 调用
    const response = await fetch('http://localhost:3000/api/ai/create-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ taskData })
    });
    
    console.log('📡 响应状态:', response.status);
    console.log('📡 响应头:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 响应内容:', responseText);
    
    if (!response.ok) {
      console.error('❌ API 调用失败');
      try {
        const errorData = JSON.parse(responseText);
        console.error('❌ 错误详情:', errorData);
      } catch (e) {
        console.error('❌ 原始错误:', responseText);
      }
    } else {
      console.log('✅ API 调用成功');
      try {
        const result = JSON.parse(responseText);
        console.log('✅ 结果:', result);
      } catch (e) {
        console.log('✅ 原始结果:', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testAITaskCreation();
