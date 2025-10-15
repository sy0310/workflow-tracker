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
    
    let sql = `SELECT * FROM "${department}" WHERE 1=1`;
    const params = [];
    let paramCount = 1;
    
    if (status) {
      sql += ` AND 状态 = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (priority) {
      sql += ` AND 优先级 = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }
    
    sql += ' ORDER BY 创建时间 DESC';
    
    const projects = await db.query(sql, params);
    res.json(projects);
  } catch (error) {
    console.error('获取部门项目列表错误:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取项目列表失败', details: error.message });
  }
});

// 获取单个部门项目
router.get('/:department/projects/:id', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    const projectId = req.params.id;
    
    const project = await db.get(`SELECT * FROM "${department}" WHERE id = $1`, [projectId]);
    
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
    
    // 构建动态 SQL
    const columns = Object.keys(projectData);
    const values = Object.values(projectData);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `INSERT INTO "${department}" (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`;
    
    const result = await db.run(sql, values);
    
    // 获取创建的项目
    const newProject = await db.get(`SELECT * FROM "${department}" WHERE id = $1`, [result.id]);
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('创建部门项目错误:', error);
    res.status(500).json({ error: '创建项目失败' });
  }
});

// 更新部门项目 - 调试版本
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
    
    // 构建动态 SQL
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = columns.map((col, index) => `"${col}" = $${index + 1}`).join(', ');
    
    const sql = `UPDATE "${department}" SET ${setClause} WHERE id = $${columns.length + 1}`;
    values.push(projectId);
    
    console.log('生成的SQL:', sql);
    console.log('参数值:', values);
    
    // 先检查项目是否存在
    console.log('检查项目是否存在...');
    const existingProject = await db.get(`SELECT * FROM "${department}" WHERE id = $1`, [projectId]);
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
    const updatedProject = await db.get(`SELECT * FROM "${department}" WHERE id = $1`, [projectId]);
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
    
    const result = await db.run(`DELETE FROM "${department}" WHERE id = $1`, [projectId]);
    
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
        SUM(CASE WHEN 状态 = 1 THEN 1 ELSE 0 END) as pending_projects,
        SUM(CASE WHEN 状态 = 2 THEN 1 ELSE 0 END) as in_progress_projects,
        SUM(CASE WHEN 状态 = 3 THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN 状态 = 4 THEN 1 ELSE 0 END) as cancelled_projects,
        SUM(CASE WHEN 优先级 = 1 THEN 1 ELSE 0 END) as low_priority,
        SUM(CASE WHEN 优先级 = 2 THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN 优先级 = 3 THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN 优先级 = 4 THEN 1 ELSE 0 END) as urgent_priority
      FROM "${department}"
    `);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('获取部门统计错误:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

module.exports = router;
