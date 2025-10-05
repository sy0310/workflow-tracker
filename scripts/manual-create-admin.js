const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function manualCreateAdmin() {
  try {
    console.log('🔧 手动创建管理员用户...');
    console.log('请在 Supabase Dashboard 的 Table Editor 中手动插入以下数据：');
    console.log('\n📋 在 users 表中插入以下记录：');
    console.log('用户名: admin');
    console.log('邮箱: admin@workflow.com');
    console.log('角色: admin');
    console.log('状态: true (活跃)');
    console.log('\n🔑 密码哈希值:');
    
    const bcrypt = require('bcryptjs');
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log(`password_hash: ${passwordHash}`);
    console.log('\n📝 完整的 SQL 插入语句：');
    console.log(`INSERT INTO users (username, email, password_hash, role, is_active) VALUES ('admin', 'admin@workflow.com', '${passwordHash}', 'admin', true);`);
    
    console.log('\n👥 在 staff 表中插入示例员工数据：');
    console.log(`INSERT INTO staff (name, wechat_id, wechat_name, email, phone, department, position) VALUES 
('张三', 'zhangsan_wx', '张三', 'zhangsan@example.com', '13800138001', '技术部', '前端工程师'),
('李四', 'lisi_wx', '李四', 'lisi@example.com', '13800138002', '技术部', '后端工程师'),
('王五', 'wangwu_wx', '王五', 'wangwu@example.com', '13800138003', '产品部', '产品经理'),
('赵六', 'zhaoliu_wx', '赵六', 'zhaoliu@example.com', '13800138004', '秘书处', '秘书');`);
    
    console.log('\n📋 在 tasks 表中插入示例任务数据：');
    console.log(`INSERT INTO tasks (title, description, assignee_id, participants, priority, status, start_time, estimated_completion_time, created_by) VALUES 
('网站首页开发', '开发公司官网首页，包括响应式设计和交互功能', 1, '[2, 3]', 3, 2, NOW(), NOW() + INTERVAL '7 days', 1),
('用户管理系统', '开发用户注册、登录、权限管理功能', 2, '[1]', 2, 1, NOW() + INTERVAL '1 day', NOW() + INTERVAL '14 days', 1),
('产品需求文档', '编写新产品的需求文档和功能规格说明', 3, '[4]', 2, 2, NOW(), NOW() + INTERVAL '5 days', 1);`);
    
    console.log('\n🔧 操作步骤：');
    console.log('1. 访问 Supabase Dashboard');
    console.log('2. 点击 "Table Editor"');
    console.log('3. 选择 "users" 表');
    console.log('4. 点击 "Insert row"');
    console.log('5. 填写上述数据');
    console.log('6. 点击 "Save"');
    console.log('\n或者：');
    console.log('1. 点击 "SQL Editor"');
    console.log('2. 粘贴上述 SQL 语句');
    console.log('3. 点击 "Run"');
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }
}

manualCreateAdmin();
