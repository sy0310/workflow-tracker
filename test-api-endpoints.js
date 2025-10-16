#!/usr/bin/env node

/**
 * API 端点测试脚本
 * 测试 Vercel 部署的应用的主要 API 端点
 */

require('dotenv').config();

// 配置信息
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

console.log('🌐 API 端点测试');
console.log('===============');
console.log('📍 测试 URL:', BASE_URL);

async function testEndpoint(method, endpoint, data = null, headers = {}) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        console.log(`\n🔍 ${method} ${endpoint}`);
        
        // 模拟 fetch（Node.js 环境）
        const https = require('https');
        const http = require('http');
        const { URL } = require('url');
        
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? https : http;
            
            const req = client.request(url, options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const responseData = {
                            status: res.statusCode,
                            headers: res.headers,
                            body: body ? JSON.parse(body) : null
                        };
                        
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            console.log(`✅ ${res.statusCode} - 成功`);
                            resolve(responseData);
                        } else {
                            console.log(`❌ ${res.statusCode} - 失败`);
                            console.log(`   响应: ${body.substring(0, 200)}...`);
                            resolve(responseData);
                        }
                    } catch (e) {
                        console.log(`❌ ${res.statusCode} - JSON解析失败`);
                        console.log(`   响应: ${body.substring(0, 200)}...`);
                        resolve({ status: res.statusCode, body: body });
                    }
                });
            });
            
            req.on('error', (error) => {
                console.log(`❌ 请求失败: ${error.message}`);
                resolve({ error: error.message });
            });
            
            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
        
    } catch (error) {
        console.log(`❌ 测试失败: ${error.message}`);
        return { error: error.message };
    }
}

async function testStaticFiles() {
    console.log('\n📁 测试静态文件...');
    
    const staticFiles = [
        '/',
        '/index.html',
        '/login.html',
        '/app.js',
        '/styles.css'
    ];
    
    for (const file of staticFiles) {
        await testEndpoint('GET', file);
    }
}

async function testAuthEndpoints() {
    console.log('\n🔐 测试认证端点...');
    
    // 测试登录端点
    const loginData = {
        username: 'admin',
        password: 'admin123'
    };
    
    const loginResult = await testEndpoint('POST', '/api/auth/login', loginData);
    
    if (loginResult.status === 200) {
        console.log('✅ 登录成功');
        return loginResult.body?.token;
    } else {
        console.log('❌ 登录失败');
        return null;
    }
}

async function testStaffEndpoints(token) {
    console.log('\n👥 测试员工管理端点...');
    
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // 获取员工列表
    await testEndpoint('GET', '/api/staff', null, headers);
    
    // 添加员工
    const staffData = {
        name: '测试用户',
        wechat_id: 'test_user',
        email: 'test@example.com',
        department: '测试部门',
        position: '测试职位'
    };
    
    const addResult = await testEndpoint('POST', '/api/staff', staffData, headers);
    
    if (addResult.status === 200 || addResult.status === 201) {
        console.log('✅ 添加员工成功');
        return addResult.body?.id;
    } else {
        console.log('❌ 添加员工失败');
        return null;
    }
}

async function testTaskEndpoints(token) {
    console.log('\n📋 测试任务管理端点...');
    
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // 获取任务列表
    await testEndpoint('GET', '/api/tasks', null, headers);
    
    // 添加任务
    const taskData = {
        title: '测试任务',
        description: '这是一个测试任务',
        priority: 2,
        status: 1
    };
    
    const addResult = await testEndpoint('POST', '/api/tasks', taskData, headers);
    
    if (addResult.status === 200 || addResult.status === 201) {
        console.log('✅ 添加任务成功');
        return addResult.body?.id;
    } else {
        console.log('❌ 添加任务失败');
        return null;
    }
}

async function testAiEndpoints(token) {
    console.log('\n🤖 测试AI助手端点...');
    
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // 测试AI对话
    const aiData = {
        message: '创建一个测试任务'
    };
    
    await testEndpoint('POST', '/api/ai/chat', aiData, headers);
}

async function main() {
    console.log('开始测试 API 端点...\n');
    
    // 测试静态文件
    await testStaticFiles();
    
    // 测试认证
    const token = await testAuthEndpoints();
    
    // 测试员工管理
    await testStaffEndpoints(token);
    
    // 测试任务管理
    await testTaskEndpoints(token);
    
    // 测试AI助手
    await testAiEndpoints(token);
    
    console.log('\n🎉 API 端点测试完成！');
    console.log('💡 如果看到很多 ❌ 错误，可能是以下原因：');
    console.log('   1. 应用未部署到 Vercel');
    console.log('   2. 环境变量未正确配置');
    console.log('   3. 数据库连接问题');
    console.log('   4. 网络连接问题');
}

// 运行测试
main().catch(console.error);
