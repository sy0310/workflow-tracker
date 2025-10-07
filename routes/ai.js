const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
require('dotenv').config();

// Groq API 配置
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// AI 对话历史存储（简单实现，生产环境应使用数据库）
const conversations = new Map();

/**
 * 调用 Groq API
 */
async function callGroqAPI(messages, temperature = 0.7, retryCount = 0) {
    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY 未配置');
        throw new Error('GROQ_API_KEY 未配置，请在 Vercel 环境变量中添加');
    }

    // 备用模型列表
    const models = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'];
    const currentModel = models[retryCount] || models[0];
    
    console.log(`🤖 调用 Groq API... (模型: ${currentModel}, 重试次数: ${retryCount})`);
    console.log('API Key 前缀:', GROQ_API_KEY.substring(0, 10) + '...');

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: currentModel,
                messages: messages,
                temperature: temperature,
                max_tokens: 1000,
                stream: false,
                top_p: 0.9,
                frequency_penalty: 0.0,
                presence_penalty: 0.0
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API 错误响应:', errorText);
            throw new Error(`Groq API 错误 (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Groq API 调用成功');
        
        // 验证响应数据
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('❌ Groq API 响应格式异常:', data);
            throw new Error('AI 响应格式异常');
        }
        
        const content = data.choices[0].message.content;
        
        // 检查内容是否包含乱码
        if (content.includes('Toastr') || content.includes('BuilderFactory') || content.includes('externalActionCode')) {
            console.error('❌ 检测到乱码响应:', content);
            
            // 如果还有备用模型，尝试重试
            if (retryCount < models.length - 1) {
                console.log(`🔄 尝试使用备用模型重试...`);
                return await callGroqAPI(messages, temperature, retryCount + 1);
            }
            
            throw new Error('AI 响应包含乱码，请重试');
        }
        
        return content;
    } catch (error) {
        console.error('Groq API 调用失败:', error);
        
        // 如果是模型相关错误且还有备用模型，尝试重试
        if (retryCount < models.length - 1 && (
            error.message.includes('model') || 
            error.message.includes('decommissioned') ||
            error.message.includes('not found')
        )) {
            console.log(`🔄 模型错误，尝试使用备用模型重试...`);
            return await callGroqAPI(messages, temperature, retryCount + 1);
        }
        
        throw error;
    }
}

/**
 * 系统提示词 - 定义 AI 助手的角色和能力
 */
const SYSTEM_PROMPT = `你是一个专业的任务管理助手，帮助用户创建和管理工作任务。

你的主要职责：
1. 理解用户的任务创建需求
2. 从用户描述中提取关键信息（任务名称、负责人、优先级、时间等）
3. 智能识别任务所属部门（产业分析/创意实践/活动策划/资源拓展）
4. 使用友好、专业的语气与用户交流

基础任务字段：
- 任务名称（必填）
- 任务描述
- 负责人（必填）
- 优先级：低/中/高/紧急
- 状态：待开始/进行中/已完成/已取消
- 开始时间
- 预计完成时间

请按照以下流程帮助用户：
1. 了解用户想要创建什么任务
2. 识别任务属于哪个部门
3. 引导用户提供必要信息
4. 当信息收集完整后，以 JSON 格式输出任务数据

输出格式：
\`\`\`json
{
  "部门": "部门名称",
  "任务名称": "任务名称",
  "任务描述": "任务描述",
  "负责人": "负责人",
  "优先级": "优先级",
  "状态": "状态",
  "开始时间": "开始时间",
  "预计完成时间": "预计完成时间"
}
\`\`\`

请用中文回复，保持友好和专业的语气。`;

/**
 * POST /api/ai/chat
 * AI 对话接口
 */
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const userId = req.user.userId;

        if (!message) {
            return res.status(400).json({ error: '消息不能为空' });
        }

        // 获取或创建对话历史
        const convId = conversationId || `${userId}-${Date.now()}`;
        let messages = conversations.get(convId) || [
            { role: 'system', content: SYSTEM_PROMPT }
        ];

        // 添加用户消息
        messages.push({ role: 'user', content: message });

        // 调用 Groq API
        const aiResponse = await callGroqAPI(messages);

        // 保存 AI 回复到历史
        messages.push({ role: 'assistant', content: aiResponse });
        conversations.set(convId, messages);

        // 检查是否包含 JSON（表示任务信息完整）
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
        const taskData = jsonMatch ? JSON.parse(jsonMatch[1]) : null;

        res.json({
            response: aiResponse,
            conversationId: convId,
            taskData: taskData,
            hasTaskData: !!taskData
        });

    } catch (error) {
        console.error('AI 对话错误:', error);
        res.status(500).json({ 
            error: '抱歉，AI 助手暂时无法回复。请稍后再试。',
            details: error.message 
        });
    }
});

/**
 * POST /api/ai/create-task
 * 使用 AI 提取的数据创建任务
 */
router.post('/create-task', authenticateToken, async (req, res) => {
    try {
        const { taskData } = req.body;
        const db = require('../database-postgres');

        if (!taskData || !taskData.任务名称) {
            return res.status(400).json({ error: '任务数据不完整' });
        }

        // 判断是部门任务还是通用任务
        const department = taskData.部门;
        delete taskData.部门; // 从数据中移除部门字段

        if (department && ['产业分析', '创意实践', '活动策划', '资源拓展'].includes(department)) {
            // 创建部门任务
            const columns = Object.keys(taskData);
            const values = Object.values(taskData);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            const columnNames = columns.map(col => `"${col}"`).join(', ');

            const sql = `INSERT INTO "${department}" (${columnNames}) VALUES (${placeholders}) RETURNING *`;
            const result = await db.query(sql, values);

            res.json({ 
                success: true, 
                task: result.rows[0],
                type: 'department',
                department: department
            });
        } else {
            // 创建通用任务
            const sql = `
                INSERT INTO tasks (title, description, assigned_to, priority, status, start_date, due_date, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
            const values = [
                taskData.任务名称,
                taskData.任务描述 || '',
                taskData.负责人,
                taskData.优先级 || '中',
                taskData.状态 || '待开始',
                taskData.开始时间 || new Date(),
                taskData.预计完成时间,
                req.user.userId
            ];

            const result = await db.query(sql, values);

            res.json({ 
                success: true, 
                task: result.rows[0],
                type: 'general'
            });
        }

    } catch (error) {
        console.error('创建任务错误:', error);
        res.status(500).json({ error: '创建任务失败', details: error.message });
    }
});

/**
 * DELETE /api/ai/conversation/:id
 * 清除对话历史
 */
router.delete('/conversation/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    conversations.delete(id);
    res.json({ success: true });
});

/**
 * POST /api/ai/reset
 * 重置所有对话（用于测试）
 */
router.post('/reset', authenticateToken, (req, res) => {
    conversations.clear();
    res.json({ success: true, message: '所有对话已清除' });
});

/**
 * GET /api/ai/test
 * 测试端点 - 检查环境变量配置
 */
router.get('/test', (req, res) => {
    const hasApiKey = !!GROQ_API_KEY;
    const apiKeyPrefix = hasApiKey ? GROQ_API_KEY.substring(0, 10) + '...' : 'N/A';
    
    res.json({
        status: hasApiKey ? 'ok' : 'error',
        message: hasApiKey ? 'GROQ_API_KEY 已配置' : 'GROQ_API_KEY 未配置',
        groq_api_key_configured: hasApiKey,
        api_key_prefix: apiKeyPrefix,
        model: 'llama-3.3-70b-versatile',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;