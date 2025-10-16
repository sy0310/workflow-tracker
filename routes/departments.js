const express = require('express');
const router = express.Router();
require('dotenv').config();
// 根据环境变量选择数据库
const usePostgres = process.env.DATABASE_URL;
const db = usePostgres ? require('../database-postgres') : require('../database');
const authenticateToken = require('../middleware/authenticateToken');

// 获取部门项目列表
router.get('/:department/projects', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    const { status, priority } = req.query;
    
    // 根据数据库类型构建SQL查询
    let sql, params;
    
    if (usePostgres) {
      // PostgreSQL 使用 $1, $2, $3... 占位符
      sql = `SELECT * FROM tasks WHERE description LIKE $1`;
      params = [`%"department":"${department}"%`];
      
      let paramCount = 2;
      if (status) {
        sql += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }
      
      if (priority) {
        sql += ` AND priority = $${paramCount}`;
        params.push(priority);
        paramCount++;
      }
    } else {
      // SQLite 使用 ? 占位符
      sql = `SELECT * FROM tasks WHERE description LIKE ?`;
      params = [`%"department":"${department}"%`];
      
      if (status) {
        sql += ` AND status = ?`;
        params.push(status);
      }
      
      if (priority) {
        sql += ` AND priority = ?`;
        params.push(priority);
      }
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const projects = await db.query(sql, params);
    
    if (!Array.isArray(projects)) {
      console.error('数据库查询结果格式错误:', typeof projects, projects);
      return res.status(500).json({ error: '数据库查询结果格式错误' });
    }
    
    res.json(projects);
  } catch (error) {
    console.error('获取部门项目列表错误:', error);
    res.status(500).json({ error: '获取项目列表失败', details: error.message });
  }
});

// 获取单个部门项目
router.get('/:department/projects/:id', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    const projectId = req.params.id;
    
    const project = await db.get(`SELECT * FROM tasks WHERE id = ? AND description LIKE ?`, [projectId, `%"department":"${department}"%`]);
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('获取部门项目错误:', error);
    res.status(500).json({ error: '获取项目失败' });
  }
});

// 创建部门项目
router.post('/:department/projects', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    const projectData = req.body;
    
    // 将部门特有字段存储到 description 字段中（JSON格式）
    const { 项目名称, 项目描述, 负责人, 优先级, 状态, 开始时间, 预计完成时间, ...departmentFields } = projectData;
    
    // 构建基础任务数据
    const taskData = {
      title: 项目名称 || '',
      description: JSON.stringify({
        original_description: 项目描述 || '',
        department: department,
        department_fields: departmentFields
      }),
      priority: 优先级 || 2,
      status: 状态 || 1,
      start_time: 开始时间 || null,
      estimated_completion_time: 预计完成时间 || null
    };
    
    // 构建动态 SQL
    const columns = Object.keys(taskData);
    const values = Object.values(taskData);
    const placeholders = columns.map(() => '?').join(', ');
    
    const sql = `INSERT INTO tasks (${columns.join(', ')}) VALUES (${placeholders})`;
    
    const result = await db.run(sql, values);
    
    // 获取创建的项目
    const newProject = await db.get(`SELECT * FROM tasks WHERE id = ?`, [result.id]);
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('创建部门项目错误:', error);
    res.status(500).json({ error: '创建项目失败' });
  }
});

// 更新部门项目 - 使用 tasks 表
router.put('/:department/projects/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== 开始调试更新项目 ===');
    console.log('请求参数:', req.params);
    console.log('请求体:', req.body);
    
    const department = decodeURIComponent(req.params.department);
    const projectId = req.params.id;
    const updateData = req.body;
    
    console.log('解码后的部门:', department);
    console.log('项目ID:', projectId);
    console.log('更新数据:', updateData);
    console.log('数据库类型:', usePostgres ? 'PostgreSQL' : 'SQLite');
    
    // 将部门特有字段存储到 description 字段中（JSON格式）
    const { 项目名称, 项目描述, 负责人, 优先级, 状态, 开始时间, 预计完成时间, ...departmentFields } = updateData;
    
    // 构建基础任务数据
    const taskData = {
      title: 项目名称 || '',
      description: JSON.stringify({
        original_description: 项目描述 || '',
        department: department,
        department_fields: departmentFields
      }),
      priority: 优先级 || 2,
      status: 状态 || 1,
      start_time: 开始时间 || null,
      estimated_completion_time: 预计完成时间 || null
    };
    
    // 构建动态 SQL
    const columns = Object.keys(taskData);
    const values = Object.values(taskData);
    const setClause = columns.map((col) => `"${col}" = ?`).join(', ');
    
    const sql = `UPDATE tasks SET ${setClause} WHERE id = ?`;
    values.push(projectId);
    
    console.log('生成的SQL:', sql);
    console.log('参数值:', values);
    
    // 先检查项目是否存在
    console.log('检查项目是否存在...');
    const existingProject = await db.get(`SELECT * FROM tasks WHERE id = ?`, [projectId]);
    console.log('现有项目:', existingProject);
    
    if (!existingProject) {
      console.log('项目不存在');
      return res.status(404).json({ error: '项目不存在' });
    }
    
    console.log('执行更新操作...');
    const result = await db.run(sql, values);
    console.log('更新结果:', result);
    
    if (result.changes === 0) {
      console.log('没有记录被更新');
      return res.status(404).json({ error: '项目不存在或没有变化' });
    }
    
    // 获取更新后的项目
    console.log('获取更新后的项目...');
    const updatedProject = await db.get(`SELECT * FROM tasks WHERE id = ?`, [projectId]);
    console.log('更新后的项目:', updatedProject);
    
    console.log('=== 更新成功 ===');
    res.json(updatedProject);
    
  } catch (error) {
    console.error('=== 调试错误信息 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('请求参数:', req.params);
    console.error('请求体:', req.body);
    console.error('数据库类型:', usePostgres ? 'PostgreSQL' : 'SQLite');
    
    // 提供更详细的错误信息
    let errorMessage = '更新项目失败';
    let errorDetails = error.message;
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      errorMessage = '部门表不存在';
      errorDetails = `表 "${req.params.department}" 不存在`;
    } else if (error.message.includes('column') && error.message.includes('does not exist')) {
      errorMessage = '列不存在';
      errorDetails = `某个列不存在: ${error.message}`;
    } else if (error.message.includes('syntax error')) {
      errorMessage = 'SQL语法错误';
      errorDetails = `SQL语法错误: ${error.message}`;
    } else if (error.message.includes('permission denied')) {
      errorMessage = '权限不足';
      errorDetails = '数据库权限不足';
    }
    
    console.error('=== 错误处理完成 ===');
    res.status(500).json({ 
      error: errorMessage, 
      details: errorDetails,
      debug: {
        department: req.params.department,
        projectId: req.params.id,
        updateData: req.body,
        errorType: error.constructor.name
      }
    });
  }
});

// 删除部门项目
router.delete('/:department/projects/:id', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    const projectId = req.params.id;
    
    const result = await db.run(`DELETE FROM tasks WHERE id = ? AND description LIKE ?`, [projectId, `%"department":"${department}"%`]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    res.json({ message: '项目已删除' });
  } catch (error) {
    console.error('删除部门项目错误:', error);
    res.status(500).json({ error: '删除项目失败' });
  }
});

// 获取部门统计信息
router.get('/:department/stats', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as pending_projects,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as in_progress_projects,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as cancelled_projects,
        SUM(CASE WHEN priority = 1 THEN 1 ELSE 0 END) as low_priority,
        SUM(CASE WHEN priority = 2 THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN priority = 3 THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN priority = 4 THEN 1 ELSE 0 END) as urgent_priority
      FROM tasks
      WHERE description LIKE ?
    `, [`%"department":"${department}"%`]);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('获取部门统计错误:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

module.exports = router;
