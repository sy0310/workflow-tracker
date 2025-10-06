# 🤖 本地 AI 助手配置指南（3分钟）

## ⚠️ 重要提示

**本地开发需要配置 `.env` 文件。** 生产环境（Vercel）需要在 Vercel Dashboard 配置环境变量。

---

## 📝 本地配置步骤

### 步骤 1：创建 `.env` 文件

在项目根目录创建 `.env` 文件（如果还没有）：

**Windows PowerShell:**
```powershell
Copy-Item env.example .env
```

**Windows CMD:**
```cmd
copy env.example .env
```

**Linux/Mac:**
```bash
cp env.example .env
```

---

### 步骤 2：编辑 `.env` 文件

用文本编辑器打开 `.env` 文件，找到以下行：

```
# Groq AI 配置（免费 AI 助手）
GROQ_API_KEY=your_groq_api_key_here
```

替换为你的真实 API Key：

```
GROQ_API_KEY=[你的真实 API Key]
```

**注意：** 你的 API Key 格式应该是 `gsk_` 开头的长字符串。

---

### 步骤 3：测试 API 配置

运行测试脚本：

```bash
node scripts/test-ai-api.js
```

**预期输出：**
```
========================================
🧪 测试 Groq AI API
========================================

1️⃣ 检查环境变量:
✅ GROQ_API_KEY: gsk_zqCo36...

2️⃣ 测试 Groq API 调用:
发送测试消息: "你好，请简单介绍一下自己"

✅ API 调用成功!

AI 回复:
─────────────────────────────────────
你好！我是一个AI助手，可以帮助你解答问题和完成任务。
─────────────────────────────────────

✅ Groq AI API 工作正常！
========================================
```

---

### 步骤 4：启动服务器

```bash
npm start
```

---

### 步骤 5：测试 AI 助手

1. 打开浏览器：http://localhost:3000
2. 登录系统（admin / admin123）
3. 点击右下角的 **紫色机器人按钮** 🤖
4. 在聊天窗口输入：`创建一个任务`

---

## ✅ 功能检查清单

### 测试窗口收起功能：
- [ ] 点击机器人按钮，窗口展开
- [ ] 再次点击机器人按钮，窗口收起
- [ ] 点击窗口标题栏，窗口收起/展开
- [ ] 刷新页面，窗口默认收起

### 测试 AI 对话：
- [ ] 输入"创建一个任务"，AI 回复正常
- [ ] AI 逐步引导补充信息
- [ ] 信息完整后显示确认界面
- [ ] 点击"确认创建"，任务成功创建

---

## 🔧 故障排查

### 问题 1: `GROQ_API_KEY 未配置`

**原因：** `.env` 文件不存在或未正确配置

**解决方案：**
1. 确认 `.env` 文件在项目根目录
2. 确认 `GROQ_API_KEY` 行存在且格式正确
3. 确认 API Key 以 `gsk_` 开头
4. 重启服务器（`npm start`）

---

### 问题 2: AI 窗口无法收起

**原因：** JavaScript 未正确加载或有冲突

**解决方案：**
1. 按 F12 打开浏览器控制台
2. 查看是否有错误信息
3. 清除浏览器缓存（Ctrl + Shift + R）
4. 检查控制台日志：
   - ✅ AI 聊天窗口已初始化（收起状态）
   - ✅ AI 聊天窗口已展开
   - ✅ AI 聊天窗口已收起

---

### 问题 3: AI 无法回复

**原因：** API 调用失败

**解决方案：**

#### 步骤 1：检查控制台
按 F12 查看浏览器控制台，寻找错误信息：

```
❌ Groq API 错误 (401): Invalid API Key
❌ Groq API 错误 (429): Too Many Requests
❌ Network error
```

#### 步骤 2：检查服务器日志
查看终端中的服务器日志：

```
❌ GROQ_API_KEY 未配置
🤖 调用 Groq API...
API Key 前缀: gsk_zqCo36...
✅ Groq API 调用成功
```

#### 步骤 3：测试 API
```bash
node scripts/test-ai-api.js
```

#### 步骤 4：常见错误

**401 Unauthorized:**
- API Key 无效或已过期
- 访问 https://console.groq.com 重新生成

**429 Too Many Requests:**
- 超过免费配额（30次/分钟）
- 等待 1 分钟后重试

**Network Error:**
- 网络连接问题
- 检查防火墙设置

---

### 问题 4: 窗口显示异常

**解决方案：**
1. 检查 CSS 是否正确加载
2. 检查浏览器缩放比例（应为 100%）
3. 尝试其他浏览器（Chrome、Edge、Firefox）

---

## 📊 配置检查清单

### 本地开发环境：
- [ ] `.env` 文件已创建
- [ ] `GROQ_API_KEY` 已配置
- [ ] `JWT_SECRET` 已配置
- [ ] `DATABASE_URL` 已配置
- [ ] 运行 `node scripts/test-ai-api.js` 测试通过

### Vercel 生产环境：
- [ ] 在 Vercel Dashboard 添加 `GROQ_API_KEY`
- [ ] 在 Vercel Dashboard 添加 `JWT_SECRET`
- [ ] 在 Vercel Dashboard 添加 `DATABASE_URL`
- [ ] 重新部署 Vercel 项目
- [ ] 访问 Vercel URL 测试 AI 助手

---

## 🎯 完整配置示例

### `.env` 文件内容：

```env
# 服务器配置
PORT=3000

# JWT 密钥
JWT_SECRET=your-secret-key

# PostgreSQL 直连配置
DATABASE_URL=postgresql://postgres.npbudtzlkdbnyjdkusfd:1qazXDR%@aws-1-us-east-2.pooler.supabase.com:6543/postgres

# Groq AI 配置
GROQ_API_KEY=[你的真实 API Key]
```

**提示：** 其他配置项（DATABASE_URL 等）见 `env.example` 文件。

**注意：** `.env` 文件已被 `.gitignore` 忽略，不会提交到 Git。

---

## 🚀 快速启动

```bash
# 1. 创建 .env 文件
copy env.example .env

# 2. 编辑 .env，添加 API Key
# 用编辑器打开 .env，修改 GROQ_API_KEY

# 3. 测试 API
node scripts/test-ai-api.js

# 4. 启动服务器
npm start

# 5. 打开浏览器测试
# http://localhost:3000
```

---

## 💡 提示

- **本地开发** 使用 `.env` 文件
- **Vercel 部署** 使用环境变量配置
- 两者配置项相同，但配置位置不同
- `.env` 文件不会上传到 GitHub（安全）

---

## 📞 需要帮助？

如果还是无法工作，请提供：
1. 浏览器控制台截图
2. 服务器终端日志
3. `node scripts/test-ai-api.js` 的输出

我会帮你快速解决！🎉

