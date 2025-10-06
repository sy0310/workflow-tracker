-- ========================================
-- 一次性修复所有数据库问题
-- ========================================
-- 包含：触发器修复 + 权限修复
-- 执行时间：约 5-10 秒
-- ========================================

-- ==========================================
-- 第一部分：修复触发器（使用 CASCADE）
-- ==========================================

-- 1. 使用 CASCADE 删除旧的触发器函数
-- 这会自动删除所有依赖的触发器
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 2. 创建新的触发器函数（针对中文列名 "更新时间"）
CREATE OR REPLACE FUNCTION update_department_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."更新时间" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. 创建新的触发器函数（针对英文列名 updated_at）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 为部门表创建新的更新时间触发器
CREATE TRIGGER update_产业分析_updated_at 
    BEFORE UPDATE ON "产业分析"
    FOR EACH ROW 
    EXECUTE FUNCTION update_department_updated_at();

CREATE TRIGGER update_创意实践_updated_at 
    BEFORE UPDATE ON "创意实践"
    FOR EACH ROW 
    EXECUTE FUNCTION update_department_updated_at();

CREATE TRIGGER update_活动策划_updated_at 
    BEFORE UPDATE ON "活动策划"
    FOR EACH ROW 
    EXECUTE FUNCTION update_department_updated_at();

CREATE TRIGGER update_资源拓展_updated_at 
    BEFORE UPDATE ON "资源拓展"
    FOR EACH ROW 
    EXECUTE FUNCTION update_department_updated_at();

-- 5. 为英文表名的表重新创建触发器
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 第二部分：修复权限
-- ==========================================

-- 1. 禁用 RLS（适用于内部应用）
ALTER TABLE "产业分析" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "创意实践" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "活动策划" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "资源拓展" DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. 删除可能存在的限制性 RLS 策略
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

-- 3. 授予完全访问权限

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

-- ==========================================
-- 完成！
-- ==========================================
-- 所有问题已修复：
-- ✅ 触发器已更新（支持中文和英文列名）
-- ✅ RLS 已禁用
-- ✅ 权限已授予
-- ==========================================

