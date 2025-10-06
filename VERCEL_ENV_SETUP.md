# ⚡ Vercel 环境变量快速配置

## 🎯 立即配置（3分钟完成）

### 步骤 1：访问 Vercel 项目设置

1. 打开：https://vercel.com/dashboard
2. 点击项目：`workflow-tracker`
3. 点击顶部 **"Settings"** 标签
4. 左侧菜单选择 **"Environment Variables"**

---

### 步骤 2：添加 Groq API Key

点击 **"Add New"** 按钮，添加：

```
Name:  GROQ_API_KEY
Value: [你的 Groq API Key]
```

**注意：** 请使用你从 Groq Console 获取的真实 API Key（格式：`gsk_...`）。

**Environment:** 全选（Production + Preview + Development）

点击 **"Save"**

---

### 步骤 3：确认其他必需变量

检查以下变量是否已存在，如果没有，请添加：

#### JWT_SECRET
```
Name:  JWT_SECRET
Value: your-secret-key
```

#### DATABASE_URL
```
Name:  DATABASE_URL
Value: [见 env.example 文件]
```

**提示：** 完整的连接字符串在 `env.example` 文件中。

---

### 步骤 4：重新部署

添加完环境变量后：

1. 点击顶部 **"Deployments"** 标签
2. 点击最新部署右侧的 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 确认重新部署

**或者等待 2-3 分钟，Vercel 会自动检测 GitHub 推送并部署新代码。**

---

### 步骤 5：测试 AI 助手

部署完成后（约 2-3 分钟）：

1. 访问你的 Vercel URL
2. 登录系统（admin / admin123）
3. 点击右下角的 **紫色机器人图标** 🤖
4. 在聊天窗口输入：`创建一个任务`
5. 查看 AI 回复

---

## ✅ 完成！

AI 助手现在应该可以正常工作了！

### 🎨 界面预览

右下角会显示一个渐变色的圆形浮动按钮（紫色），点击后展开聊天窗口。

### 💬 试试这些命令

- `创建一个任务`
- `帮我创建一个新能源汽车市场分析任务，负责人张三，优先级高`
- `下周五前完成的活动策划任务`

---

## 🔧 如果 AI 无法回复

### 检查清单：

1. **检查 Vercel 日志**
   - 点击 "Functions" 标签
   - 查看最新的函数调用日志
   - 查找错误信息

2. **检查环境变量**
   - Settings → Environment Variables
   - 确认 `GROQ_API_KEY` 存在且正确

3. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 和 Network 标签
   - 查找错误信息

4. **重新部署**
   - 有时需要重新部署才能生效
   - Deployments → 点击最新部署 → Redeploy

---

## 📞 需要帮助？

如果遇到问题，请提供：
- Vercel 函数日志截图
- 浏览器控制台错误信息
- 具体操作步骤

我会帮你快速解决！🚀

