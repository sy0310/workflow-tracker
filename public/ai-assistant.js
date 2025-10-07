/**
 * AI 助手前端逻辑
 */

class AIAssistant {
    constructor() {
        this.conversationId = null;
        this.messages = [];
        this.isProcessing = false;
    }

    /**
     * 初始化 AI 助手
     */
    init() {
        this.bindEvents();
        this.addWelcomeMessage();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const sendBtn = document.getElementById('aiSendBtn');
        const input = document.getElementById('aiMessageInput');
        const clearBtn = document.getElementById('aiClearBtn');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearConversation());
        }
    }

    /**
     * 添加欢迎消息
     */
    addWelcomeMessage() {
        const welcomeMsg = `👋 你好！我是 AI 任务助手。

我可以帮你：
✅ 智能创建任务
✅ 自动识别部门
✅ 补充必要信息
✅ 生成完整任务

试试对我说：
"帮我创建一个新能源汽车市场分析任务，负责人张三，优先级高"

或者简单地说：
"创建一个任务"

我会逐步引导你完成！😊`;

        this.addMessage(welcomeMsg, 'ai');
    }

    /**
     * 发送消息
     */
    async sendMessage() {
        const input = document.getElementById('aiMessageInput');
        const message = input.value.trim();

        if (!message || this.isProcessing) {
            return;
        }

        // 添加用户消息到界面
        this.addMessage(message, 'user');
        input.value = '';
        this.isProcessing = true;

        // 显示加载状态
        this.showTypingIndicator();

        try {
            // 尝试从两个可能的位置获取 token
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            
            if (!token) {
                this.removeTypingIndicator();
                this.addMessage('请先登录后再使用 AI 助手。', 'ai', true);
                throw new Error('未登录，请先登录');
            }
            
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: this.conversationId
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('AI API 错误响应:', errorText);
                throw new Error(`AI 响应失败 (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ AI 响应成功:', data);
            
            // 保存对话 ID
            if (!this.conversationId) {
                this.conversationId = data.conversationId;
            }

            // 移除加载指示器
            this.removeTypingIndicator();

            // 添加 AI 回复
            this.addMessage(data.response, 'ai');

            // 如果包含完整任务数据，显示确认按钮
            if (data.hasTaskData) {
                this.showTaskConfirmation(data.taskData);
            }

        } catch (error) {
            console.error('发送消息失败:', error);
            this.removeTypingIndicator();
            this.addMessage('抱歉，出现了一些问题。请稍后再试。', 'ai', true);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 添加消息到聊天界面
     */
    addMessage(text, type = 'ai', isError = false) {
        const container = document.getElementById('aiChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${type}`;
        
        if (isError) {
            messageDiv.classList.add('ai-message-error');
        }

        // 处理换行和格式
        const formattedText = this.formatMessage(text);
        
        messageDiv.innerHTML = `
            <div class="ai-message-content">
                ${formattedText}
            </div>
            <div class="ai-message-time">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;

        this.messages.push({ text, type, time: new Date() });
    }

    /**
     * 格式化消息（支持 Markdown 基础语法）
     */
    formatMessage(text) {
        // 移除 JSON 代码块（已经处理过了）
        text = text.replace(/```json[\s\S]*?```/g, '');

        // 转义 HTML
        text = text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');

        // 处理换行
        text = text.replace(/\n/g, '<br>');

        // 处理加粗 **text**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 处理列表 - xxx
        text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/s, '<ul class="ai-list">$1</ul>');

        // 处理复选框 ✅
        text = text.replace(/✅/g, '<span class="ai-icon">✅</span>');
        text = text.replace(/❌/g, '<span class="ai-icon">❌</span>');
        text = text.replace(/👋/g, '<span class="ai-icon">👋</span>');
        text = text.replace(/😊/g, '<span class="ai-icon">😊</span>');

        return text;
    }

    /**
     * 显示"正在输入"指示器
     */
    showTypingIndicator() {
        const container = document.getElementById('aiChatMessages');
        const indicator = document.createElement('div');
        indicator.className = 'ai-typing-indicator';
        indicator.id = 'aiTypingIndicator';
        indicator.innerHTML = `
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * 移除"正在输入"指示器
     */
    removeTypingIndicator() {
        const indicator = document.getElementById('aiTypingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * 显示任务确认界面
     */
    showTaskConfirmation(taskData) {
        const container = document.getElementById('aiChatMessages');
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'ai-task-confirmation';

        // 格式化任务数据为表格
        let taskHTML = '<table class="table table-sm table-bordered">';
        for (const [key, value] of Object.entries(taskData)) {
            taskHTML += `
                <tr>
                    <td class="fw-bold" style="width: 30%">${key}</td>
                    <td>${value || '-'}</td>
                </tr>
            `;
        }
        taskHTML += '</table>';

        confirmDiv.innerHTML = `
            <div class="card border-success">
                <div class="card-header bg-success text-white">
                    <i class="bi bi-check-circle"></i> 任务信息已完成
                </div>
                <div class="card-body">
                    ${taskHTML}
                    <div class="d-flex gap-2 mt-3">
                        <button class="btn btn-success flex-fill" onclick="aiAssistant.createTask(${JSON.stringify(taskData).replace(/"/g, '&quot;')})">
                            <i class="bi bi-check-lg"></i> 确认创建
                        </button>
                        <button class="btn btn-outline-secondary" onclick="aiAssistant.rejectTask()">
                            <i class="bi bi-x-lg"></i> 重新填写
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(confirmDiv);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * 创建任务
     */
    async createTask(taskData) {
        try {
            // 尝试从两个可能的位置获取 token
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            
            if (!token) {
                this.addMessage('请先登录后再创建任务。', 'ai', true);
                throw new Error('未登录，请先登录');
            }
            
            const response = await fetch('/api/ai/create-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ taskData })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ 创建任务失败:', response.status, errorData);
                throw new Error(errorData.error || `创建任务失败 (${response.status})`);
            }

            const result = await response.json();
            console.log('✅ 任务创建成功:', result);

            // 显示成功消息
            this.addMessage(`✅ 太好了！任务已成功创建！

📋 任务名称：${taskData.任务名称}
👤 负责人：${taskData.负责人}
⏰ 截止时间：${taskData.预计完成时间 || '未设置'}

你可以在任务管理页面查看详情。

还需要创建其他任务吗？`, 'ai');

            // 刷新任务列表（如果在任务页面）
            if (typeof loadTasks === 'function') {
                loadTasks();
            }

        } catch (error) {
            console.error('创建任务失败:', error);
            this.addMessage('抱歉，创建任务时出现错误。请手动创建或稍后重试。', 'ai', true);
        }
    }

    /**
     * 拒绝任务（重新填写）
     */
    rejectTask() {
        this.addMessage('好的，让我们重新开始。请告诉我你想创建什么任务？', 'ai');
    }

    /**
     * 清除对话
     */
    async clearConversation() {
        if (!confirm('确定要清除对话记录吗？')) {
            return;
        }

        // 清除界面
        const container = document.getElementById('aiChatMessages');
        container.innerHTML = '';

        // 清除本地数据
        this.messages = [];
        this.conversationId = null;

        // 重新显示欢迎消息
        this.addWelcomeMessage();

        // 调用后端清除（如果有 conversationId）
        if (this.conversationId) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`/api/ai/conversation/${this.conversationId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('清除对话失败:', error);
            }
        }
    }
}

// 全局实例
let aiAssistant;

// 页面加载时初始化（确保只初始化一次）
document.addEventListener('DOMContentLoaded', () => {
    // 只在有 AI 聊天界面的页面初始化，且确保只初始化一次
    if (document.getElementById('aiChatMessages') && !aiAssistant) {
        aiAssistant = new AIAssistant();
        aiAssistant.init();
        console.log('✅ AI 助手已初始化');
    }
});
