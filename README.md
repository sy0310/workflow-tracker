# 工作流记录系统

一个功能完整的工作流任务管理系统，支持人员管理、任务跟踪、微信提醒和AI助手对话功能。

## 功能特性

### 1. 详细任务记录
- ✅ 任务名称、描述
- ✅ 负责人、参与人管理
- ✅ 优先级设置（低/中/高/紧急）
- ✅ 时间管理（创建时间、开始时间、预计完成时间、实际完成时间）
- ✅ 任务状态跟踪（待开始/进行中/已完成/已取消）

### 2. 人员信息管理
- ✅ 头像上传和显示
- ✅ 基本信息（姓名、微信ID、微信昵称、邮箱、电话）
- ✅ 组织信息（部门、职位）
- ✅ 人员搜索和筛选

### 3. 微信提醒功能
- ✅ 两种提醒方式：
  - 直接提醒项目负责人
  - 提醒秘书处，由秘书处跟进
- ✅ 自动时间提醒：
  - 每日检查到期任务
  - 每小时检查即将到期任务
- ✅ 任务状态变更通知

### 4. AI助手对话
- ✅ 智能任务信息提取
- ✅ 自然语言任务创建
- ✅ 对话式交互界面
- ✅ 自动填表功能

## 技术栈

### 后端
- Node.js + Express.js
- SQLite 数据库
- 文件上传处理
- 定时任务调度
- WebSocket 实时通信

### 前端
- HTML5 + CSS3 + JavaScript
- Bootstrap 5 UI框架
- Font Awesome 图标
- 响应式设计

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化数据库
```bash
node -e "require('./database').initDatabase().then(() => console.log('数据库初始化完成'))"
```

### 3. 创建管理员账户
```bash
node scripts/create-admin.js
```

### 4. 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 访问应用
打开浏览器访问：http://localhost:3000

**默认管理员账户：**
- 用户名：admin
- 密码：admin123
- 邮箱：admin@workflow.com

⚠️ **重要：** 请在生产环境中修改默认密码！

## 配置说明

### 微信提醒配置
在 `services/notificationService.js` 中配置微信机器人webhook：
```javascript
const WECHAT_CONFIG = {
  webhook_url: process.env.WECHAT_WEBHOOK_URL || '', // 企业微信机器人webhook
  secretary_webhook_url: process.env.SECRETARY_WEBHOOK_URL || '' // 秘书处专用webhook
};
```

### 环境变量
创建 `.env` 文件：
```env
PORT=3000
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key
SECRETARY_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=secretary_key
```

## API 接口

### 人员管理
- `GET /api/staff` - 获取所有人员
- `POST /api/staff` - 创建人员
- `GET /api/staff/:id` - 获取单个人员
- `PUT /api/staff/:id` - 更新人员信息
- `DELETE /api/staff/:id` - 删除人员
- `GET /api/staff/search/:keyword` - 搜索人员

### 任务管理
- `GET /api/tasks` - 获取所有任务
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/:id` - 获取单个任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `GET /api/tasks/stats/overview` - 获取任务统计
- `GET /api/tasks/upcoming/deadlines` - 获取即将到期任务

### 提醒管理
- `GET /api/notifications` - 获取所有提醒
- `POST /api/notifications` - 创建提醒
- `PUT /api/notifications/:id/status` - 更新提醒状态
- `DELETE /api/notifications/:id` - 删除提醒
- `POST /api/notifications/batch` - 批量创建提醒

### AI助手
- `POST /api/ai/chat` - AI对话接口
- `POST /api/ai/create-task` - 基于AI信息创建任务
- `GET /api/ai/conversations/:id` - 获取对话历史
- `GET /api/ai/conversations/user/:user_id` - 获取用户对话列表

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `PUT /api/auth/password` - 修改密码
- `GET /api/auth/users` - 获取用户列表（管理员）
- `DELETE /api/auth/users/:id` - 删除用户（管理员）

## 使用说明

### 1. 添加人员
1. 点击"人员管理"标签
2. 点击"添加人员"按钮
3. 填写人员信息（姓名必填）
4. 上传头像（可选）
5. 保存

### 2. 用户注册和登录
1. 首次访问系统需要注册账户
2. 使用用户名和密码登录
3. 管理员可以管理所有用户和任务
4. 普通用户只能看到自己的任务

### 3. 创建任务
**方式一：传统表单**
1. 点击"任务管理"标签
2. 点击"创建任务"按钮
3. 填写任务信息
4. 选择负责人和参与人
5. 保存

**方式二：AI助手对话**
1. 点击"AI助手"标签
2. 描述任务信息，例如：
   ```
   创建一个网站开发任务，负责人是张三，参与人有李四和王五，优先级高，明天开始，一周后完成
   ```
3. AI会自动提取信息并建议创建任务
4. 确认后自动创建任务

### 4. 设置提醒
- 系统会自动检查任务截止日期
- 支持手动创建提醒
- 可配置提醒到秘书处或直接提醒负责人

## 定时任务

系统包含以下定时任务：
- 每日9:00检查到期任务
- 每小时检查即将到期任务（未来24小时内）
- 自动发送微信提醒

## 文件结构

```
├── package.json          # 项目配置
├── server.js            # 主服务器文件
├── database.js          # 数据库配置
├── routes/              # API路由
│   ├── staff.js         # 人员管理路由
│   ├── tasks.js         # 任务管理路由
│   ├── notifications.js # 提醒管理路由
│   └── ai.js           # AI助手路由
├── services/            # 服务层
│   └── notificationService.js # 提醒服务
├── public/              # 前端文件
│   ├── index.html      # 主页面
│   ├── styles.css      # 样式文件
│   └── app.js          # 前端脚本
└── uploads/            # 上传文件目录
    └── avatars/        # 头像文件
```

## 扩展功能

### 计划中的功能
- [x] 用户认证和权限管理
- [ ] 任务模板功能
- [ ] 更丰富的报表和统计
- [ ] 移动端适配
- [ ] 邮件提醒功能
- [ ] 任务依赖关系
- [ ] 文件附件管理
- [ ] 数据导入导出功能

### 自定义扩展
- 修改 `routes/` 目录下的文件添加新的API接口
- 在 `public/app.js` 中添加前端功能
- 在 `services/` 目录下创建新的服务模块

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查SQLite文件权限
   - 确保数据库文件路径正确

2. **文件上传失败**
   - 检查 `uploads/` 目录权限
   - 确认文件大小限制

3. **微信提醒不工作**
   - 检查webhook URL配置
   - 验证企业微信机器人权限

4. **端口占用**
   - 修改 `PORT` 环境变量
   - 或使用 `npm start -- --port 3001`

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License
