// 根据环境变量选择数据库
const usePostgres = process.env.DATABASE_URL;
const db = usePostgres ? require('../database-postgres') : require('../database');
const axios = require('axios');

// 微信通知配置（需要根据实际情况配置）
const WECHAT_CONFIG = {
  // 企业微信机器人webhook URL
  webhook_url: process.env.WECHAT_WEBHOOK_URL || '',
  // 秘书处的webhook URL（如果有单独的）
  secretary_webhook_url: process.env.SECRETARY_WEBHOOK_URL || ''
};

// 检查任务截止日期
async function checkTaskDeadlines() {
  try {
    console.log('开始检查任务截止日期...');
    
    // 获取今天到期的任务
    const today = new Date().toISOString().split('T')[0];
    const tasks = await db.query(`
      SELECT t.*, 
             s1.name as assignee_name, s1.wechat_id as assignee_wechat,
             s2.name as creator_name
      FROM tasks t
      LEFT JOIN staff s1 ON t.assignee_id = s1.id
      LEFT JOIN staff s2 ON t.created_by = s2.id
      WHERE t.status IN (1, 2) 
        AND DATE(t.estimated_completion_time) = ?
        AND t.id NOT IN (
          SELECT DISTINCT task_id FROM notifications 
          WHERE notification_type = 'deadline_reminder' 
          AND DATE(created_at) = ?
        )
    `, [today, today]);

    for (const task of tasks) {
      await sendDeadlineReminder(task);
    }

    console.log(`检查完成，发现 ${tasks.length} 个到期任务`);
  } catch (error) {
    console.error('检查任务截止日期错误:', error);
  }
}

// 检查即将到期的任务
async function checkUpcomingTasks() {
  try {
    console.log('检查即将到期的任务...');
    
    // 获取未来24小时内到期的任务
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const tasks = await db.query(`
      SELECT t.*, 
             s1.name as assignee_name, s1.wechat_id as assignee_wechat,
             s2.name as creator_name
      FROM tasks t
      LEFT JOIN staff s1 ON t.assignee_id = s1.id
      LEFT JOIN staff s2 ON t.created_by = s2.id
      WHERE t.status IN (1, 2) 
        AND DATE(t.estimated_completion_time) = ?
        AND t.id NOT IN (
          SELECT DISTINCT task_id FROM notifications 
          WHERE notification_type = 'upcoming_reminder' 
          AND DATE(created_at) = ?
        )
    `, [tomorrowStr, new Date().toISOString().split('T')[0]]);

    for (const task of tasks) {
      await sendUpcomingReminder(task);
    }

    console.log(`检查完成，发现 ${tasks.length} 个即将到期任务`);
  } catch (error) {
    console.error('检查即将到期任务错误:', error);
  }
}

// 发送截止日期提醒
async function sendDeadlineReminder(task) {
  try {
    const message = `🚨 任务截止提醒\n\n任务名称：${task.title}\n负责人：${task.assignee_name}\n截止时间：${task.estimated_completion_time}\n状态：${getTaskStatusText(task.status)}\n\n请及时完成任务！`;
    
    // 记录提醒
    await db.run(
      'INSERT INTO notifications (task_id, recipient_id, notification_type, message) VALUES (?, ?, ?, ?)',
      [task.id, task.assignee_id, 'deadline_reminder', message]
    );

    // 发送微信通知
    if (WECHAT_CONFIG.webhook_url) {
      await sendWechatMessage(WECHAT_CONFIG.webhook_url, message);
    }

    console.log(`已发送截止提醒：${task.title}`);
  } catch (error) {
    console.error('发送截止提醒错误:', error);
  }
}

// 发送即将到期提醒
async function sendUpcomingReminder(task) {
  try {
    const message = `⏰ 任务即将到期提醒\n\n任务名称：${task.title}\n负责人：${task.assignee_name}\n预计完成时间：${task.estimated_completion_time}\n状态：${getTaskStatusText(task.status)}\n\n请注意时间安排！`;
    
    // 记录提醒
    await db.run(
      'INSERT INTO notifications (task_id, recipient_id, notification_type, message) VALUES (?, ?, ?, ?)',
      [task.id, task.assignee_id, 'upcoming_reminder', message]
    );

    // 发送微信通知
    if (WECHAT_CONFIG.webhook_url) {
      await sendWechatMessage(WECHAT_CONFIG.webhook_url, message);
    }

    console.log(`已发送即将到期提醒：${task.title}`);
  } catch (error) {
    console.error('发送即将到期提醒错误:', error);
  }
}

// 发送微信消息
async function sendWechatMessage(webhookUrl, message) {
  try {
    const data = {
      msgtype: 'text',
      text: {
        content: message
      }
    };

    const response = await axios.post(webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errcode === 0) {
      console.log('微信消息发送成功');
    } else {
      console.error('微信消息发送失败:', response.data);
    }
  } catch (error) {
    console.error('发送微信消息错误:', error);
  }
}

// 发送任务创建通知
async function sendTaskCreatedNotification(task, creator) {
  try {
    const message = `📋 新任务创建通知\n\n任务名称：${task.title}\n创建人：${creator.name}\n负责人：${task.assignee_name}\n优先级：${getPriorityText(task.priority)}\n预计完成时间：${task.estimated_completion_time}\n\n请查看任务详情！`;
    
    // 记录提醒
    await db.run(
      'INSERT INTO notifications (task_id, recipient_id, notification_type, message) VALUES (?, ?, ?, ?)',
      [task.id, task.assignee_id, 'task_created', message]
    );

    // 发送微信通知
    if (WECHAT_CONFIG.webhook_url) {
      await sendWechatMessage(WECHAT_CONFIG.webhook_url, message);
    }

    console.log(`已发送任务创建通知：${task.title}`);
  } catch (error) {
    console.error('发送任务创建通知错误:', error);
  }
}

// 发送任务完成通知
async function sendTaskCompletedNotification(task, assignee) {
  try {
    const message = `✅ 任务完成通知\n\n任务名称：${task.title}\n完成人：${assignee.name}\n实际完成时间：${task.actual_completion_time}\n\n任务已成功完成！`;
    
    // 记录提醒
    await db.run(
      'INSERT INTO notifications (task_id, recipient_id, notification_type, message) VALUES (?, ?, ?, ?)',
      [task.id, task.created_by, 'task_completed', message]
    );

    // 发送微信通知
    if (WECHAT_CONFIG.webhook_url) {
      await sendWechatMessage(WECHAT_CONFIG.webhook_url, message);
    }

    console.log(`已发送任务完成通知：${task.title}`);
  } catch (error) {
    console.error('发送任务完成通知错误:', error);
  }
}

// 发送秘书处提醒
async function sendSecretaryReminder(task, message) {
  try {
    // 记录提醒
    await db.run(
      'INSERT INTO notifications (task_id, recipient_id, notification_type, message) VALUES (?, ?, ?, ?)',
      [task.id, null, 'secretary_reminder', message]
    );

    // 发送到秘书处
    if (WECHAT_CONFIG.secretary_webhook_url) {
      await sendWechatMessage(WECHAT_CONFIG.secretary_webhook_url, message);
    } else if (WECHAT_CONFIG.webhook_url) {
      await sendWechatMessage(WECHAT_CONFIG.webhook_url, `[秘书处] ${message}`);
    }

    console.log(`已发送秘书处提醒：${task.title}`);
  } catch (error) {
    console.error('发送秘书处提醒错误:', error);
  }
}

// 获取任务状态文本
function getTaskStatusText(status) {
  const statusMap = {
    1: '待开始',
    2: '进行中',
    3: '已完成',
    4: '已取消'
  };
  return statusMap[status] || '未知';
}

// 获取优先级文本
function getPriorityText(priority) {
  const priorityMap = {
    1: '低',
    2: '中',
    3: '高',
    4: '紧急'
  };
  return priorityMap[priority] || '未知';
}

// 处理待发送的提醒
async function processPendingNotifications() {
  try {
    const notifications = await db.query(`
      SELECT n.*, 
             t.title as task_title,
             s.name as recipient_name,
             s.wechat_id as recipient_wechat
      FROM notifications n
      LEFT JOIN tasks t ON n.task_id = t.id
      LEFT JOIN staff s ON n.recipient_id = s.id
      WHERE n.status = 1 
        AND (n.scheduled_time IS NULL OR n.scheduled_time <= datetime('now'))
      ORDER BY n.created_at ASC
      LIMIT 10
    `);

    for (const notification of notifications) {
      try {
        // 发送通知
        if (notification.notification_type === 'secretary' && WECHAT_CONFIG.secretary_webhook_url) {
          await sendWechatMessage(WECHAT_CONFIG.secretary_webhook_url, notification.message);
        } else if (WECHAT_CONFIG.webhook_url) {
          await sendWechatMessage(WECHAT_CONFIG.webhook_url, notification.message);
        }

        // 更新状态为已发送
        await db.run(
          'UPDATE notifications SET status = 2, sent_time = CURRENT_TIMESTAMP WHERE id = ?',
          [notification.id]
        );

        console.log(`已处理通知：${notification.task_title}`);
      } catch (error) {
        console.error(`处理通知失败 ${notification.id}:`, error);
      }
    }
  } catch (error) {
    console.error('处理待发送提醒错误:', error);
  }
}

module.exports = {
  checkTaskDeadlines,
  checkUpcomingTasks,
  sendTaskCreatedNotification,
  sendTaskCompletedNotification,
  sendSecretaryReminder,
  processPendingNotifications
};
