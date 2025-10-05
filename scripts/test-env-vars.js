require('dotenv').config();

console.log('🔍 检查环境变量...');

console.log('📊 DATABASE_URL:', process.env.DATABASE_URL);
console.log('📊 JWT_SECRET:', process.env.JWT_SECRET);
console.log('📊 SUPABASE_URL:', process.env.SUPABASE_URL);

// 测试数据库选择逻辑
const usePostgres = process.env.DATABASE_URL;
console.log('📊 usePostgres:', usePostgres);

if (usePostgres) {
  console.log('✅ 应该使用 PostgreSQL');
  const db = require('../database-postgres');
  console.log('✅ PostgreSQL 数据库模块加载成功');
} else {
  console.log('❌ 应该使用 SQLite');
  const db = require('../database');
  console.log('❌ SQLite 数据库模块加载成功');
}
