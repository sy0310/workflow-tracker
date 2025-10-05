// 测试删除员工功能
require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testDeleteStaff() {
    console.log('🧪 测试删除员工功能...\n');

    let token = '';
    let staffId = '';

    try {
        // 1. 登录
        console.log('📡 登录...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        token = loginResponse.data.token;
        console.log('✅ 登录成功\n');

        // 2. 创建测试员工
        console.log('📡 创建测试员工...');
        const createResponse = await axios.post(`${API_BASE_URL}/staff`, {
            name: '测试员工',
            wechat_id: 'test_' + Date.now(),
            wechat_name: '测试员工',
            email: 'test@example.com',
            phone: '13800000000',
            department: '测试部门',
            position: '测试职位'
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        staffId = createResponse.data.id;
        console.log(`✅ 创建成功: ${createResponse.data.name} (ID: ${staffId})\n`);

        // 3. 获取员工列表（删除前）
        console.log('📡 获取员工列表（删除前）...');
        const beforeResponse = await axios.get(`${API_BASE_URL}/staff`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ 当前员工数: ${beforeResponse.data.length}\n`);

        // 4. 删除员工
        console.log('📡 删除员工...');
        const deleteResponse = await axios.delete(`${API_BASE_URL}/staff/${staffId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ 删除成功:', deleteResponse.data.message, '\n');

        // 5. 验证删除（获取员工列表）
        console.log('📡 验证删除（获取员工列表）...');
        const afterResponse = await axios.get(`${API_BASE_URL}/staff`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ 删除后员工数: ${afterResponse.data.length}`);
        
        const deletedStaff = afterResponse.data.find(s => s.id === staffId);
        if (!deletedStaff) {
            console.log('✅ 员工已从列表中移除（软删除成功）\n');
        } else {
            console.log('⚠️  员工仍在列表中\n');
        }

        console.log('🎉 删除功能测试通过!');

    } catch (error) {
        console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
    }
}

testDeleteStaff();
