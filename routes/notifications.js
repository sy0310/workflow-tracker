const express = require('express');
const router = express.Router();
const db = require('../database');

// 获取所有提醒
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    let sql = `
      SELECT n.*, 
             t.title as task_title,
             s.name as recipient_name,
             s.wechat_id as recipient_wechat
      FROM notifications n
      LEFT JOIN tasks t ON n.task_id = t.id
      LEFT JOIN staff s ON n.recipient_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND n.status = ?';
      params.push(status);
    }
    if (type) {
      sql += ' AND n.notification_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY n.created_at DESC';

    const notifications = await db.query(sql, params);
    res.json(notifications);
  } catch (error) {
    console.error('获取提醒列表错误:', error);
    res.status(500).json({ error: '获取提醒列表失败' });
  }
});

// 创建提醒
router.post('/', async (req, res) => {
  try {
    const {
      task_id,
      recipient_id,
      notification_type,
      message,
      scheduled_time
    } = req.body;

    const result = await db.run(
      'INSERT INTO notifications (task_id, recipient_id, notification_type, message, scheduled_time) VALUES (?, ?, ?, ?, ?)',
      [task_id, recipient_id, notification_type, message, scheduled_time]
    );

    const newNotification = await db.get(`
      SELECT n.*, 
             t.title as task_title,
             s.name as recipient_name,
             s.wechat_id as recipient_wechat
      FROM notifications n
      LEFT JOIN tasks t ON n.task_id = t.id
      LEFT JOIN staff s ON n.recipient_id = s.id
      WHERE n.id = ?
    `, [result.id]);

    res.status(201).json(newNotification);
  } catch (error) {
    console.error('创建提醒错误:', error);
    res.status(500).json({ error: '创建提醒失败' });
  }
});

// 更新提醒状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const notificationId = req.params.id;

    // 如果状态变为已发送，记录发送时间
    let sentTime = null;
    if (status === 2) {
      sentTime = new Date().toISOString();
    }

    await db.run(
      'UPDATE notifications SET status = ?, sent_time = ? WHERE id = ?',
      [status, sentTime, notificationId]
    );

    const updatedNotification = await db.get(`
      SELECT n.*, 
             t.title as task_title,
             s.name as recipient_name,
             s.wechat_id as recipient_wechat
      FROM notifications n
      LEFT JOIN tasks t ON n.task_id = t.id
      LEFT JOIN staff s ON n.recipient_id = s.id
      WHERE n.id = ?
    `, [notificationId]);

    res.json(updatedNotification);
  } catch (error) {
    console.error('更新提醒状态错误:', error);
    res.status(500).json({ error: '更新提醒状态失败' });
  }
});

// 删除提醒
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '提醒不存在' });
    }
    res.json({ message: '提醒已删除' });
  } catch (error) {
    console.error('删除提醒错误:', error);
    res.status(500).json({ error: '删除提醒失败' });
  }
});

// 获取待发送的提醒
router.get('/pending', async (req, res) => {
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
    `);

    res.json(notifications);
  } catch (error) {
    console.error('获取待发送提醒错误:', error);
    res.status(500).json({ error: '获取待发送提醒失败' });
  }
});

// 批量创建任务提醒
router.post('/batch', async (req, res) => {
  try {
    const { task_id, notification_type, message, scheduled_time } = req.body;

    // 获取任务信息
    const task = await db.get(`
      SELECT t.*, 
             s1.name as assignee_name, s1.wechat_id as assignee_wechat,
             s2.name as creator_name
      FROM tasks t
      LEFT JOIN staff s1 ON t.assignee_id = s1.id
      LEFT JOIN staff s2 ON t.created_by = s2.id
      WHERE t.id = ?
    `, [task_id]);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    const notifications = [];

    if (notification_type === 'direct') {
      // 直接提醒负责人
      if (task.assignee_id) {
        const result = await db.run(
          'INSERT INTO notifications (task_id, recipient_id, notification_type, message, scheduled_time) VALUES (?, ?, ?, ?, ?)',
          [task_id, task.assignee_id, 'direct', message, scheduled_time]
        );
        notifications.push(result.id);
      }
    } else if (notification_type === 'secretary') {
      // 提醒秘书处（这里假设秘书处用户的ID为1，实际使用时需要根据实际情况调整）
      const secretaryStaff = await db.get('SELECT id FROM staff WHERE department = ? AND position LIKE ? LIMIT 1', ['秘书处', '%秘书%']);
      
      if (secretaryStaff) {
        const secretaryMessage = `任务"${task.title}"需要关注，负责人：${task.assignee_name}，请及时跟进。`;
        const result = await db.run(
          'INSERT INTO notifications (task_id, recipient_id, notification_type, message, scheduled_time) VALUES (?, ?, ?, ?, ?)',
          [task_id, secretaryStaff.id, 'secretary', secretaryMessage, scheduled_time]
        );
        notifications.push(result.id);
      }
    }

    res.json({ 
      message: '批量提醒创建成功', 
      notification_ids: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('批量创建提醒错误:', error);
    res.status(500).json({ error: '批量创建提醒失败' });
  }
});

module.exports = router;
