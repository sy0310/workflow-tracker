#!/usr/bin/env node

/**
 * 修复 ai_conversations 表缺失问题
 * 在 Supabase 中创建缺失的 AI 对话记录表
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 配置信息
const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔧 修复 ai_conversations 表');
console.log('============================');

if (!supabaseKey) {
    console.error('❌ 错误: SUPABASE_ANON_KEY 环境变量未设置');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAiConversationsTable() {
    try {
        console.log('📋 创建 ai_conversations 表...');
        
        // 创建 ai_conversations 表的 SQL
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS ai_conversations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                conversation_id VARCHAR(100),
                user_message TEXT,
                ai_response TEXT,
                task_data TEXT, -- JSON格式的任务数据
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        `;
        
        // 创建索引的 SQL
        const createIndexSQL = `
            CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
        `;
        
        // 注意：Supabase 客户端不能直接执行 DDL 语句
        // 这些需要在 Supabase Dashboard 的 SQL Editor 中执行
        console.log('⚠️  注意：由于 Supabase 客户端限制，无法直接创建表');
        console.log('💡 请手动在 Supabase Dashboard 中执行以下 SQL：');
        console.log('');
        console.log('-- 创建 ai_conversations 表');
        console.log(createTableSQL);
        console.log('');
        console.log('-- 创建索引');
        console.log(createIndexSQL);
        
        // 测试表是否已存在
        console.log('\n🔍 检查表是否存在...');
        const { data, error } = await supabase.from('ai_conversations').select('count').limit(1);
        
        if (error && error.code === 'PGRST116') {
            console.log('❌ ai_conversations 表不存在');
            console.log('📝 请按照上面的 SQL 在 Supabase Dashboard 中创建表');
        } else if (error) {
            console.log('❌ 检查表时出错:', error.message);
        } else {
            console.log('✅ ai_conversations 表已存在');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 创建表时发生错误:', error.message);
        return false;
    }
}

async function testAiConversationsTable() {
    try {
        console.log('\n🧪 测试 ai_conversations 表...');
        
        // 尝试插入测试数据
        const testData = {
            user_id: 1, // 假设管理员用户ID为1
            conversation_id: 'test_' + Date.now(),
            user_message: '测试消息',
            ai_response: 'AI响应测试',
            task_data: '{}'
        };
        
        const { data, error } = await supabase
            .from('ai_conversations')
            .insert(testData)
            .select();
            
        if (error) {
            console.log('❌ 插入测试数据失败:', error.message);
            return false;
        }
        
        console.log('✅ 插入测试数据成功:', data[0].id);
        
        // 清理测试数据
        const { error: deleteError } = await supabase
            .from('ai_conversations')
            .delete()
            .eq('id', data[0].id);
            
        if (deleteError) {
            console.log('⚠️  清理测试数据失败:', deleteError.message);
        } else {
            console.log('✅ 测试数据已清理');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 测试表时发生错误:', error.message);
        return false;
    }
}

async function main() {
    console.log('开始修复 ai_conversations 表...\n');
    
    const createSuccess = await createAiConversationsTable();
    
    if (createSuccess) {
        const testSuccess = await testAiConversationsTable();
        
        if (testSuccess) {
            console.log('\n🎉 ai_conversations 表修复完成！');
            console.log('✅ 表已存在且功能正常');
        } else {
            console.log('\n⚠️  表可能需要手动创建');
            console.log('💡 请按照提示在 Supabase Dashboard 中执行 SQL');
        }
    }
}

// 运行修复
main().catch(console.error);
