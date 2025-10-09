-- 创建四个部门的项目表
-- 在 Supabase SQL Editor 中执行这些 SQL 语句

-- 1. 产业分析部门表
CREATE TABLE IF NOT EXISTS "产业分析" (
  id SERIAL PRIMARY KEY,
  项目名称 VARCHAR(200) NOT NULL,
  项目描述 TEXT,
  负责人 VARCHAR(100),
  优先级 INTEGER DEFAULT 2, -- 1:低, 2:中, 3:高, 4:紧急
  状态 INTEGER DEFAULT 1, -- 1:待开始, 2:进行中, 3:已完成, 4:已取消
  开始时间 TIMESTAMP WITH TIME ZONE,
  预计完成时间 TIMESTAMP WITH TIME ZONE,
  实际完成时间 TIMESTAMP WITH TIME ZONE,
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  创建者 INTEGER,
  
  -- 部门特有字段
  分析类型 VARCHAR(100),
  目标行业 VARCHAR(100),
  分析范围 TEXT,
  数据来源 TEXT,
  分析方法 TEXT,
  关键发现 TEXT,
  建议措施 TEXT,
  风险因素 TEXT
);

-- 2. 创意实践部门表
CREATE TABLE IF NOT EXISTS "创意实践" (
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
  创建者 INTEGER,
  
  -- 部门特有字段
  创意类型 VARCHAR(100),
  目标用户 VARCHAR(100),
  创意概念 TEXT,
  实施计划 TEXT,
  资源需求 TEXT,
  预期效果 TEXT,
  创新点 TEXT,
  可行性分析 TEXT
);

-- 3. 活动策划部门表
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

-- 4. 资源拓展部门表
CREATE TABLE IF NOT EXISTS "资源拓展" (
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
  创建者 INTEGER,
  
  -- 部门特有字段
  资源类型 VARCHAR(100),
  目标对象 VARCHAR(100),
  拓展方式 VARCHAR(100),
  资源价值 TEXT,
  获取难度 VARCHAR(100),
  预期收益 TEXT,
  风险评估 TEXT,
  拓展计划 TEXT,
  关键联系人 TEXT,
  跟进策略 TEXT
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_产业分析_状态 ON "产业分析"(状态);
CREATE INDEX IF NOT EXISTS idx_产业分析_优先级 ON "产业分析"(优先级);
CREATE INDEX IF NOT EXISTS idx_产业分析_创建时间 ON "产业分析"(创建时间 DESC);

CREATE INDEX IF NOT EXISTS idx_创意实践_状态 ON "创意实践"(状态);
CREATE INDEX IF NOT EXISTS idx_创意实践_优先级 ON "创意实践"(优先级);
CREATE INDEX IF NOT EXISTS idx_创意实践_创建时间 ON "创意实践"(创建时间 DESC);

CREATE INDEX IF NOT EXISTS idx_活动策划_状态 ON "活动策划"(状态);
CREATE INDEX IF NOT EXISTS idx_活动策划_优先级 ON "活动策划"(优先级);
CREATE INDEX IF NOT EXISTS idx_活动策划_创建时间 ON "活动策划"(创建时间 DESC);

CREATE INDEX IF NOT EXISTS idx_资源拓展_状态 ON "资源拓展"(状态);
CREATE INDEX IF NOT EXISTS idx_资源拓展_优先级 ON "资源拓展"(优先级);
CREATE INDEX IF NOT EXISTS idx_资源拓展_创建时间 ON "资源拓展"(创建时间 DESC);

-- 插入示例数据（可选）
INSERT INTO "产业分析" (项目名称, 项目描述, 负责人, 优先级, 状态, 分析类型, 目标行业) VALUES
('新能源汽车市场分析', '分析新能源汽车行业发展趋势和市场机会', '张三', 3, 1, '市场调研', '新能源汽车')
ON CONFLICT DO NOTHING;

INSERT INTO "创意实践" (项目名称, 项目描述, 负责人, 优先级, 状态, 创意类型, 目标用户) VALUES
('品牌视觉设计升级', '重新设计公司品牌视觉系统', '李四', 2, 1, '视觉设计', '企业客户')
ON CONFLICT DO NOTHING;

INSERT INTO "活动策划" (项目名称, 项目描述, 负责人, 优先级, 状态, 活动类型, 目标受众) VALUES
('年度客户答谢会', '策划年度客户答谢晚宴活动', '王五', 3, 2, '商务活动', 'VIP客户')
ON CONFLICT DO NOTHING;

INSERT INTO "资源拓展" (项目名称, 项目描述, 负责人, 优先级, 状态, 资源类型, 目标对象) VALUES
('战略合作伙伴拓展', '寻找行业内战略合作伙伴', '赵六', 2, 1, '合作伙伴', '行业龙头企业')
ON CONFLICT DO NOTHING;

