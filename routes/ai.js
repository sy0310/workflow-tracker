const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// AI助手对话接口
router.post('/chat', async (req, res) => {
  try {
    const { message, user_id, conversation_id } = req.body;
    
    let currentConversationId = conversation_id;
    
    // 如果没有会话ID，创建新会话
    if (!currentConversationId) {
      currentConversationId = uuidv4();
    }

    // 解析用户消息，提取任务信息
    const taskInfo = parseTaskInfo(message);
    
    // 生成AI响应
    const aiResponse = generateAIResponse(taskInfo, message);
    
    // 保存对话记录
    await db.run(
      'INSERT INTO ai_conversations (user_id, conversation_id, user_message, ai_response, task_data) VALUES (?, ?, ?, ?, ?)',
      [user_id, currentConversationId, message, aiResponse.response, JSON.stringify(taskInfo)]
    );

    res.json({
      conversation_id: currentConversationId,
      ai_response: aiResponse.response,
      task_info: taskInfo,
      suggestions: aiResponse.suggestions,
      can_create_task: aiResponse.can_create_task
    });
  } catch (error) {
    console.error('AI对话错误:', error);
    res.status(500).json({ error: 'AI对话失败' });
  }
});

// 创建任务（基于AI解析的信息）
router.post('/create-task', async (req, res) => {
  try {
    const { task_info, user_id, conversation_id } = req.body;
    
    if (!task_info || !task_info.title) {
      return res.status(400).json({ error: '任务信息不完整' });
    }

    // 查找或创建负责人
    let assignee_id = null;
    if (task_info.assignee_name) {
      const assignee = await db.get(
        'SELECT id FROM staff WHERE name LIKE ? OR wechat_name LIKE ? LIMIT 1',
        [`%${task_info.assignee_name}%`, `%${task_info.assignee_name}%`]
      );
      if (assignee) {
        assignee_id = assignee.id;
      }
    }

    // 查找参与人
    let participants = [];
    if (task_info.participants && task_info.participants.length > 0) {
      for (const participantName of task_info.participants) {
        const participant = await db.get(
          'SELECT id FROM staff WHERE name LIKE ? OR wechat_name LIKE ? LIMIT 1',
          [`%${participantName}%`, `%${participantName}%`]
        );
        if (participant) {
          participants.push(participant.id);
        }
      }
    }

    // 创建任务
    const result = await db.run(
      'INSERT INTO tasks (title, description, assignee_id, participants, priority, start_time, estimated_completion_time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        task_info.title,
        task_info.description || '',
        assignee_id,
        JSON.stringify(participants),
        task_info.priority || 2,
        task_info.start_time || null,
        task_info.estimated_completion_time || null,
        user_id
      ]
    );

    // 获取创建的任务信息
    const newTask = await db.get(`
      SELECT t.*, 
             s1.name as assignee_name, s1.avatar_url as assignee_avatar,
             s2.name as creator_name
      FROM tasks t
      LEFT JOIN staff s1 ON t.assignee_id = s1.id
      LEFT JOIN staff s2 ON t.created_by = s2.id
      WHERE t.id = ?
    `, [result.id]);

    // 发送创建通知
    if (assignee_id) {
      const assignee = await db.get('SELECT * FROM staff WHERE id = ?', [assignee_id]);
      if (assignee) {
        require('../services/notificationService').sendTaskCreatedNotification(newTask, assignee);
      }
    }

    res.status(201).json({
      message: '任务创建成功',
      task: newTask,
      conversation_id: conversation_id
    });
  } catch (error) {
    console.error('AI创建任务错误:', error);
    res.status(500).json({ error: '创建任务失败' });
  }
});

// 获取对话历史
router.get('/conversations/:conversation_id', async (req, res) => {
  try {
    const conversations = await db.query(
      'SELECT * FROM ai_conversations WHERE conversation_id = ? ORDER BY created_at ASC',
      [req.params.conversation_id]
    );
    res.json(conversations);
  } catch (error) {
    console.error('获取对话历史错误:', error);
    res.status(500).json({ error: '获取对话历史失败' });
  }
});

// 获取用户的对话列表
router.get('/conversations/user/:user_id', async (req, res) => {
  try {
    const conversations = await db.query(
      'SELECT conversation_id, MAX(created_at) as last_message_time, COUNT(*) as message_count FROM ai_conversations WHERE user_id = ? GROUP BY conversation_id ORDER BY last_message_time DESC',
      [req.params.user_id]
    );
    res.json(conversations);
  } catch (error) {
    console.error('获取用户对话列表错误:', error);
    res.status(500).json({ error: '获取用户对话列表失败' });
  }
});

// 解析任务信息
function parseTaskInfo(message) {
  const taskInfo = {
    title: '',
    description: '',
    assignee_name: '',
    participants: [],
    priority: 2, // 默认中等优先级
    start_time: null,
    estimated_completion_time: null
  };

  // 简单的关键词匹配和提取
  const lines = message.split('\n');
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    // 提取任务名称
    if (lowerLine.includes('任务') || lowerLine.includes('项目') || lowerLine.includes('工作')) {
      if (!taskInfo.title) {
        taskInfo.title = line.replace(/[任务项目工作：:]/g, '').trim();
      }
    }
    
    // 提取负责人
    if (lowerLine.includes('负责人') || lowerLine.includes('分配') || lowerLine.includes('负责')) {
      const match = line.match(/[负责人分配负责：:]\s*([^\s]+)/);
      if (match) {
        taskInfo.assignee_name = match[1].trim();
      }
    }
    
    // 提取参与人
    if (lowerLine.includes('参与') || lowerLine.includes('协助') || lowerLine.includes('配合')) {
      const participants = line.match(/[参与协助配合：:]\s*([^\n]+)/);
      if (participants) {
        taskInfo.participants = participants[1].split(/[,，、]/).map(p => p.trim()).filter(p => p);
      }
    }
    
    // 提取优先级
    if (lowerLine.includes('紧急') || lowerLine.includes('urgent')) {
      taskInfo.priority = 4;
    } else if (lowerLine.includes('高') || lowerLine.includes('high')) {
      taskInfo.priority = 3;
    } else if (lowerLine.includes('低') || lowerLine.includes('low')) {
      taskInfo.priority = 1;
    }
    
    // 提取时间信息
    if (lowerLine.includes('开始时间') || lowerLine.includes('start')) {
      const timeMatch = line.match(/(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}|\d{2}\/\d{2}|\d+天后|\d+天|明天|今天)/);
      if (timeMatch) {
        taskInfo.start_time = parseTimeString(timeMatch[1]);
      }
    }
    
    if (lowerLine.includes('完成时间') || lowerLine.includes('截止') || lowerLine.includes('deadline')) {
      const timeMatch = line.match(/(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}|\d{2}\/\d{2}|\d+天后|\d+天|明天|下周)/);
      if (timeMatch) {
        taskInfo.estimated_completion_time = parseTimeString(timeMatch[1]);
      }
    }
  }
  
  // 如果没有明确的标题，尝试从第一行提取
  if (!taskInfo.title && lines.length > 0) {
    taskInfo.title = lines[0].trim();
  }
  
  // 描述就是整个消息
  taskInfo.description = message;

  return taskInfo;
}

// 解析时间字符串
function parseTimeString(timeStr) {
  const now = moment();
  
  if (timeStr.includes('今天')) {
    return now.format('YYYY-MM-DD HH:mm:ss');
  } else if (timeStr.includes('明天')) {
    return now.add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
  } else if (timeStr.includes('下周')) {
    return now.add(1, 'week').format('YYYY-MM-DD HH:mm:ss');
  } else if (timeStr.includes('天后')) {
    const days = parseInt(timeStr.match(/(\d+)/)[1]);
    return now.add(days, 'days').format('YYYY-MM-DD HH:mm:ss');
  } else if (timeStr.includes('天')) {
    const days = parseInt(timeStr.match(/(\d+)/)[1]);
    return now.add(days, 'days').format('YYYY-MM-DD HH:mm:ss');
  } else if (timeStr.match(/\d{4}-\d{2}-\d{2}/)) {
    return moment(timeStr).format('YYYY-MM-DD HH:mm:ss');
  } else if (timeStr.match(/\d{2}-\d{2}/)) {
    const currentYear = moment().year();
    return moment(`${currentYear}-${timeStr}`).format('YYYY-MM-DD HH:mm:ss');
  } else if (timeStr.match(/\d{2}\/\d{2}/)) {
    const currentYear = moment().year();
    return moment(`${currentYear}-${timeStr.replace('/', '-')}`).format('YYYY-MM-DD HH:mm:ss');
  }
  
  return null;
}

// 生成AI响应
function generateAIResponse(taskInfo, userMessage) {
  let response = '';
  let suggestions = [];
  let can_create_task = false;

  // 检查是否提取到了任务信息
  if (taskInfo.title) {
    can_create_task = true;
    response = `我理解您要创建的任务：\n\n`;
    response += `📋 任务名称：${taskInfo.title}\n`;
    
    if (taskInfo.assignee_name) {
      response += `👤 负责人：${taskInfo.assignee_name}\n`;
    }
    
    if (taskInfo.participants.length > 0) {
      response += `👥 参与人：${taskInfo.participants.join(', ')}\n`;
    }
    
    if (taskInfo.priority !== 2) {
      const priorityText = ['低', '中', '高', '紧急'][taskInfo.priority - 1];
      response += `⚡ 优先级：${priorityText}\n`;
    }
    
    if (taskInfo.start_time) {
      response += `🚀 开始时间：${taskInfo.start_time}\n`;
    }
    
    if (taskInfo.estimated_completion_time) {
      response += `⏰ 预计完成时间：${taskInfo.estimated_completion_time}\n`;
    }
    
    response += `\n请确认信息是否正确，我可以为您创建这个任务。`;
    
    suggestions = [
      '创建任务',
      '修改信息',
      '取消创建'
    ];
  } else {
    response = `您好！我是您的任务管理助手。请告诉我您想要创建的任务信息，比如：\n\n`;
    response += `• 任务名称\n`;
    response += `• 负责人\n`;
    response += `• 参与人员\n`;
    response += `• 优先级（紧急/高/中/低）\n`;
    response += `• 开始时间\n`;
    response += `• 预计完成时间\n\n`;
    response += `您可以这样描述："创建一个网站开发任务，负责人是张三，参与人有李四和王五，优先级高，明天开始，一周后完成"。`;
    
    suggestions = [
      '查看任务列表',
      '查看员工信息',
      '查看提醒设置'
    ];
  }

  return {
    response,
    suggestions,
    can_create_task
  };
}

module.exports = router;
