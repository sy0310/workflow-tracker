const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://npbudtzlkdbnyjdkusfd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
