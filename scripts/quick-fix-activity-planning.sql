-- 快速修复活动策划表的问题
-- 这个脚本专门针对活动策划表的500错误

-- 1. 首先检查表是否存在
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = '活动策划'
);

-- 2. 如果表不存在，创建它
CREATE TABLE IF NOT EXISTS "活动策划" (
  id SERIAL PRIMARY KEY,
  项目名称 VARCHAR(200) NOT NULL,
  项目描述 TEXT,
  负责人 VARCHAR(100),
  优先级 INTEGER DEFAULT 2,
  状态 INTEGER DEFAULT 1,
  开始时间 TIMESTAMP WITH TIME ZONE,
  预计完成时间 TIMESTAMP WITH TIME ZONE,
  实际完成时间 TIMESTAMP WITH TIME ZONE,
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  更新时间 TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  创建者 INTEGER,
  
  -- 部门特有字段
  活动类型 VARCHAR(100),
  目标受众 VARCHAR(100),
  活动规模 VARCHAR(100),
  预算范围 VARCHAR(100),
  活动地点 VARCHAR(200),
  活动时间 TIMESTAMP WITH TIME ZONE,
  活动流程 TEXT,
  宣传策略 TEXT,
  物料需求 TEXT,
  人员配置 TEXT
);

-- 3. 如果表存在但缺少更新时间列，添加它
ALTER TABLE "活动策划" 
ADD COLUMN IF NOT EXISTS "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 4. 创建触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_department_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."更新时间" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. 创建或重新创建触发器
DROP TRIGGER IF EXISTS update_活动策划_updated_at ON "活动策划";
CREATE TRIGGER update_活动策划_updated_at BEFORE UPDATE ON "活动策划"
    FOR EACH ROW EXECUTE FUNCTION update_department_updated_at_column();

-- 6. 更新现有记录的更新时间字段
UPDATE "活动策划" SET "更新时间" = CURRENT_TIMESTAMP WHERE "更新时间" IS NULL;

-- 7. 验证表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = '活动策划' 
ORDER BY ordinal_position;
