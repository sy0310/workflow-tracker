const express = require('express');
const router = express.Router();
// 根据环境变量选择数据库
const usePostgres = process.env.DATABASE_URL;
const db = usePostgres ? require('../database-postgres') : require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB限制
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取所有员工
router.get('/', async (req, res) => {
  try {
    console.log('📋 开始获取员工列表...');
    console.log('🗄️ 数据库类型:', process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite');
    
    // 先测试数据库连接
    try {
      await db.query('SELECT 1');
      console.log('✅ 数据库连接正常');
    } catch (dbError) {
      console.error('❌ 数据库连接失败:', dbError);
      return res.status(500).json({ error: '数据库连接失败: ' + dbError.message });
    }
    
    // 检查表是否存在
    try {
      const tableCheck = await db.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='staff'
      `);
      console.log('📊 表检查结果:', tableCheck);
    } catch (tableError) {
      console.log('⚠️ 无法检查表结构 (可能是PostgreSQL):', tableError.message);
    }
    
    // 根据数据库类型选择合适的查询方式
    let staff;
    if (usePostgres) {
      // PostgreSQL: is_active 是 BOOLEAN 类型
      staff = await db.query('SELECT * FROM staff WHERE is_active = true ORDER BY name');
    } else {
      // SQLite: is_active 是 INTEGER 类型
      staff = await db.query('SELECT * FROM staff WHERE is_active = 1 ORDER BY name');
    }
    console.log('👥 查询到的员工数量:', staff ? staff.length : 'null');
    console.log('📋 员工数据:', staff);
    
    if (!Array.isArray(staff)) {
      console.error('❌ 查询结果不是数组:', typeof staff, staff);
      return res.status(500).json({ error: '数据库查询结果格式错误' });
    }
    
    res.json(staff);
  } catch (error) {
    console.error('❌ 获取员工列表错误:', error);
    console.error('❌ 错误堆栈:', error.stack);
    res.status(500).json({ error: '获取员工列表失败: ' + error.message });
  }
});

// 获取单个员工信息
router.get('/:id', async (req, res) => {
  try {
    // 根据数据库类型选择合适的查询方式
    let staff;
    if (usePostgres) {
      // PostgreSQL: is_active 是 BOOLEAN 类型
      staff = await db.get('SELECT * FROM staff WHERE id = $1 AND is_active = true', [req.params.id]);
    } else {
      // SQLite: is_active 是 INTEGER 类型
      staff = await db.get('SELECT * FROM staff WHERE id = ? AND is_active = 1', [req.params.id]);
    }
    if (!staff) {
      return res.status(404).json({ error: '员工不存在' });
    }
    res.json(staff);
  } catch (error) {
    console.error('获取员工信息错误:', error);
    res.status(500).json({ error: '获取员工信息失败' });
  }
});

// 创建新员工
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    console.log('📝 创建员工请求:', req.body);
    console.log('📁 上传文件:', req.file ? req.file.filename : '无文件');
    console.log('🗄️ 数据库类型:', process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite');
    
    const { name, wechat_id, wechat_name, email, phone, department, position } = req.body;
    const avatar_url = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({ error: '员工姓名是必填项' });
    }

    console.log('💾 准备插入数据库:', { name, wechat_id, wechat_name, email, phone, avatar_url, department, position });

    // 先测试数据库连接
    try {
      await db.query('SELECT 1');
      console.log('✅ 数据库连接正常');
    } catch (dbError) {
      console.error('❌ 数据库连接失败:', dbError);
      return res.status(500).json({ error: '数据库连接失败' });
    }

    let result;
    if (usePostgres) {
      // PostgreSQL: 使用 $1, $2... 占位符和 RETURNING id
      result = await db.run(
        'INSERT INTO staff (name, wechat_id, wechat_name, email, phone, avatar_url, department, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [name, wechat_id, wechat_name, email, phone, avatar_url, department, position]
      );
    } else {
      // SQLite: 使用 ? 占位符，然后查询最后插入的ID
      result = await db.run(
        'INSERT INTO staff (name, wechat_id, wechat_name, email, phone, avatar_url, department, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, wechat_id, wechat_name, email, phone, avatar_url, department, position]
      );
    }

    console.log('✅ 插入结果:', result);

    let newStaff;
    if (usePostgres) {
      newStaff = await db.get('SELECT * FROM staff WHERE id = $1', [result.id]);
    } else {
      newStaff = await db.get('SELECT * FROM staff WHERE id = ?', [result.id]);
    }
    console.log('📋 新员工信息:', newStaff);
    
    res.status(201).json(newStaff);
  } catch (error) {
    console.error('❌ 创建员工错误:', error);
    console.error('❌ 错误堆栈:', error.stack);
    
    if (error.message.includes('UNIQUE constraint failed') || error.message.includes('duplicate key value')) {
      res.status(400).json({ error: '微信ID已存在' });
    } else if (error.message.includes('not-null') || error.message.includes('null value')) {
      res.status(400).json({ error: '必填字段不能为空' });
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      res.status(500).json({ error: '数据库表不存在，请检查数据库初始化' });
    } else {
      res.status(500).json({ error: '创建员工失败: ' + error.message });
    }
  }
});

// 更新员工信息
router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { name, wechat_id, wechat_name, email, phone, department, position } = req.body;
    const staffId = req.params.id;

    // 获取当前员工信息
    let currentStaff;
    if (usePostgres) {
      currentStaff = await db.get('SELECT * FROM staff WHERE id = $1', [staffId]);
    } else {
      currentStaff = await db.get('SELECT * FROM staff WHERE id = ?', [staffId]);
    }
    if (!currentStaff) {
      return res.status(404).json({ error: '员工不存在' });
    }

    // 处理头像
    let avatar_url = currentStaff.avatar_url;
    if (req.file) {
      // 删除旧头像
      if (currentStaff.avatar_url) {
        const oldAvatarPath = path.join(__dirname, '..', 'public', currentStaff.avatar_url);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    if (usePostgres) {
      await db.run(
        'UPDATE staff SET name = $1, wechat_id = $2, wechat_name = $3, email = $4, phone = $5, avatar_url = $6, department = $7, position = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9',
        [name, wechat_id, wechat_name, email, phone, avatar_url, department, position, staffId]
      );
    } else {
      await db.run(
        'UPDATE staff SET name = ?, wechat_id = ?, wechat_name = ?, email = ?, phone = ?, avatar_url = ?, department = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, wechat_id, wechat_name, email, phone, avatar_url, department, position, staffId]
      );
    }

    let updatedStaff;
    if (usePostgres) {
      updatedStaff = await db.get('SELECT * FROM staff WHERE id = $1', [staffId]);
    } else {
      updatedStaff = await db.get('SELECT * FROM staff WHERE id = ?', [staffId]);
    }
    res.json(updatedStaff);
  } catch (error) {
    console.error('更新员工信息错误:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: '微信ID已存在' });
    } else {
      res.status(500).json({ error: '更新员工信息失败' });
    }
  }
});

// 删除员工（软删除）
router.delete('/:id', async (req, res) => {
  try {
    // 根据数据库类型选择合适的更新方式
    let result;
    if (usePostgres) {
      // PostgreSQL: is_active 是 BOOLEAN 类型
      result = await db.run('UPDATE staff SET is_active = false WHERE id = $1', [req.params.id]);
    } else {
      // SQLite: is_active 是 INTEGER 类型
      result = await db.run('UPDATE staff SET is_active = 0 WHERE id = ?', [req.params.id]);
    }
    if (result.changes === 0) {
      return res.status(404).json({ error: '员工不存在' });
    }
    res.json({ message: '员工已删除' });
  } catch (error) {
    console.error('删除员工错误:', error);
    res.status(500).json({ error: '删除员工失败' });
  }
});

// 搜索员工
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = `%${req.params.keyword}%`;
    // 根据数据库类型选择合适的查询方式
    let staff;
    if (usePostgres) {
      // PostgreSQL: is_active 是 BOOLEAN 类型
      staff = await db.query(
        'SELECT * FROM staff WHERE is_active = true AND (name LIKE $1 OR wechat_name LIKE $2 OR department LIKE $3) ORDER BY name',
        [keyword, keyword, keyword]
      );
    } else {
      // SQLite: is_active 是 INTEGER 类型
      staff = await db.query(
        'SELECT * FROM staff WHERE is_active = 1 AND (name LIKE ? OR wechat_name LIKE ? OR department LIKE ?) ORDER BY name',
        [keyword, keyword, keyword]
      );
    }
    res.json(staff);
  } catch (error) {
    console.error('搜索员工错误:', error);
    res.status(500).json({ error: '搜索员工失败' });
  }
});

module.exports = router;
