const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(80));
console.log('🔧 修复数据库触发器');
console.log('='.repeat(80));

console.log('\n📋 问题说明:');
console.log('触发器函数使用 "updated_at" 字段，但部门表使用中文列名 "更新时间"');
console.log('导致更新项目时报错: record "new" has no field "updated_at"');

console.log('\n✅ 解决方案:');
console.log('1. 删除所有现有触发器');
console.log('2. 创建两个触发器函数：');
console.log('   - update_department_updated_at() 用于部门表（使用 "更新时间"）');
console.log('   - update_updated_at_column() 用于其他表（使用 updated_at）');
console.log('3. 为所有表重新创建触发器');

console.log('\n📝 执行步骤:');
console.log('1. 登录到 Supabase: https://supabase.com/dashboard');
console.log('2. 选择你的项目: npbudtzlkdbnyjdkusfd');
console.log('3. 点击左侧菜单的 "SQL Editor"');
console.log('4. 点击 "New Query" 创建新查询');
console.log('5. 复制下面的 SQL 代码');
console.log('6. 粘贴到 SQL Editor 中');
console.log('7. 点击 "Run" 按钮执行');

console.log('\n' + '='.repeat(80));
console.log('📄 SQL 代码（复制下面所有内容）:');
console.log('='.repeat(80));
console.log('');

const sqlPath = path.join(__dirname, 'fix-triggers.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');
console.log(sqlContent);

console.log('');
console.log('='.repeat(80));
console.log('✅ 复制上面的 SQL 代码并在 Supabase SQL Editor 中执行');
console.log('='.repeat(80));

console.log('\n⚠️  注意事项:');
console.log('1. 这个操作会删除并重新创建触发器，不会影响数据');
console.log('2. 执行后请等待几秒，确保 Vercel 重新部署');
console.log('3. 然后再次测试更新功能');

console.log('\n🧪 测试命令:');
console.log('执行完 SQL 后，运行: node scripts/test-update-project.js');
console.log('');

