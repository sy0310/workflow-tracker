const express = require('express');
const router = express.Router();
require('dotenv').config();
// 使用统一的数据库接口
const db = require('../database-unified');
const authenticateToken = require('../middleware/authenticateToken');

// 获取部门项目列表
router.get('/:department/projects', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    const { status, priority } = req.query;
    
    console.log('获取部门项目列表:', department);
    console.log('查询参数:', { status, priority });
    
    // 直接查询部门专用表
    let projects = [];
    
    try {
      // 尝试查询部门专用表
      projects = await db.query(department, {
        order: '创建时间',
        limit: 1000
      });
      console.log(`从${department}表获取到${projects.length}条记录`);
    } catch (error) {
      console.log(`部门表${department}不存在，尝试从tasks表查询:`, error.message);
      
      // 如果部门表不存在，从tasks表查询
      const allTasks = await db.query('tasks', {
        order: 'created_at',
        limit: 1000
      });
      
      // 过滤出属于该部门的任务
      projects = allTasks.filter(task => {
        try {
          const description = JSON.parse(task.description || '{}');
          return description.department === department;
        } catch (e) {
          return false;
        }
      });
      
      console.log(`从tasks表过滤出${projects.length}条${department}记录`);
    }
    
    // 应用状态和优先级过滤
    if (status) {
      projects = projects.filter(project => project.status == status);
    }
    
    if (priority) {
      projects = projects.filter(project => project.priority == priority);
    }
    
    console.log(`最终返回${projects.length}条记录`);
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
    
    console.log('获取单个部门项目:', department, projectId);
    
    let project = null;
    
    try {
      // 尝试从部门专用表获取
      project = await db.get(department, { where: { id: projectId } });
      console.log(`从${department}表获取项目:`, project ? '成功' : '未找到');
    } catch (error) {
      console.log(`部门表${department}不存在，从tasks表查询:`, error.message);
      
      // 从tasks表查询
      const allTasks = await db.query('tasks', {
        where: { id: projectId },
        limit: 1
      });
      
      if (allTasks.length > 0) {
        const task = allTasks[0];
        try {
          const description = JSON.parse(task.description || '{}');
          if (description.department === department) {
            project = task;
          }
        } catch (e) {
          console.log('解析任务描述失败:', e.message);
        }
      }
    }
    
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
    
    console.log('创建部门项目:', department);
    console.log('项目数据:', projectData);
    
    let newProject = null;
    
    try {
      // 尝试直接插入到部门专用表
      newProject = await db.insert(department, projectData);
      console.log(`成功在${department}表创建项目:`, newProject.id);
    } catch (error) {
      console.log(`部门表${department}不存在，插入到tasks表:`, error.message);
      
      // 如果部门表不存在，插入到tasks表
      const { 项目名称, 项目描述, 负责人, 优先级, 状态, 开始时间, 预计完成时间, ...departmentFields } = projectData;
      
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
      
      newProject = await db.insert('tasks', taskData);
      console.log('在tasks表创建项目成功:', newProject.id);
    }
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('创建部门项目错误:', error);
    res.status(500).json({ error: '创建项目失败', details: error.message });
  }
});

// 更新部门项目
router.put('/:department/projects/:id', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    const projectId = req.params.id;
    const updateData = req.body;
    
    console.log('更新部门项目:', department, projectId);
    console.log('更新数据:', updateData);
    
    let updatedProject = null;
    
    try {
      // 尝试更新部门专用表
      updatedProject = await db.update(department, updateData, { id: projectId });
      console.log(`成功更新${department}表项目:`, updatedProject.id);
    } catch (error) {
      console.log(`部门表${department}不存在，更新tasks表:`, error.message);
      
      // 如果部门表不存在，更新tasks表
      const { 项目名称, 项目描述, 负责人, 优先级, 状态, 开始时间, 预计完成时间, ...departmentFields } = updateData;
      
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
      
      updatedProject = await db.update('tasks', taskData, { id: projectId });
      console.log('在tasks表更新项目成功:', updatedProject.id);
    }
    
    if (!updatedProject) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    res.json(updatedProject);
  } catch (error) {
    console.error('更新部门项目错误:', error);
    res.status(500).json({ error: '更新项目失败', details: error.message });
  }
});

// 删除部门项目
router.delete('/:department/projects/:id', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    const projectId = req.params.id;
    
    console.log('删除部门项目:', department, projectId);
    
    let deleted = false;
    
    try {
      // 尝试从部门专用表删除
      await db.remove(department, { id: projectId });
      deleted = true;
      console.log(`成功从${department}表删除项目`);
    } catch (error) {
      console.log(`部门表${department}不存在，从tasks表删除:`, error.message);
      
      // 从tasks表删除
      await db.remove('tasks', { id: projectId });
      deleted = true;
      console.log('从tasks表删除项目成功');
    }
    
    if (!deleted) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    res.json({ message: '项目已删除' });
  } catch (error) {
    console.error('删除部门项目错误:', error);
    res.status(500).json({ error: '删除项目失败', details: error.message });
  }
});

// 获取部门统计信息
router.get('/:department/stats', authenticateToken, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    
    console.log('获取部门统计信息:', department);
    
    let projects = [];
    
    try {
      // 尝试从部门专用表获取
      projects = await db.query(department, { 
        order: '创建时间',
        limit: 1000 
      });
      console.log(`从${department}表获取${projects.length}条记录用于统计`);
    } catch (error) {
      console.log(`部门表${department}不存在，从tasks表统计:`, error.message);
      
      // 从tasks表获取
      const allTasks = await db.query('tasks', { limit: 1000 });
      
      // 过滤出属于该部门的任务
      projects = allTasks.filter(task => {
        try {
          const description = JSON.parse(task.description || '{}');
          return description.department === department;
        } catch (e) {
          return false;
        }
      });
      
      console.log(`从tasks表过滤出${projects.length}条${department}记录用于统计`);
    }
    
    // 计算统计信息
    const stats = {
      total_projects: projects.length,
      pending_projects: projects.filter(p => p.status == 1).length,
      in_progress_projects: projects.filter(p => p.status == 2).length,
      completed_projects: projects.filter(p => p.status == 3).length,
      cancelled_projects: projects.filter(p => p.status == 4).length,
      low_priority: projects.filter(p => p.priority == 1).length,
      medium_priority: projects.filter(p => p.priority == 2).length,
      high_priority: projects.filter(p => p.priority == 3).length,
      urgent_priority: projects.filter(p => p.priority == 4).length
    };
    
    console.log('统计结果:', stats);
    res.json(stats);
  } catch (error) {
    console.error('获取部门统计错误:', error);
    res.status(500).json({ error: '获取统计信息失败', details: error.message });
  }
});

module.exports = router;
