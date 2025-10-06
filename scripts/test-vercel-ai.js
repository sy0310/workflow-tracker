/**
 * 测试 Vercel 上的 AI API 配置
 */

const VERCEL_URL = 'https://workflow-tracker.vercel.app';

async function testVercelAI() {
    console.log('========================================');
    console.log('🧪 测试 Vercel AI 配置');
    console.log('========================================\n');

    console.log(`Vercel URL: ${VERCEL_URL}\n`);

    // 测试 1：检查环境变量配置
    console.log('1️⃣ 测试环境变量配置...');
    try {
        const testResponse = await fetch(`${VERCEL_URL}/api/ai/test`);
        const testData = await testResponse.json();

        console.log('测试端点响应:');
        console.log(JSON.stringify(testData, null, 2));
        console.log('');

        if (testData.status === 'ok' && testData.groq_api_key_configured) {
            console.log('✅ GROQ_API_KEY 已正确配置');
            console.log(`   API Key 前缀: ${testData.api_key_prefix}`);
            console.log(`   使用模型: ${testData.model}`);
        } else {
            console.log('❌ GROQ_API_KEY 未配置');
            console.log('\n⚠️  请按以下步骤配置：');
            console.log('1. 访问 https://vercel.com/dashboard');
            console.log('2. 选择 workflow-tracker 项目');
            console.log('3. Settings → Environment Variables');
            console.log('4. 添加 GROQ_API_KEY');
            console.log('5. 重新部署项目');
            return;
        }
    } catch (error) {
        console.error('❌ 测试端点调用失败:', error.message);
        return;
    }

    console.log('');

    // 测试 2：模拟登录并测试 AI 对话
    console.log('2️⃣ 测试 AI 对话功能...');
    try {
        // 先登录
        console.log('正在登录...');
        const loginResponse = await fetch(`${VERCEL_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            console.error('❌ 登录失败');
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ 登录成功');
        console.log('');

        // 测试 AI 对话
        console.log('发送测试消息: "创建一个任务"');
        const chatResponse = await fetch(`${VERCEL_URL}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                message: '创建一个任务'
            })
        });

        if (!chatResponse.ok) {
            const errorText = await chatResponse.text();
            console.error(`❌ AI 对话失败 (${chatResponse.status}):`, errorText);
            console.log('');
            console.log('可能的原因:');
            console.log('1. GROQ_API_KEY 配置错误');
            console.log('2. Groq API 调用失败');
            console.log('3. 模型配置问题');
            return;
        }

        const chatData = await chatResponse.json();
        console.log('✅ AI 对话成功!');
        console.log('');
        console.log('AI 回复:');
        console.log('─────────────────────────────────────');
        console.log(chatData.response);
        console.log('─────────────────────────────────────');
        console.log('');
        console.log('✅ AI 助手工作正常！');

    } catch (error) {
        console.error('❌ AI 对话测试失败:', error.message);
    }

    console.log('');
    console.log('========================================');
}

// 运行测试
testVercelAI();

