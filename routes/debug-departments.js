const express = require('express');
const router = express.Router();
require('dotenv').config();
// 根据环境变量选择数据库
const usePostgres = process.env.DATABASE_URL;
const db = usePostgres ? require('../database-postgres') : require('../database');
const authenticateToken = require('../middleware/authenticateToken');

// 调试版本的更新部门项目路由
router.put('/:department/projects/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== 开始调试更新项目 ===');
    console.log('请求参数:', req.params);
    console.log('请求体:', req.body);
    console.log('请求头:', req.headers);
    
    const department = decodeURIComponent(req.params.department);
    const projectId = req.params.id;
    const updateData = req.body;
    
    console.log('解码后的部门:', department);
    console.log('项目ID:', projectId);
    console.log('更新数据:', updateData);
    
    // 检查数据库连接
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

module.exports = router;
