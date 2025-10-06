require('dotenv').config();
const axios = require('axios');

// 配置
const API_BASE_URL = process.env.API_BASE_URL || 'https://workflow-tracker.vercel.app/api';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'admin123';

let authToken = '';

async function login() {
  console.log('🔐 登录中...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });
    authToken = response.data.token;
    console.log('✅ 登录成功！');
    console.log('Token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return false;
  }
}

async function getProjects(department) {
  console.log(`\n📋 获取 ${department} 的项目列表...`);
  try {
    const response = await axios.get(
      `${API_BASE_URL}/departments/${encodeURIComponent(department)}/projects`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    console.log(`✅ 找到 ${response.data.length} 个项目`);
    return response.data;
  } catch (error) {
    console.error('❌ 获取项目失败:', error.response?.data || error.message);
    return [];
  }
}

async function updateProject(department, projectId) {
  console.log(`\n✏️ 更新项目 ${projectId}...`);
  
  // 构建更新数据（模拟前端发送的数据）
  const updateData = {
    项目名称: '测试更新项目名称',
    项目描述: '这是一个测试更新',
    负责人: '张三',
    优先级: 3,
    状态: 2,
    开始时间: '2025-01-01T09:00',
    预计完成时间: '2025-12-31T18:00',
    // 产业分析特有字段
    分析类型: '市场分析',
    目标行业: '测试行业',
    分析范围: '测试范围',
    数据来源: '测试数据',
    分析方法: '测试方法',
    关键发现: '测试发现',
    建议措施: '测试建议',
    风险因素: '测试风险'
  };
  
  console.log('📤 发送数据:', JSON.stringify(updateData, null, 2));
  
  try {
    const response = await axios.put(
      `${API_BASE_URL}/departments/${encodeURIComponent(department)}/projects/${projectId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ 更新成功！');
    console.log('📥 返回数据:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ 更新失败！');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', JSON.stringify(error.response.data, null, 2));
      console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
    } else {
      console.error('错误:', error.message);
    }
    return false;
  }
}

async function testUpdateProject() {
  console.log('🧪 开始测试项目更新功能...\n');
  console.log('API 地址:', API_BASE_URL);
  
  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ 测试失败：无法登录');
    return;
  }
  
  // 2. 获取项目列表
  const department = '产业分析';
  const projects = await getProjects(department);
  
  if (projects.length === 0) {
    console.log('\n⚠️  没有找到项目，无法测试更新功能');
    return;
  }
  
  // 3. 更新第一个项目
  const firstProject = projects[0];
  console.log(`\n🎯 将更新项目: ${firstProject.项目名称} (ID: ${firstProject.id})`);
  
  const updateSuccess = await updateProject(department, firstProject.id);
  
  if (updateSuccess) {
    console.log('\n✅ 测试成功！');
    
    // 4. 验证更新
    console.log('\n🔍 验证更新结果...');
    const updatedProjects = await getProjects(department);
    const updatedProject = updatedProjects.find(p => p.id === firstProject.id);
    
    if (updatedProject) {
      console.log('项目名称已更新:', updatedProject.项目名称);
      console.log('更新时间:', updatedProject.更新时间);
    }
  } else {
    console.log('\n❌ 测试失败！');
  }
}

// 运行测试
testUpdateProject().catch(error => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});

