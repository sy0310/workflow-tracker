const express = require('express');
const router = express.Router();
const db = require('../database');
const moment = require('moment');

// 获取所有任务
router.get('/', async (req, res) => {
  try {
    const { status, assignee_id, priority } = req.query;
    let sql = `
      SELECT t.*, 
             s1.name as assignee_name, s1.avatar_url as assignee_avatar,
             s2.name as creator_name
      FROM tasks t
      LEFT JOIN staff s1 ON t.assignee_id = s1.id
      LEFT JOIN staff s2 ON t.created_by = s2.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (assignee_id) {
      sql += ' AND t.assignee_id = ?';
      params.push(assignee_id);
    }
    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }

    sql += ' ORDER BY t.created_at DESC';

    const tasks = await db.query(sql, params);
    
    // 处理参与人信息
    const tasksWithParticipants = await Promise.all(tasks.map(async (task) => {
      if (task.participants) {
        const participantIds = JSON.parse(task.participants);
        if (participantIds.length > 0) {
          const participants = await db.query(
            'SELECT id, name, avatar_url FROM staff WHERE id IN (' + participantIds.map(() => '?').join(',') + ')',
            participantIds
          );
          task.participants_info = participants;
        } else {
          task.participants_info = [];
        }
      } else {
        task.participants_info = [];
      }
      return task;
    }));

    res.json(tasksWithParticipants);
  } catch (error) {
    console.error('获取任务列表错误:', error);
    res.status(500).json({ error: '获取任务列表失败' });
  }
});

// 获取单个任务
router.get('/:id', async (req, res) => {
  try {
    const task = await db.get(`
      SELECT t.*, 
             s1.name as assignee_name, s1.avatar_url as assignee_avatar, s1.wechat_id as assignee_wechat,
             s2.name as creator_name
      FROM tasks t
      LEFT JOIN staff s1 ON t.assignee_id = s1.id
      LEFT JOIN staff s2 ON t.created_by = s2.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    // 处理参与人信息
    if (task.participants) {
      const participantIds = JSON.parse(task.participants);
      if (participantIds.length > 0) {
        const participants = await db.query(
          'SELECT id, name, avatar_url, wechat_id FROM staff WHERE id IN (' + participantIds.map(() => '?').join(',') + ')',
          participantIds
        );
        task.participants_info = participants;
      } else {
        task.participants_info = [];
      }
    } else {
      task.participants_info = [];
    }

    res.json(task);
  } catch (error) {
    console.error('获取任务信息错误:', error);
    res.status(500).json({ error: '获取任务信息失败' });
  }
});

// 创建新任务
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      assignee_id,
      participants,
      priority,
      start_time,
      estimated_completion_time,
      created_by
    } = req.body;

    const result = await db.run(
      'INSERT INTO tasks (title, description, assignee_id, participants, priority, start_time, estimated_completion_time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, assignee_id, JSON.stringify(participants || []), priority, start_time, estimated_completion_time, created_by]
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

    // 处理参与人信息
    if (newTask.participants) {
      const participantIds = JSON.parse(newTask.participants);
      if (participantIds.length > 0) {
        const participants_info = await db.query(
          'SELECT id, name, avatar_url FROM staff WHERE id IN (' + participantIds.map(() => '?').join(',') + ')',
          participantIds
        );
        newTask.participants_info = participants_info;
      } else {
        newTask.participants_info = [];
      }
    } else {
      newTask.participants_info = [];
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error('创建任务错误:', error);
    res.status(500).json({ error: '创建任务失败' });
  }
});

// 更新任务
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      assignee_id,
      participants,
      priority,
      status,
      start_time,
      estimated_completion_time,
      actual_completion_time
    } = req.body;

    const taskId = req.params.id;

    // 如果状态变为已完成，自动设置完成时间
    let completionTime = actual_completion_time;
    if (status === 3 && !actual_completion_time) {
      completionTime = new Date().toISOString();
    }

    await db.run(
      'UPDATE tasks SET title = ?, description = ?, assignee_id = ?, participants = ?, priority = ?, status = ?, start_time = ?, estimated_completion_time = ?, actual_completion_time = ? WHERE id = ?',
      [title, description, assignee_id, JSON.stringify(participants || []), priority, status, start_time, estimated_completion_time, completionTime, taskId]
    );

    // 获取更新后的任务信息
    const updatedTask = await db.get(`
      SELECT t.*, 
             s1.name as assignee_name, s1.avatar_url as assignee_avatar,
             s2.name as creator_name
      FROM tasks t
      LEFT JOIN staff s1 ON t.assignee_id = s1.id
      LEFT JOIN staff s2 ON t.created_by = s2.id
      WHERE t.id = ?
    `, [taskId]);

    // 处理参与人信息
    if (updatedTask.participants) {
      const participantIds = JSON.parse(updatedTask.participants);
      if (participantIds.length > 0) {
        const participants_info = await db.query(
          'SELECT id, name, avatar_url FROM staff WHERE id IN (' + participantIds.map(() => '?').join(',') + ')',
          participantIds
        );
        updatedTask.participants_info = participants_info;
      } else {
        updatedTask.participants_info = [];
      }
    } else {
      updatedTask.participants_info = [];
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('更新任务错误:', error);
    res.status(500).json({ error: '更新任务失败' });
  }
});

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json({ message: '任务已删除' });
  } catch (error) {
    console.error('删除任务错误:', error);
    res.status(500).json({ error: '删除任务失败' });
  }
});

// 获取任务统计
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as cancelled_tasks,
        SUM(CASE WHEN priority = 1 THEN 1 ELSE 0 END) as low_priority,
        SUM(CASE WHEN priority = 2 THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN priority = 3 THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN priority = 4 THEN 1 ELSE 0 END) as urgent_priority
      FROM tasks
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('获取任务统计错误:', error);
    res.status(500).json({ error: '获取任务统计失败' });
  }
});

// 获取即将到期的任务
router.get('/upcoming/deadlines', async (req, res) => {
  try {
    const { days = 3 } = req.query;
    const upcomingDate = moment().add(days, 'days').format('YYYY-MM-DD HH:mm:ss');
    
    const tasks = await db.query(`
      SELECT t.*, 
             s1.name as assignee_name, s1.avatar_url as assignee_avatar,
             s2.name as creator_name
      FROM tasks t
      LEFT JOIN staff s1 ON t.assignee_id = s1.id
      LEFT JOIN staff s2 ON t.created_by = s2.id
      WHERE t.status IN (1, 2) 
        AND t.estimated_completion_time IS NOT NULL
        AND t.estimated_completion_time <= ?
      ORDER BY t.estimated_completion_time ASC
    `, [upcomingDate]);

    res.json(tasks);
  } catch (error) {
    console.error('获取即将到期任务错误:', error);
    res.status(500).json({ error: '获取即将到期任务失败' });
  }
});

module.exports = router;
