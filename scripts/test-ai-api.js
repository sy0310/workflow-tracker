/**
 * 测试 AI API 是否正常工作
 */

require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroqAPI() {
    console.log('========================================');
    console.log('🧪 测试 Groq AI API');
    console.log('========================================\n');

    // 1. 检查环境变量
    console.log('1️⃣ 检查环境变量:');
    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY 未配置');
        console.log('请在 .env 文件中添加:');
        console.log('GROQ_API_KEY=your_groq_api_key_here');
        return;
    }
    console.log(`✅ GROQ_API_KEY: ${GROQ_API_KEY.substring(0, 10)}...`);
    console.log('');

    // 2. 测试 API 调用
    console.log('2️⃣ 测试 Groq API 调用:');
    console.log('发送测试消息: "你好，请简单介绍一下自己"');
    console.log('');

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // 最新的 Llama 模型
                messages: [
                    {
                        role: 'user',
                        content: '你好，请用一句话简单介绍一下自己'
                    }
                ],
                temperature: 0.7,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API 调用失败 (${response.status}):`, errorText);
            return;
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        console.log('✅ API 调用成功!');
        console.log('');
        console.log('AI 回复:');
        console.log('─────────────────────────────────────');
        console.log(aiResponse);
        console.log('─────────────────────────────────────');
        console.log('');
        console.log('✅ Groq AI API 工作正常！');

    } catch (error) {
        console.error('❌ 错误:', error.message);
        console.log('');
        console.log('可能的原因:');
        console.log('1. API Key 无效或已过期');
        console.log('2. 网络连接问题');
        console.log('3. 超过 Groq 免费配额');
        console.log('');
        console.log('请访问 https://console.groq.com 检查你的 API Key');
    }

    console.log('');
    console.log('========================================');
}

// 运行测试
testGroqAPI();
