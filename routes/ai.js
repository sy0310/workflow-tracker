const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

// Groq API 配置
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// AI 对话历史存储（简单实现，生产环境应使用数据库）
const conversations = new Map();

/**
 * 调用 Groq API
 */
async function callGroqAPI(messages, temperature = 0.7) {
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY 未配置');
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.1-70b-versatile', // 使用 Llama 3.1 70B 模型（最智能）
            messages: messages,
            temperature: temperature,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API 错误: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * 系统提示词 - 定义 AI 助手的角色和能力
 */
const SYSTEM_PROMPT = `你是一个专业的任务管理助手，帮助用户创建和管理工作任务。

你的主要职责：
1. 理解用户的任务创建需求
2. 从用户描述中提取关键信息（任务名称、负责人、优先级、时间等）
3. 智能识别任务所属部门（产业分析/创意实践/活动策划/资源拓展）
4. 根据部门类型，引导用户补充部门特有字段
5. 使用友好、专业的语气与用户交流

任务字段说明：

【基础字段】（所有任务必填）
- 任务名称 *
- 任务描述
- 负责人 *
- 优先级：低/中/高/紧急
- 状态：待开始/进行中/已完成/已取消
- 开始时间
- 预计完成时间

【部门特有字段】

产业分析部（8个字段）：
1. 分析类型：市场分析/竞品分析/行业研究/趋势预测
2. 目标行业
3. 分析范围
4. 数据来源
5. 分析方法
6. 关键发现
7. 建议措施
8. 风险因素

创意实践部（8个字段）：
1. 创意类型：品牌设计/内容创作/活动创意/产品设计
2. 目标用户
3. 创意概念
4. 实施计划
5. 资源需求
6. 预期效果
7. 创新点
8. 可行性分析

活动策划部（10个字段）：
1. 活动类型：线上活动/线下活动/混合活动
2. 目标受众
3. 活动规模：小型(<50人)/中型(50-200人)/大型(>200人)
4. 预算范围
5. 活动地点
6. 活动时间
7. 活动流程
8. 宣传策略
9. 物料需求
10. 人员配置

资源拓展部（10个字段）：
1. 资源类型：合作伙伴/资金/技术/人才
2. 目标对象
3. 拓展方式：主动接触/活动对接/平台合作
4. 资源价值
5. 获取难度：容易/中等/困难
6. 预期收益
7. 风险评估
8. 拓展计划
9. 关键联系人
10. 跟进策略

你的回复格式：
1. 如果信息不完整，逐步引导用户补充
2. 使用友好的语气，避免生硬
3. 每次只询问 1-3 个关键问题
4. 当信息完整后，以 JSON 格式输出（用 \`\`\`json 包裹）

示例 JSON 输出：
\`\`\`json
{
  "任务名称": "新能源汽车市场分析",
  "任务描述": "分析2024年新能源汽车市场趋势",
  "负责人": "张三",
  "优先级": "高",
  "状态": "待开始",
  "开始时间": "2024-10-10",
  "预计完成时间": "2024-11-15",
  "部门": "产业分析",
  "分析类型": "市场分析",
  "目标行业": "新能源汽车",
  "分析范围": "全国市场",
  "数据来源": "行业报告、公开数据"
}
\`\`\`

记住：始终保持友好、专业、高效！`;

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

module.exports = router;