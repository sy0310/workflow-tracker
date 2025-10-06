-- 修复触发器问题（使用 CASCADE）
-- 问题：触发器函数使用 updated_at 字段，但表使用中文列名 "更新时间"

-- 方案：使用 CASCADE 删除现有触发器和函数，重新创建正确的版本

-- ===== 第一步：使用 CASCADE 删除旧的触发器函数 =====
-- 这会自动删除所有依赖的触发器
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ===== 第二步：创建新的触发器函数（针对中文列名）=====
CREATE OR REPLACE FUNCTION update_department_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."更新时间" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===== 第三步：创建新的触发器函数（针对英文列名）=====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===== 第四步：为部门表创建新的更新时间触发器 =====
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

-- ===== 第五步：为英文表名的表重新创建触发器 =====
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

-- ===== 完成 =====
-- 所有触发器已重新创建

