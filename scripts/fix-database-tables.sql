-- 修复数据库表结构
-- 删除现有的空表（如果存在）
DROP TABLE IF EXISTS "产业分析" CASCADE;
DROP TABLE IF EXISTS "创意实践" CASCADE; 
DROP TABLE IF EXISTS "活动策划" CASCADE;
DROP TABLE IF EXISTS "资源拓展" CASCADE;
DROP TABLE IF EXISTS "staff" CASCADE;
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "user_sessions" CASCADE;

-- 创建 staff 表
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  wechat_id VARCHAR(50) UNIQUE,
  wechat_name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  department VARCHAR(100),
  position VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建四个部门表
-- 1. 产业分析表
CREATE TABLE "产业分析" (
  id SERIAL PRIMARY KEY,
  "项目名称" VARCHAR(200) NOT NULL,
  "项目描述" TEXT,
  "负责人" VARCHAR(100),
  "参与人员" TEXT,
  "优先级" INTEGER DEFAULT 2,
  "状态" INTEGER DEFAULT 1,
  "创建时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "开始时间" TIMESTAMP WITH TIME ZONE,
  "预计完成时间" TIMESTAMP WITH TIME ZONE,
  "实际完成时间" TIMESTAMP WITH TIME ZONE,
  "创建者" INTEGER,
  -- 产业分析特有字段
  "分析类型" VARCHAR(100),
  "目标行业" VARCHAR(100),
  "分析范围" TEXT,
  "数据来源" TEXT,
  "分析方法" TEXT,
  "关键发现" TEXT,
  "建议措施" TEXT,
  "风险因素" TEXT,
  -- 通用字段
  "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创意实践表
CREATE TABLE "创意实践" (
  id SERIAL PRIMARY KEY,
  "项目名称" VARCHAR(200) NOT NULL,
  "项目描述" TEXT,
  "负责人" VARCHAR(100),
  "参与人员" TEXT,
  "优先级" INTEGER DEFAULT 2,
  "状态" INTEGER DEFAULT 1,
  "创建时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "开始时间" TIMESTAMP WITH TIME ZONE,
  "预计完成时间" TIMESTAMP WITH TIME ZONE,
  "实际完成时间" TIMESTAMP WITH TIME ZONE,
  "创建者" INTEGER,
  -- 创意实践特有字段
  "创意类型" VARCHAR(100),
  "目标用户" VARCHAR(100),
  "创意概念" TEXT,
  "实施计划" TEXT,
  "资源需求" TEXT,
  "预期效果" TEXT,
  "创新点" TEXT,
  "可行性分析" TEXT,
  -- 通用字段
  "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 活动策划表
CREATE TABLE "活动策划" (
  id SERIAL PRIMARY KEY,
  "项目名称" VARCHAR(200) NOT NULL,
  "项目描述" TEXT,
  "负责人" VARCHAR(100),
  "参与人员" TEXT,
  "优先级" INTEGER DEFAULT 2,
  "状态" INTEGER DEFAULT 1,
  "创建时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "开始时间" TIMESTAMP WITH TIME ZONE,
  "预计完成时间" TIMESTAMP WITH TIME ZONE,
  "实际完成时间" TIMESTAMP WITH TIME ZONE,
  "创建者" INTEGER,
  -- 活动策划特有字段
  "活动类型" VARCHAR(100),
  "目标受众" VARCHAR(100),
  "活动规模" VARCHAR(50),
  "预算范围" VARCHAR(100),
  "活动地点" TEXT,
  "活动时间" TIMESTAMP WITH TIME ZONE,
  "活动流程" TEXT,
  "宣传策略" TEXT,
  "物料需求" TEXT,
  "人员配置" TEXT,
  -- 通用字段
  "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 资源拓展表
CREATE TABLE "资源拓展" (
  id SERIAL PRIMARY KEY,
  "项目名称" VARCHAR(200) NOT NULL,
  "项目描述" TEXT,
  "负责人" VARCHAR(100),
  "参与人员" TEXT,
  "优先级" INTEGER DEFAULT 2,
  "状态" INTEGER DEFAULT 1,
  "创建时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "开始时间" TIMESTAMP WITH TIME ZONE,
  "预计完成时间" TIMESTAMP WITH TIME ZONE,
  "实际完成时间" TIMESTAMP WITH TIME ZONE,
  "创建者" INTEGER,
  -- 资源拓展特有字段
  "资源类型" VARCHAR(100),
  "目标对象" VARCHAR(100),
  "拓展方式" VARCHAR(100),
  "资源价值" TEXT,
  "获取难度" VARCHAR(50),
  "预期收益" TEXT,
  "风险评估" TEXT,
  "拓展计划" TEXT,
  "关键联系人" TEXT,
  "跟进策略" TEXT,
  -- 通用字段
  "更新时间" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建其他必要的表
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assignee_id INTEGER,
  participants TEXT,
  priority INTEGER DEFAULT 2,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  start_time TIMESTAMP WITH TIME ZONE,
  estimated_completion_time TIMESTAMP WITH TIME ZONE,
  actual_completion_time TIMESTAMP WITH TIME ZONE,
  created_by INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  task_id INTEGER,
  recipient_id INTEGER,
  notification_type VARCHAR(20),
  message TEXT,
  status INTEGER DEFAULT 1,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  sent_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_staff_name ON staff(name);
CREATE INDEX idx_staff_wechat_id ON staff(wechat_id);
CREATE INDEX idx_staff_department ON staff(department);

-- 部门表索引
CREATE INDEX idx_产业分析_负责人 ON "产业分析"("负责人");
CREATE INDEX idx_产业分析_状态 ON "产业分析"("状态");
CREATE INDEX idx_产业分析_优先级 ON "产业分析"("优先级");

CREATE INDEX idx_创意实践_负责人 ON "创意实践"("负责人");
CREATE INDEX idx_创意实践_状态 ON "创意实践"("状态");
CREATE INDEX idx_创意实践_优先级 ON "创意实践"("优先级");

CREATE INDEX idx_活动策划_负责人 ON "活动策划"("负责人");
CREATE INDEX idx_活动策划_状态 ON "活动策划"("状态");
CREATE INDEX idx_活动策划_优先级 ON "活动策划"("优先级");

CREATE INDEX idx_资源拓展_负责人 ON "资源拓展"("负责人");
CREATE INDEX idx_资源拓展_状态 ON "资源拓展"("状态");
CREATE INDEX idx_资源拓展_优先级 ON "资源拓展"("优先级");

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表创建更新时间触发器
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为部门表创建更新时间触发器
CREATE TRIGGER update_产业分析_updated_at BEFORE UPDATE ON "产业分析"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_创意实践_updated_at BEFORE UPDATE ON "创意实践"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_活动策划_updated_at BEFORE UPDATE ON "活动策划"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_资源拓展_updated_at BEFORE UPDATE ON "资源拓展"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO staff (name, wechat_id, wechat_name, email, phone, department, position) VALUES 
('张三', 'zhangsan001', '张三', 'zhangsan@company.com', '13800138001', '产业分析', '高级分析师'),
('李四', 'lisi002', '李四', 'lisi@company.com', '13800138002', '创意实践', '创意总监'),
('王五', 'wangwu003', '王五', 'wangwu@company.com', '13800138003', '活动策划', '活动经理'),
('赵六', 'zhaoliu004', '赵六', 'zhaoliu@company.com', '13800138004', '资源拓展', '商务经理');

INSERT INTO "产业分析" ("项目名称", "项目描述", "负责人", "优先级", "分析类型", "目标行业") VALUES 
('2024年新能源汽车市场分析', '深度分析新能源汽车市场趋势、竞争格局和发展机会', '张三', 3, '市场分析', '新能源汽车');

INSERT INTO "创意实践" ("项目名称", "项目描述", "负责人", "优先级", "创意类型", "目标用户") VALUES 
('AI智能客服产品创意', '基于大语言模型的智能客服解决方案', '李四', 2, '产品创意', '企业客户');

INSERT INTO "活动策划" ("项目名称", "项目描述", "负责人", "优先级", "活动类型", "目标受众") VALUES 
('2024年产品发布会', '公司年度产品发布和品牌推广活动', '王五', 3, '线下活动', '媒体和客户');

INSERT INTO "资源拓展" ("项目名称", "项目描述", "负责人", "优先级", "资源类型", "目标对象") VALUES 
('技术合作伙伴拓展', '寻找AI技术领域的战略合作伙伴', '赵六', 2, '技术资源', 'AI技术公司');

-- 禁用 RLS 以确保应用可以正常访问
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE "产业分析" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "创意实践" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "活动策划" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "资源拓展" DISABLE ROW LEVEL SECURITY;
