const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://npbudtzlkdbnyjdkusfd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 初始化数据库表
async function initDatabase() {
  try {
    console.log('正在初始化 Supabase 数据库...');
    
    // 创建用户表
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('创建用户表失败:', usersError);
    }

    // 创建员工表
    const { error: staffError } = await supabase.rpc('create_staff_table');
    if (staffError && !staffError.message.includes('already exists')) {
      console.error('创建员工表失败:', staffError);
    }

    // 创建任务表
    const { error: tasksError } = await supabase.rpc('create_tasks_table');
    if (tasksError && !tasksError.message.includes('already exists')) {
      console.error('创建任务表失败:', tasksError);
    }

    // 创建提醒表
    const { error: notificationsError } = await supabase.rpc('create_notifications_table');
    if (notificationsError && !notificationsError.message.includes('already exists')) {
      console.error('创建提醒表失败:', notificationsError);
    }

    // 创建AI对话表
    const { error: conversationsError } = await supabase.rpc('create_ai_conversations_table');
    if (conversationsError && !conversationsError.message.includes('already exists')) {
      console.error('创建AI对话表失败:', conversationsError);
    }

    console.log('Supabase 数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 通用查询方法
async function query(sql, params = []) {
  try {
    // 对于 Supabase，我们使用 SQL 查询
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('查询错误:', error);
    throw error;
  }
}

// 通用执行方法
async function run(sql, params = []) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    });
    
    if (error) {
      throw error;
    }
    
    return { id: data?.insertId || 0, changes: data?.affectedRows || 0 };
  } catch (error) {
    console.error('执行错误:', error);
    throw error;
  }
}

// 获取单个记录
async function get(sql, params = []) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    });
    
    if (error) {
      throw error;
    }
    
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('获取记录错误:', error);
    throw error;
  }
}

// 关闭连接（Supabase 不需要手动关闭）
function close() {
  console.log('Supabase 连接已关闭');
  return Promise.resolve();
}

module.exports = {
  initDatabase,
  query,
  run,
  get,
  close,
  supabase
};
