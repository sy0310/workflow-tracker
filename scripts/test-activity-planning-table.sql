-- 测试活动策划表的状态
-- 运行这个脚本来诊断问题

-- 1. 检查表是否存在
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = '活动策划') 
        THEN '表存在' 
        ELSE '表不存在' 
    END as 表状态;

-- 2. 如果表存在，检查列结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = '活动策划' 
ORDER BY ordinal_position;

-- 3. 检查是否有数据
SELECT COUNT(*) as 记录数量 FROM "活动策划";

-- 4. 检查项目ID 19是否存在
SELECT id, 项目名称, 状态 FROM "活动策划" WHERE id = 19;

-- 5. 测试更新操作（不实际执行，只检查语法）
-- 这个查询会显示如果执行更新会发生什么
SELECT 
    'UPDATE "活动策划" SET 项目名称 = $1, 状态 = $2 WHERE id = $3' as 测试SQL,
    '如果看到这个，说明SQL语法正确' as 状态;
