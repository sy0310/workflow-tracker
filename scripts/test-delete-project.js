// 测试删除项目功能
require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testDeleteProject() {
    console.log('🧪 测试删除项目功能...\n');

    let token = '';
    let projectId = '';

    try {
        // 1. 登录
        console.log('📡 登录...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        token = loginResponse.data.token;
        console.log('✅ 登录成功\n');

        // 2. 获取产业分析部门的项目列表
        console.log('📡 获取产业分析项目列表...');
        const projectsResponse = await axios.get(`${API_BASE_URL}/departments/产业分析/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const projects = projectsResponse.data;
        console.log(`✅ 找到 ${projects.length} 个项目`);
        
        if (projects.length > 0) {
            projectId = projects[0].id;
            console.log(`📝 将删除项目: ${projects[0].项目名称} (ID: ${projectId})\n`);

            // 3. 删除项目
            console.log('📡 删除项目...');
            const deleteResponse = await axios.delete(`${API_BASE_URL}/departments/产业分析/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ 删除成功:', deleteResponse.data.message);

            // 4. 验证删除
            console.log('\n📡 验证删除...');
            const verifyResponse = await axios.get(`${API_BASE_URL}/departments/产业分析/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ 当前项目数: ${verifyResponse.data.length}`);
            
            console.log('\n🎉 删除功能测试通过!');
        } else {
            console.log('⚠️  没有项目可以删除');
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
    }
}

testDeleteProject();
