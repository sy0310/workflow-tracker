-- 检查并修复 Supabase 权限问题
-- 问题：前端可以读取数据（SELECT），但无法更新（UPDATE）
-- 可能原因：RLS 权限或表权限不足

-- ===== 第一步：检查当前权限 =====
-- 运行这个查询，看看哪些表启用了 RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('产业分析', '创意实践', '活动策划', '资源拓展', 'staff', 'tasks', 'users');

-- ===== 第二步：禁用 RLS（如果之前启用了）=====
-- 这将允许应用程序完全访问这些表
ALTER TABLE "产业分析" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "创意实践" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "活动策划" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "资源拓展" DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ===== 第三步：删除可能存在的限制性 RLS 策略 =====
-- 删除所有现有策略
DROP POLICY IF EXISTS "Allow public read access" ON "产业分析";
DROP POLICY IF EXISTS "Allow public write access" ON "产业分析";
DROP POLICY IF EXISTS "Allow authenticated users" ON "产业分析";

DROP POLICY IF EXISTS "Allow public read access" ON "创意实践";
DROP POLICY IF EXISTS "Allow public write access" ON "创意实践";
DROP POLICY IF EXISTS "Allow authenticated users" ON "创意实践";

DROP POLICY IF EXISTS "Allow public read access" ON "活动策划";
DROP POLICY IF EXISTS "Allow public write access" ON "活动策划";
DROP POLICY IF EXISTS "Allow authenticated users" ON "活动策划";

DROP POLICY IF EXISTS "Allow public read access" ON "资源拓展";
DROP POLICY IF EXISTS "Allow public write access" ON "资源拓展";
DROP POLICY IF EXISTS "Allow authenticated users" ON "资源拓展";

DROP POLICY IF EXISTS "Allow public read access" ON staff;
DROP POLICY IF EXISTS "Allow public write access" ON staff;
DROP POLICY IF EXISTS "Allow authenticated users" ON staff;

DROP POLICY IF EXISTS "Allow public read access" ON tasks;
DROP POLICY IF EXISTS "Allow public write access" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users" ON tasks;

-- ===== 第四步：授予必要的表权限 =====
-- 确保 anon 和 authenticated 角色有完全访问权限

-- 产业分析表
GRANT ALL ON "产业分析" TO anon;
GRANT ALL ON "产业分析" TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE "产业分析_id_seq" TO anon;
GRANT USAGE, SELECT ON SEQUENCE "产业分析_id_seq" TO authenticated;

-- 创意实践表
GRANT ALL ON "创意实践" TO anon;
GRANT ALL ON "创意实践" TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE "创意实践_id_seq" TO anon;
GRANT USAGE, SELECT ON SEQUENCE "创意实践_id_seq" TO authenticated;

-- 活动策划表
GRANT ALL ON "活动策划" TO anon;
GRANT ALL ON "活动策划" TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE "活动策划_id_seq" TO anon;
GRANT USAGE, SELECT ON SEQUENCE "活动策划_id_seq" TO authenticated;

-- 资源拓展表
GRANT ALL ON "资源拓展" TO anon;
GRANT ALL ON "资源拓展" TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE "资源拓展_id_seq" TO anon;
GRANT USAGE, SELECT ON SEQUENCE "资源拓展_id_seq" TO authenticated;

-- staff 表
GRANT ALL ON staff TO anon;
GRANT ALL ON staff TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE staff_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE staff_id_seq TO authenticated;

-- tasks 表
GRANT ALL ON tasks TO anon;
GRANT ALL ON tasks TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE tasks_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE tasks_id_seq TO authenticated;

-- users 表
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO authenticated;

-- notifications 表
GRANT ALL ON notifications TO anon;
GRANT ALL ON notifications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO authenticated;

-- user_sessions 表
GRANT ALL ON user_sessions TO anon;
GRANT ALL ON user_sessions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_sessions_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE user_sessions_id_seq TO authenticated;

-- ===== 第五步：确认权限设置 =====
-- 运行这个查询来验证权限
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name IN ('产业分析', '创意实践', '活动策划', '资源拓展', 'staff', 'tasks', 'users')
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

