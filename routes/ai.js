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
 * 转换中文日期格式为 ISO 格式
 */
function convertChineseDateToISO(dateStr) {
    if (!dateStr) return null;
    
    // 已经是 ISO 格式或标准格式
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr;
    }
    
    // 中文格式: "2023年10月15日" -> "2023-10-15"
    const chineseMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (chineseMatch) {
        const year = chineseMatch[1];
        const month = chineseMatch[2].padStart(2, '0');
        const day = chineseMatch[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 斜杠格式: "2023/10/15" -> "2023-10-15"
    const slashMatch = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (slashMatch) {
        const year = slashMatch[1];
        const month = slashMatch[2].padStart(2, '0');
        const day = slashMatch[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 点格式: "2023.10.15" -> "2023-10-15"
    const dotMatch = dateStr.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
    if (dotMatch) {
        const year = dotMatch[1];
        const month = dotMatch[2].padStart(2, '0');
        const day = dotMatch[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 尝试解析其他格式
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        console.warn('⚠️  无法解析日期:', dateStr);
    }
    
    return null;
}

/**
 * 调用 Groq API
 */
async function callGroqAPI(messages, temperature = 0.7, retryCount = 0) {
    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY 未配置');
        throw new Error('GROQ_API_KEY 未配置，请在环境变量中添加');
    }

    // 备用模型列表（按可用性排序）
    const models = [
        'llama-3.1-8b-instant',      // 最快，最稳定
        'llama-3.1-70b-versatile',   // 备用大模型
        'mixtral-8x7b-32768',        // 另一个备用选项
        'llama-3.3-70b-versatile'    // 最后尝试
    ];
    
    const currentModel = models[retryCount % models.length];
    
    console.log(`🤖 调用 Groq API... (模型: ${currentModel}, 尝试 ${retryCount + 1}/${models.length})`);
    
    if (retryCount === 0) {
        console.log('API Key 前缀:', GROQ_API_KEY.substring(0, 10) + '...');
    }

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
            console.error(`Groq API 错误响应 (${currentModel}):`, errorText);
            
            // 解析错误信息
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { error: { message: errorText } };
            }
            
            // 检查是否是容量问题
            const isCapacityError = errorData.error?.message?.includes('over capacity') || 
                                   errorData.error?.message?.includes('503') ||
                                   response.status === 503;
            
            if (isCapacityError && retryCount < models.length - 1) {
                console.log(`⚠️  ${currentModel} 容量已满，尝试备用模型...`);
                await new Promise(resolve => setTimeout(resolve, 500)); // 短暂延迟
                return await callGroqAPI(messages, temperature, retryCount + 1);
            }
            
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
                await new Promise(resolve => setTimeout(resolve, 500));
                return await callGroqAPI(messages, temperature, retryCount + 1);
            }
            
            throw new Error('AI 响应包含乱码，请重试');
        }
        
        console.log(`✅ 模型 ${currentModel} 响应成功`);
        return content;
        
    } catch (error) {
        console.error('Groq API 调用失败:', error);
        
        // 如果是模型相关错误且还有备用模型，尝试重试
        if (retryCount < models.length - 1 && (
            error.message.includes('model') || 
            error.message.includes('decommissioned') ||
            error.message.includes('not found') ||
            error.message.includes('capacity')
        )) {
            console.log(`🔄 错误: ${error.message.substring(0, 100)}...`);
            console.log(`🔄 尝试使用备用模型 (${retryCount + 2}/${models.length})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // 递增延迟
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

任务字段说明：
- 任务名称（必填） - 任务的标题
- 任务描述（选填） - 默认为"暂无描述"
- 负责人（选填） - 默认为当前用户
- 优先级（选填） - 可选：低/中/高/紧急，默认为"中"
- 状态（选填） - 可选：待开始/进行中/已完成/已取消，默认为"待开始"
- 开始时间（选填） - 默认为当前日期
- 预计完成时间（选填） - 默认为开始时间的7天后

重要规则：
1. 只有"任务名称"是必需的，其他字段都有默认值
2. 如果用户只提供了部分信息，你可以询问是否需要补充，或直接生成 JSON（系统会自动填充缺失字段）
3. 日期格式可以是：2024年12月31日、2024/12/31、2024.12.31、2024-12-31 等，系统会自动转换
4. 如果用户信息很简单（比如只说"创建一个测试任务"），你也可以直接生成 JSON

请按照以下流程帮助用户：
1. 了解用户想要创建什么任务（至少需要任务名称）
2. 如果信息明确，直接生成 JSON
3. 如果信息不够，友好地询问关键信息（但不要过于繁琐）
4. 如果用户表示不想提供更多信息，直接用现有信息生成 JSON

输出格式（只需要填写有的字段，空字段可以省略）：
\`\`\`json
{
  "部门": "部门名称（如果能识别）",
  "任务名称": "任务名称",
  "任务描述": "任务描述（如果有）",
  "负责人": "负责人姓名（如果有）",
  "优先级": "低/中/高/紧急（如果有）",
  "状态": "待开始/进行中/已完成/已取消（如果有）",
  "开始时间": "开始日期（如果有）",
  "预计完成时间": "完成日期（如果有）"
}
\`\`\`

示例对话：
用户："创建一个市场调研任务"
你：好的！我帮你创建一个市场调研任务。这个任务由谁负责呢？优先级如何？需要什么时候完成？

或者直接：
\`\`\`json
{
  "任务名称": "市场调研任务"
}
\`\`\`
（系统会自动填充其他字段）

请用中文回复，保持友好、简洁的语气。不要过于繁琐地询问每个字段。`;

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
        console.log('📥 收到创建任务请求');
        console.log('请求体:', JSON.stringify(req.body, null, 2));
        console.log('用户信息:', req.user);
        
        const { taskData } = req.body;
        
        // 根据环境变量选择数据库
        const usePostgres = process.env.DATABASE_URL;
        console.log('🔧 数据库类型:', usePostgres ? 'PostgreSQL' : 'SQLite');
        
        const db = usePostgres ? require('../database-postgres') : require('../database');
        
        console.log('📝 taskData 内容:', taskData);
        console.log('📝 taskData 类型:', typeof taskData);
        console.log('📝 taskData 的键:', taskData ? Object.keys(taskData) : 'null');
        
        if (!taskData) {
            console.error('❌ taskData 为空');
            return res.status(400).json({ 
                error: '任务数据不完整',
                details: 'taskData 为空或未定义',
                received: req.body
            });
        }
        
        console.log('📝 检查任务名称字段...');
        console.log('📝 taskData["任务名称"]:', taskData['任务名称']);
        console.log('📝 taskData.任务名称:', taskData.任务名称);
        
        if (!taskData.任务名称) {
            console.error('❌ 任务数据不完整 - 缺少任务名称');
            console.error('📝 收到的字段:', Object.keys(taskData));
            console.error('📝 完整数据:', JSON.stringify(taskData, null, 2));
            return res.status(400).json({ 
                error: '任务数据不完整',
                details: '缺少必要的任务名称字段',
                receivedFields: Object.keys(taskData),
                taskData: taskData
            });
        }
        
        console.log('✅ 任务名称字段存在:', taskData.任务名称);

        // 填充默认值
        console.log('🔧 填充默认值...');
        
        // 任务描述默认值
        if (!taskData.任务描述 || taskData.任务描述.trim() === '') {
            taskData.任务描述 = '暂无描述';
            console.log('📝 使用默认任务描述');
        }
        
        // 优先级默认值
        if (!taskData.优先级 || !['低', '中', '高', '紧急'].includes(taskData.优先级)) {
            taskData.优先级 = '中';
            console.log('📝 使用默认优先级: 中');
        }
        
        // 状态默认值
        if (!taskData.状态 || !['待开始', '进行中', '已完成', '已取消'].includes(taskData.状态)) {
            taskData.状态 = '待开始';
            console.log('📝 使用默认状态: 待开始');
        }
        
        // 负责人默认值（如果为空，使用当前用户）
        if (!taskData.负责人 || taskData.负责人.trim() === '') {
            taskData.负责人 = req.user.username || req.user.userId.toString();
            console.log('📝 使用默认负责人:', taskData.负责人);
        }
        
        // 开始时间默认值（当前时间）
        if (!taskData.开始时间 || taskData.开始时间.trim() === '') {
            taskData.开始时间 = new Date().toISOString().split('T')[0];
            console.log('📝 使用默认开始时间:', taskData.开始时间);
        } else {
            // 转换日期格式
            const originalStart = taskData.开始时间;
            taskData.开始时间 = convertChineseDateToISO(originalStart);
            console.log(`📅 转换开始时间: "${originalStart}" -> "${taskData.开始时间}"`);
        }
        
        // 预计完成时间（如果为空，默认为开始时间的7天后）
        if (!taskData.预计完成时间 || taskData.预计完成时间.trim() === '') {
            const startDate = new Date(taskData.开始时间);
            startDate.setDate(startDate.getDate() + 7);
            taskData.预计完成时间 = startDate.toISOString().split('T')[0];
            console.log('📝 使用默认预计完成时间（7天后）:', taskData.预计完成时间);
        } else {
            // 转换日期格式
            const originalEnd = taskData.预计完成时间;
            taskData.预计完成时间 = convertChineseDateToISO(originalEnd);
            console.log(`📅 转换预计完成时间: "${originalEnd}" -> "${taskData.预计完成时间}"`);
        }
        
        console.log('✅ 默认值填充和日期转换完成，当前 taskData:', taskData);

        // 判断是部门任务还是通用任务
        const department = taskData.部门;
        console.log('🏢 部门信息:', department);
        
        delete taskData.部门; // 从数据中移除部门字段

        if (department && ['产业分析', '创意实践', '活动策划', '资源拓展'].includes(department)) {
            console.log('✅ 识别为部门任务，部门:', department);
            // 创建部门任务
            // 字段名映射：AI 字段名 -> 数据库字段名
            const fieldMapping = {
                '任务名称': '项目名称',
                '任务描述': '项目描述',
                '负责人': '负责人',
                '优先级': '优先级',
                '状态': '状态',
                '开始时间': '开始时间',
                '预计完成时间': '预计完成时间'
            };
            
            // 转换字段名和数据类型
            const priorityMap = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
            const statusMap = { '待开始': 1, '进行中': 2, '已完成': 3, '已取消': 4 };
            
            const mappedData = {};
            for (const [aiField, value] of Object.entries(taskData)) {
                // 只处理在映射表中定义的字段
                if (!fieldMapping[aiField]) {
                    console.log(`⚠️  跳过未定义的字段: ${aiField}`);
                    continue;
                }
                
                const dbField = fieldMapping[aiField];
                let processedValue = value;
                
                console.log(`🔄 处理字段: ${aiField} -> ${dbField}, 值: ${value}`);
                
                // 处理优先级和状态的数据类型转换
                if (aiField === '优先级' && priorityMap[value]) {
                    processedValue = priorityMap[value];
                    console.log(`✅ 优先级转换: ${value} -> ${processedValue}`);
                } else if (aiField === '状态' && statusMap[value]) {
                    processedValue = statusMap[value];
                    console.log(`✅ 状态转换: ${value} -> ${processedValue}`);
                }
                
                mappedData[dbField] = processedValue;
            }
            
            console.log('📝 映射后的数据:', mappedData);
            
            // 添加创建者信息
            mappedData['创建者'] = req.user.userId;
            mappedData['创建时间'] = new Date().toISOString();
            
            const columns = Object.keys(mappedData);
            const values = Object.values(mappedData);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            const columnNames = columns.map(col => `"${col}"`).join(', ');

            console.log('📝 执行部门任务 SQL:', `INSERT INTO "${department}" (${columnNames}) VALUES (${placeholders})`);
            console.log('📝 参数值:', values);
            
            const sql = `INSERT INTO "${department}" (${columnNames}) VALUES (${placeholders}) RETURNING *`;
            
            try {
                const result = await db.query(sql, values);
                
                console.log('📝 数据库查询结果:', result);
                console.log('📝 result 类型:', typeof result);
                console.log('📝 result 是否为数组:', Array.isArray(result));
                console.log('📝 result.length:', result ? result.length : 'undefined');

                if (!result || !Array.isArray(result) || result.length === 0) {
                    throw new Error('任务创建失败：数据库返回空结果');
                }
                
                console.log('✅ 部门任务创建成功:', result[0]);
                
                res.json({ 
                    success: true, 
                    task: result[0],
                    type: 'department',
                    department: department
                });
                
            } catch (dbError) {
                console.error('❌ 数据库查询错误:', dbError);
                throw new Error(`数据库操作失败: ${dbError.message}`);
            }
        } else {
            console.log('✅ 识别为通用任务');
            
            // 创建通用任务
            // 将中文优先级转换为数字
            const priorityMap = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
            const statusMap = { '待开始': 1, '进行中': 2, '已完成': 3, '已取消': 4 };
            
            const values = [
                taskData.任务名称,
                taskData.任务描述 || '',
                taskData.负责人, // 这里应该是 staff ID，但暂时用名称
                priorityMap[taskData.优先级] || 2,
                statusMap[taskData.状态] || 1,
                taskData.开始时间 || new Date().toISOString(),
                taskData.预计完成时间,
                req.user.userId
            ];

            console.log('📝 准备创建通用任务');
            console.log('📝 任务数据:', values);
            
            let result;
            if (usePostgres) {
                // PostgreSQL 使用 $1, $2 占位符
                const sql = `
                    INSERT INTO tasks (title, description, assignee_id, priority, status, start_time, estimated_completion_time, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
                `;
                console.log('📝 执行 PostgreSQL SQL');
                result = await db.query(sql, values);
                console.log('✅ PostgreSQL 返回:', result);
                
                res.json({ 
                    success: true, 
                    task: result[0],
                    type: 'general'
                });
            } else {
                // SQLite 使用 ? 占位符
                const sql = `
                    INSERT INTO tasks (title, description, assignee_id, priority, status, start_time, estimated_completion_time, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                console.log('📝 执行 SQLite SQL');
                result = await db.run(sql, values);
                console.log('✅ SQLite 返回 ID:', result.id);
                
                // 获取创建的任务
                const task = await db.get('SELECT * FROM tasks WHERE id = ?', [result.id]);
                console.log('✅ 获取到的任务:', task);
                
                res.json({ 
                    success: true, 
                    task: task,
                    type: 'general'
                });
            }
        }

    } catch (error) {
        console.error('❌ 创建任务错误:', error);
        console.error('❌ 错误类型:', error.constructor.name);
        console.error('❌ 错误消息:', error.message);
        console.error('❌ 错误堆栈:', error.stack);
        
        // 检查是否是数据库连接错误
        if (error.message && error.message.includes('连接池未初始化')) {
            return res.status(500).json({ 
                error: '数据库连接失败', 
                details: '数据库连接池未初始化，请检查环境变量 DATABASE_URL 是否配置正确',
                hint: '如果使用本地开发，请确保有 .env 文件或使用 SQLite'
            });
        }
        
        res.status(500).json({ 
            error: '创建任务失败', 
            details: error.message || '未知错误',
            errorType: error.constructor.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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