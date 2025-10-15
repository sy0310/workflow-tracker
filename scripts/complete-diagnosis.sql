-- 完整的诊断脚本 - 检查活动策划表的详细状态

-- 1. 检查表是否存在
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = '活动策划') 
        THEN '✅ 表存在' 
        ELSE '❌ 表不存在' 
    END as 表状态;

-- 2. 如果表存在，显示所有列
SELECT 
    column_name as 列名, 
    data_type as 数据类型, 
    is_nullable as 可空,
    column_default as 默认值
FROM information_schema.columns 
WHERE table_name = '活动策划' 
ORDER BY ordinal_position;

-- 3. 检查表中的数据
SELECT 
    COUNT(*) as 总记录数,
    MIN(id) as 最小ID,
    MAX(id) as 最大ID
FROM "活动策划";

-- 4. 检查项目ID 19是否存在
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM "活动策划" WHERE id = 19)
        THEN '✅ 项目ID 19存在'
        ELSE '❌ 项目ID 19不存在'
    END as 项目状态;

-- 5. 如果项目存在，显示其详细信息
SELECT 
    id,
    项目名称,
    状态,
    负责人,
    创建时间
FROM "活动策划" 
WHERE id = 19;

-- 6. 测试一个简单的更新操作（不实际执行）
SELECT 
    '测试更新操作' as 操作,
    '如果上面的查询都成功，说明表结构正常' as 结果;
