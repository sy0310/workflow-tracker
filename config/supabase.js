const { createClient } = require('@supabase/supabase-js');

// Supabase 配置 - 使用项目1
const supabaseUrl = process.env.SUPABASE_URL || 'https://htgghiyahgaiwxdsukmv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2doaXlhaGdhaXd4ZHN1a212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTYzOTMsImV4cCI6MjA3NjEzMjM5M30.HSkHQnyKFoilEWXBAfX7QpDXr9v93zmh8awgbgDL-vs';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
