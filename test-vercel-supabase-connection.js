#!/usr/bin/env node

/**
 * Vercel + Supabase 连接测试脚本
 * 用于验证部署环境中的数据库连接是否正常
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 配置信息
const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🚀 Vercel + Supabase 连接测试');
console.log('================================');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 API Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ 未配置');

// 检查环境变量
if (!supabaseKey) {
    console.error('❌ 错误: SUPABASE_ANON_KEY 环境变量未设置');
    console.log('💡 请在 Vercel 项目设置中添加环境变量:');
    console.log('   SUPABASE_ANON_KEY = your-actual-supabase-anon-key');
    process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('\n🔗 测试数据库连接...');
        
        // 测试基本连接
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('⚠️  表不存在，需要先创建数据库表');
                console.log('📝 请在 Supabase Dashboard 的 SQL Editor 中执行:');
                console.log('   scripts/setup-supabase-schema.sql');
                return false;
            } else {
                console.error('❌ 数据库连接失败:', error.message);
                return false;
            }
        }
        
        console.log('✅ 数据库连接成功！');
        
        // 测试表是否存在
        console.log('\n📊 检查数据库表...');
        const tables = ['users', 'staff', 'tasks', 'notifications', 'ai_conversations'];
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase.from(table).select('count').limit(1);
                if (error) {
                    console.log(`❌ 表 ${table} 不存在或无法访问`);
                } else {
                    console.log(`✅ 表 ${table} 存在`);
                }
            } catch (err) {
                console.log(`❌ 表 ${table} 检查失败:`, err.message);
            }
        }
        
        // 检查默认管理员用户
        console.log('\n👤 检查管理员用户...');
        const { data: adminUser, error: adminError } = await supabase
            .from('users')
            .select('id, username, role')
            .eq('username', 'admin')
            .single();
            
        if (adminError) {
            console.log('❌ 管理员用户不存在');
            console.log('💡 需要运行数据库初始化脚本');
        } else {
            console.log('✅ 管理员用户存在:', adminUser.username, `(${adminUser.role})`);
        }
        
        // 检查示例数据
        console.log('\n📋 检查示例数据...');
        const { data: staffCount } = await supabase.from('staff').select('count');
        const { data: taskCount } = await supabase.from('tasks').select('count');
        
        console.log(`📊 员工数量: ${staffCount?.length || 0}`);
        console.log(`📋 任务数量: ${taskCount?.length || 0}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        return false;
    }
}

async function testApiEndpoints() {
    console.log('\n🌐 测试 API 端点...');
    
    // 这里可以添加对实际API端点的测试
    // 由于这是测试脚本，我们只测试数据库连接
    
    console.log('💡 建议手动测试以下端点:');
    console.log('   - GET /api/staff (获取员工列表)');
    console.log('   - GET /api/tasks (获取任务列表)');
    console.log('   - POST /api/auth/login (用户登录)');
}

async function main() {
    console.log('开始测试...\n');
    
    const connectionSuccess = await testConnection();
    
    if (connectionSuccess) {
        await testApiEndpoints();
        console.log('\n🎉 测试完成！');
        console.log('✅ Vercel + Supabase 连接正常');
        console.log('💡 您现在可以访问部署的应用进行功能测试');
    } else {
        console.log('\n❌ 测试失败！');
        console.log('💡 请检查以下项目:');
        console.log('   1. Supabase 项目是否正常运行');
        console.log('   2. 环境变量是否正确配置');
        console.log('   3. 数据库表是否已创建');
        console.log('   4. 网络连接是否正常');
    }
}

// 运行测试
main().catch(console.error);
