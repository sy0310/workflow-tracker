-- 为现有的部门表添加 "更新时间" 列
-- 如果您的部门表已经存在但没有 "更新时间" 列，请执行此 SQL

-- 为产业分析表添加更新时间列
ALTER TABLE "产业分析" 
ADD COLUMN IF NOT EXISTS "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 为创意实践表添加更新时间列
ALTER TABLE "创意实践" 
ADD COLUMN IF NOT EXISTS "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 为活动策划表添加更新时间列
ALTER TABLE "活动策划" 
ADD COLUMN IF NOT EXISTS "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 为资源拓展表添加更新时间列
ALTER TABLE "资源拓展" 
ADD COLUMN IF NOT EXISTS "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 创建触发器函数用于自动更新更新时间字段
CREATE OR REPLACE FUNCTION update_department_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."更新时间" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个部门表创建更新时间触发器（如果不存在）
DROP TRIGGER IF EXISTS update_产业分析_updated_at ON "产业分析";
CREATE TRIGGER update_产业分析_updated_at BEFORE UPDATE ON "产业分析"
    FOR EACH ROW EXECUTE FUNCTION update_department_updated_at_column();

DROP TRIGGER IF EXISTS update_创意实践_updated_at ON "创意实践";
CREATE TRIGGER update_创意实践_updated_at BEFORE UPDATE ON "创意实践"
    FOR EACH ROW EXECUTE FUNCTION update_department_updated_at_column();

DROP TRIGGER IF EXISTS update_活动策划_updated_at ON "活动策划";
CREATE TRIGGER update_活动策划_updated_at BEFORE UPDATE ON "活动策划"
    FOR EACH ROW EXECUTE FUNCTION update_department_updated_at_column();

DROP TRIGGER IF EXISTS update_资源拓展_updated_at ON "资源拓展";
CREATE TRIGGER update_资源拓展_updated_at BEFORE UPDATE ON "资源拓展"
    FOR EACH ROW EXECUTE FUNCTION update_department_updated_at_column();

-- 更新现有记录的更新时间字段
UPDATE "产业分析" SET "更新时间" = CURRENT_TIMESTAMP WHERE "更新时间" IS NULL;
UPDATE "创意实践" SET "更新时间" = CURRENT_TIMESTAMP WHERE "更新时间" IS NULL;
UPDATE "活动策划" SET "更新时间" = CURRENT_TIMESTAMP WHERE "更新时间" IS NULL;
UPDATE "资源拓展" SET "更新时间" = CURRENT_TIMESTAMP WHERE "更新时间" IS NULL;
