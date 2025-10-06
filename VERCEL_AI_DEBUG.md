# 🔍 Vercel AI 助手故障排查

## 问题：Vercel 部署后 AI 助手无法工作

---

## ✅ 立即检查清单

### 步骤 1：确认环境变量已添加

**访问 Vercel Dashboard：**
```
https://vercel.com/dashboard
→ 选择 workflow-tracker 项目
→ Settings
→ Environment Variables
```

**必须确认以下变量存在：**

| 变量名 | 值 | Environment |
|--------|-----|------------|
| `GROQ_API_KEY` | `[你的 Groq API Key]` | ✅ All |
| `JWT_SECRET` | `your-secret-key` | ✅ All |
| `DATABASE_URL` | `[见 env.example]` | ✅ All |

**注意：** GROQ_API_KEY 的值是你从 Groq Console 获取的 API Key（格式：`gsk_...`）

**重要提示：**
- Environment 必须选择 **Production + Preview + Development** 全部
- 保存后必须重新部署才能生效

---

### 步骤 2：查看 Vercel 函数日志

**1. 在 Vercel Dashboard：**
```
workflow-tracker 项目
→ 点击顶部 "Functions" 或 "Logs" 标签
→ 查看最新的函数调用日志
```

**2. 查找 AI 相关的日志：**
- 寻找包含 `/api/ai/chat` 的请求
- 查看错误信息

**常见错误：**

#### ❌ `GROQ_API_KEY 未配置`
**原因：** 环境变量没有添加或名称错误

**解决方案：**
1. 检查变量名是否完全一致：`GROQ_API_KEY`（注意大小写）
2. 检查是否选择了 Production 环境
3. 重新部署项目

#### ❌ `Invalid API Key (401)`
**原因：** API Key 不正确或已过期

**解决方案：**
1. 确认复制的 Key 完整且正确
2. 访问 https://console.groq.com/keys 检查 Key 状态
3. 如需要，创建新的 Key 并更新

#### ❌ `Model decommissioned (400)`
**原因：** 使用了旧版本代码

**解决方案：**
1. 确认 GitHub 最新代码已包含 Llama 3.3 模型
2. 在 Vercel 中触发重新部署
3. 清除浏览器缓存

---

### 步骤 3：浏览器端检查

**1. 打开 Vercel 部署的 URL**

**2. 按 F12 打开开发者工具**

**3. 切换到 Console 标签**
- 查找红色错误信息
- 查找与 AI 相关的日志

**4. 切换到 Network 标签**
- 点击 AI 助手发送消息
- 查找 `/api/ai/chat` 请求
- 点击该请求查看详情：
  - **Request Headers** - 检查 Authorization
  - **Response** - 查看错误信息
  - **Status Code** - 记录状态码

**常见状态码：**

| 状态码 | 含义 | 解决方案 |
|--------|------|---------|
| 401 | 认证失败 | 检查登录状态，重新登录 |
| 500 | 服务器错误 | 查看 Vercel 函数日志 |
| 400 | 请求错误 | 检查是否使用了旧模型 |

---

## 🛠️ 详细排查步骤

### 方法 1：使用 Vercel CLI 查看实时日志

**1. 安装 Vercel CLI（如果没有）：**
```bash
npm i -g vercel
```

**2. 登录 Vercel：**
```bash
vercel login
```

**3. 查看实时日志：**
```bash
vercel logs
```

**4. 测试 AI 助手，观察日志输出**

---

### 方法 2：创建测试 API 端点

我已经创建了一个测试端点，访问以下 URL：

```
https://your-vercel-url.vercel.app/api/ai/test
```

**预期响应：**
```json
{
  "status": "ok",
  "groq_api_key_configured": true,
  "api_key_prefix": "gsk_gsOkkU...",
  "model": "llama-3.3-70b-versatile"
}
```

**如果返回：**
```json
{
  "status": "error",
  "groq_api_key_configured": false,
  "message": "GROQ_API_KEY 未配置"
}
```

**说明环境变量没有正确配置。**

---

### 方法 3：检查 Vercel 部署状态

**1. 访问部署详情：**
```
Vercel Dashboard
→ workflow-tracker
→ Deployments
→ 点击最新的部署
```

**2. 检查以下信息：**
- ✅ Status: Ready
- ✅ Build Logs: 无错误
- ✅ Functions: 已部署
- ✅ Environment: Production

**3. 查看 Build Logs：**
- 搜索 "error" 或 "fail"
- 查看是否有编译错误

---

## 🔧 常见问题解决方案

### 问题 1：环境变量未生效

**症状：**
- Vercel 日志显示 `GROQ_API_KEY 未配置`
- 但在 Settings 中已添加

**解决方案：**

**1. 检查变量作用域：**
- 确保 Environment 选择了 **Production**
- 确保变量没有拼写错误

**2. 强制重新部署：**
```
Deployments → 最新部署 → ... → Redeploy
```

**3. 清除构建缓存：**
在重新部署时，勾选 "Clear cache and redeploy"

---

### 问题 2：API 调用超时

**症状：**
- AI 长时间无响应
- Network 请求一直 pending

**可能原因：**
1. Groq API 响应慢
2. Vercel 函数超时（10秒）

**解决方案：**
- 检查网络连接
- 稍后重试
- 检查 Groq API 状态：https://status.groq.com

---

### 问题 3：CORS 错误

**症状：**
- Console 显示 CORS 相关错误
- Network 请求被阻止

**解决方案：**
检查 `server.js` 中的 CORS 配置（应该已经正确配置）

---

## 📋 完整检查清单

请逐项检查并告诉我结果：

### Vercel 配置：
- [ ] `GROQ_API_KEY` 已添加到环境变量
- [ ] Environment 选择了 Production
- [ ] API Key 值正确（以 `gsk_` 开头）
- [ ] 已保存环境变量
- [ ] 已重新部署（在添加环境变量之后）

### 部署状态：
- [ ] 最新部署状态为 "Ready"
- [ ] Build Logs 无错误
- [ ] Functions 已成功部署

### 浏览器测试：
- [ ] 能访问 Vercel URL
- [ ] 能成功登录
- [ ] 能看到 AI 助手按钮
- [ ] 点击按钮能展开窗口
- [ ] 发送消息后查看 Network 标签

### 日志检查：
- [ ] Vercel Functions 日志中有 AI 请求记录
- [ ] 查看具体错误信息

---

## 🆘 需要你提供的信息

为了帮你精准定位问题，请提供：

### 1. Vercel 环境变量截图
**访问：**
```
Settings → Environment Variables
```
**截图显示：**
- 变量名列表（遮住值）
- Environment 选择状态

### 2. Vercel 函数日志
**访问：**
```
Functions 或 Logs 标签
```
**复制最新的错误日志**

### 3. 浏览器 Network 信息
**操作：**
1. F12 → Network 标签
2. 点击 AI 助手发送消息
3. 找到 `/api/ai/chat` 请求
4. 复制 Response 内容

### 4. 浏览器 Console 错误
**操作：**
1. F12 → Console 标签
2. 复制所有红色错误信息

---

## 💡 快速诊断

**现在请执行以下操作：**

### 步骤 1：确认环境变量
访问 Vercel Settings → Environment Variables，确认 `GROQ_API_KEY` 存在。

### 步骤 2：访问你的 Vercel URL
在浏览器中打开你的 Vercel 应用。

### 步骤 3：打开浏览器控制台（F12）

### 步骤 4：点击 AI 助手按钮

### 步骤 5：发送一条消息

### 步骤 6：查看 Network 标签
找到 `/api/ai/chat` 请求，告诉我：
- **Status Code:** (例如：200, 401, 500)
- **Response:** (错误信息)

---

**完成上述检查后，告诉我：**
1. Vercel 环境变量是否已正确添加？
2. 浏览器 Console 有什么错误？
3. Network 请求的状态码和响应是什么？

我会根据你的反馈提供针对性的解决方案！🔧

