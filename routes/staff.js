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
    const staff = await db.query('SELECT * FROM staff WHERE is_active = true ORDER BY name');
    res.json(staff);
  } catch (error) {
    console.error('获取员工列表错误:', error);
    res.status(500).json({ error: '获取员工列表失败' });
  }
});

// 获取单个员工信息
router.get('/:id', async (req, res) => {
  try {
    const staff = await db.get('SELECT * FROM staff WHERE id = $1 AND is_active = true', [req.params.id]);
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
    const { name, wechat_id, wechat_name, email, phone, department, position } = req.body;
    const avatar_url = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const result = await db.run(
      'INSERT INTO staff (name, wechat_id, wechat_name, email, phone, avatar_url, department, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [name, wechat_id, wechat_name, email, phone, avatar_url, department, position]
    );

    const newStaff = await db.get('SELECT * FROM staff WHERE id = $1', [result.id]);
    res.status(201).json(newStaff);
  } catch (error) {
    console.error('创建员工错误:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: '微信ID已存在' });
    } else {
      res.status(500).json({ error: '创建员工失败' });
    }
  }
});

// 更新员工信息
router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { name, wechat_id, wechat_name, email, phone, department, position } = req.body;
    const staffId = req.params.id;

    // 获取当前员工信息
    const currentStaff = await db.get('SELECT * FROM staff WHERE id = $1', [staffId]);
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

    await db.run(
      'UPDATE staff SET name = $1, wechat_id = $2, wechat_name = $3, email = $4, phone = $5, avatar_url = $6, department = $7, position = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9',
      [name, wechat_id, wechat_name, email, phone, avatar_url, department, position, staffId]
    );

    const updatedStaff = await db.get('SELECT * FROM staff WHERE id = $1', [staffId]);
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
    const result = await db.run('UPDATE staff SET is_active = false WHERE id = $1', [req.params.id]);
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
    const staff = await db.query(
      'SELECT * FROM staff WHERE is_active = true AND (name LIKE $1 OR wechat_name LIKE $2 OR department LIKE $3) ORDER BY name',
      [keyword, keyword, keyword]
    );
    res.json(staff);
  } catch (error) {
    console.error('搜索员工错误:', error);
    res.status(500).json({ error: '搜索员工失败' });
  }
});

module.exports = router;
