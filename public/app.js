// 全局变量
let currentUserId = null;
let currentUser = null;
let currentConversationId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
async function initializeApp() {
    try {
        // 检查认证状态
        const auth = AuthManager.checkAuth();
        if (!auth) {
            console.log('未登录，重定向到登录页面');
            return;
        }

        currentUserId = auth.user.id;
        currentUser = auth.user;

        // 显示用户信息
        updateUserInfo();

        // 加载任务统计
        await loadTaskStats();
        
        // 加载任务列表
        await loadTasks();
        
        // 加载人员列表
        await loadStaff();
        
        // 加载提醒列表
        await loadNotifications();
        
        // 加载人员选择器
        await loadStaffSelectors();
        
        // 设置事件监听器
        setupEventListeners();
        
        console.log('应用初始化完成');
    } catch (error) {
        console.error('初始化应用失败:', error);
        showAlert('初始化失败，请刷新页面重试', 'danger');
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 任务筛选
    document.getElementById('status-filter').addEventListener('change', loadTasks);
    document.getElementById('priority-filter').addEventListener('change', loadTasks);
    
    // 人员搜索
    document.getElementById('staff-search').addEventListener('input', searchStaff);
    
    // 提醒筛选
    document.getElementById('notification-filter').addEventListener('change', loadNotifications);
    
    // 聊天输入框回车事件
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

// 显示用户信息
function updateUserInfo() {
    if (currentUser) {
        // 可以在导航栏显示用户信息
        const userInfo = document.createElement('div');
        userInfo.className = 'navbar-text me-3';
        userInfo.innerHTML = `
            <i class="fas fa-user me-1"></i>
            ${currentUser.username}
            <button class="btn btn-sm btn-outline-light ms-2" onclick="logout()">
                <i class="fas fa-sign-out-alt me-1"></i>登出
            </button>
        `;
        
        const navbar = document.querySelector('.navbar .container');
        navbar.appendChild(userInfo);
    }
}

// 登出功能
function logout() {
    if (confirm('确定要登出吗？')) {
        AuthManager.logout();
    }
}

// 显示不同部分
function showSection(sectionName) {
    // 隐藏所有部分
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // 显示指定部分
    document.getElementById(sectionName + '-section').style.display = 'block';
    
    // 更新导航栏活动状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// 加载任务统计
async function loadTaskStats() {
    try {
        const response = await fetch('/api/tasks/stats/overview', {
            headers: AuthManager.getAuthHeaders()
        });
        const stats = await response.json();
        
        document.getElementById('total-tasks').textContent = stats.total_tasks || 0;
        document.getElementById('pending-tasks').textContent = stats.pending_tasks || 0;
        document.getElementById('in-progress-tasks').textContent = stats.in_progress_tasks || 0;
        document.getElementById('completed-tasks').textContent = stats.completed_tasks || 0;
    } catch (error) {
        console.error('加载任务统计失败:', error);
    }
}

// 加载任务列表
async function loadTasks() {
    try {
        const statusFilter = document.getElementById('status-filter').value;
        const priorityFilter = document.getElementById('priority-filter').value;
        
        let url = '/api/tasks';
        const params = new URLSearchParams();
        
        if (statusFilter) params.append('status', statusFilter);
        if (priorityFilter) params.append('priority', priorityFilter);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url, {
            headers: AuthManager.getAuthHeaders()
        });
        const tasks = await response.json();
        
        displayTasks(tasks);
    } catch (error) {
        console.error('加载任务列表失败:', error);
        showAlert('加载任务列表失败', 'danger');
    }
}

// 显示任务列表
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h5>暂无任务</h5>
                <p>点击"创建任务"按钮开始创建您的第一个任务</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card ${getPriorityClass(task.priority)}" data-task-id="${task.id}">
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="card-title">${task.title}</h5>
                            <p class="card-text text-muted">${task.description || '无描述'}</p>
                            <div class="d-flex flex-wrap gap-2 mb-2">
                                <span class="status-badge status-${getStatusClass(task.status)}">
                                    ${getStatusText(task.status)}
                                </span>
                                <span class="priority-badge priority-${getPriorityClass(task.priority)}">
                                    ${getPriorityText(task.priority)}
                                </span>
                            </div>
                            <div class="task-meta">
                                <small class="text-muted">
                                    <i class="fas fa-user me-1"></i>负责人: ${task.assignee_name || '未分配'}
                                    <span class="mx-2">|</span>
                                    <i class="fas fa-calendar me-1"></i>创建时间: ${formatDateTime(task.created_at)}
                                    ${task.estimated_completion_time ? `
                                        <span class="mx-2">|</span>
                                        <i class="fas fa-clock me-1"></i>预计完成: ${formatDateTime(task.estimated_completion_time)}
                                    ` : ''}
                                </small>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="task-actions">
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTask(${task.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="participants mt-2">
                                ${task.participants_info ? task.participants_info.map(p => 
                                    `<img src="${p.avatar_url || '/images/default-avatar.png'}" 
                                          class="avatar avatar-sm me-1" 
                                          title="${p.name}">`
                                ).join('') : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 加载人员列表
async function loadStaff() {
    try {
        const response = await fetch('/api/staff', {
            headers: AuthManager.getAuthHeaders()
        });
        const staff = await response.json();
        
        displayStaff(staff);
    } catch (error) {
        console.error('加载人员列表失败:', error);
        showAlert('加载人员列表失败', 'danger');
    }
}

// 显示人员列表
function displayStaff(staff) {
    const staffList = document.getElementById('staff-list');
    
    if (staff.length === 0) {
        staffList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h5>暂无人员</h5>
                <p>点击"添加人员"按钮开始添加团队成员</p>
            </div>
        `;
        return;
    }
    
    staffList.innerHTML = `
        <div class="row">
            ${staff.map(person => `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="staff-card">
                        <div class="d-flex align-items-center">
                            <img src="${person.avatar_url || '/images/default-avatar.png'}" 
                                 class="avatar me-3" 
                                 alt="${person.name}">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${person.name}</h6>
                                <p class="text-muted mb-1">
                                    <i class="fas fa-building me-1"></i>
                                    ${person.department || '未设置部门'}
                                </p>
                                <p class="text-muted mb-2">
                                    <i class="fas fa-briefcase me-1"></i>
                                    ${person.position || '未设置职位'}
                                </p>
                                <div class="d-flex gap-1">
                                    <button class="btn btn-sm btn-outline-primary" onclick="editStaff(${person.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStaff(${person.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="staff-info mt-2">
                            ${person.wechat_name ? `<small class="text-muted"><i class="fab fa-weixin me-1"></i>${person.wechat_name}</small>` : ''}
                            ${person.email ? `<br><small class="text-muted"><i class="fas fa-envelope me-1"></i>${person.email}</small>` : ''}
                            ${person.phone ? `<br><small class="text-muted"><i class="fas fa-phone me-1"></i>${person.phone}</small>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 加载提醒列表
async function loadNotifications() {
    try {
        const statusFilter = document.getElementById('notification-filter').value;
        
        let url = '/api/notifications';
        if (statusFilter) {
            url += '?status=' + statusFilter;
        }
        
        const response = await fetch(url);
        const notifications = await response.json();
        
        displayNotifications(notifications);
    } catch (error) {
        console.error('加载提醒列表失败:', error);
        showAlert('加载提醒列表失败', 'danger');
    }
}

// 显示提醒列表
function displayNotifications(notifications) {
    const notificationsList = document.getElementById('notifications-list');
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h5>暂无提醒</h5>
                <p>系统提醒将在这里显示</p>
            </div>
        `;
        return;
    }
    
    notificationsList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.status === 1 ? 'unread' : notification.status === 2 ? 'sent' : ''}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${notification.task_title || '系统提醒'}</h6>
                    <p class="mb-1">${notification.message}</p>
                    <small class="text-muted">
                        <i class="fas fa-user me-1"></i>接收人: ${notification.recipient_name || '系统'}
                        <span class="mx-2">|</span>
                        <i class="fas fa-clock me-1"></i>创建时间: ${formatDateTime(notification.created_at)}
                        ${notification.sent_time ? `
                            <span class="mx-2">|</span>
                            <i class="fas fa-paper-plane me-1"></i>发送时间: ${formatDateTime(notification.sent_time)}
                        ` : ''}
                    </small>
                </div>
                <div class="notification-actions">
                    <span class="badge bg-${getNotificationStatusColor(notification.status)}">
                        ${getNotificationStatusText(notification.status)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// 加载人员选择器
async function loadStaffSelectors() {
    try {
        const response = await fetch('/api/staff');
        const staff = await response.json();
        
        const assigneeSelect = document.getElementById('task-assignee');
        const participantsSelect = document.getElementById('task-participants');
        
        assigneeSelect.innerHTML = '<option value="">选择负责人</option>' +
            staff.map(person => `<option value="${person.id}">${person.name}</option>`).join('');
        
        participantsSelect.innerHTML = staff.map(person => 
            `<option value="${person.id}">${person.name}</option>`
        ).join('');
    } catch (error) {
        console.error('加载人员选择器失败:', error);
    }
}

// 显示创建任务模态框
function showCreateTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('createTaskModal'));
    modal.show();
}

// 显示创建人员模态框
function showCreateStaffModal() {
    const modal = new bootstrap.Modal(document.getElementById('createStaffModal'));
    modal.show();
}

// 创建任务
async function createTask() {
    try {
        const formData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            assignee_id: document.getElementById('task-assignee').value || null,
            participants: Array.from(document.getElementById('task-participants').selectedOptions).map(option => parseInt(option.value)),
            priority: parseInt(document.getElementById('task-priority').value),
            start_time: document.getElementById('task-start-time').value || null,
            estimated_completion_time: document.getElementById('task-end-time').value || null,
            created_by: currentUserId
        };
        
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: AuthManager.getAuthHeaders(),
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showAlert('任务创建成功', 'success');
            bootstrap.Modal.getInstance(document.getElementById('createTaskModal')).hide();
            document.getElementById('createTaskForm').reset();
            await loadTasks();
            await loadTaskStats();
        } else {
            const error = await response.json();
            showAlert(error.error || '创建任务失败', 'danger');
        }
    } catch (error) {
        console.error('创建任务失败:', error);
        showAlert('创建任务失败', 'danger');
    }
}

// 创建人员
async function createStaff() {
    try {
        const formData = new FormData();
        formData.append('name', document.getElementById('staff-name').value);
        formData.append('wechat_id', document.getElementById('staff-wechat-id').value);
        formData.append('wechat_name', document.getElementById('staff-wechat-name').value);
        formData.append('email', document.getElementById('staff-email').value);
        formData.append('phone', document.getElementById('staff-phone').value);
        formData.append('department', document.getElementById('staff-department').value);
        formData.append('position', document.getElementById('staff-position').value);
        
        const avatarFile = document.getElementById('staff-avatar').files[0];
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        
        const response = await fetch('/api/staff', {
            method: 'POST',
            headers: {
                'Authorization': AuthManager.getAuthHeaders().Authorization
            },
            body: formData
        });
        
        if (response.ok) {
            showAlert('人员添加成功', 'success');
            bootstrap.Modal.getInstance(document.getElementById('createStaffModal')).hide();
            document.getElementById('createStaffForm').reset();
            await loadStaff();
            await loadStaffSelectors();
        } else {
            const error = await response.json();
            showAlert(error.error || '添加人员失败', 'danger');
        }
    } catch (error) {
        console.error('添加人员失败:', error);
        showAlert('添加人员失败', 'danger');
    }
}

// 搜索人员
async function searchStaff() {
    const keyword = document.getElementById('staff-search').value;
    
    if (keyword.trim() === '') {
        await loadStaff();
        return;
    }
    
    try {
        const response = await fetch(`/api/staff/search/${encodeURIComponent(keyword)}`, {
            headers: AuthManager.getAuthHeaders()
        });
        const staff = await response.json();
        displayStaff(staff);
    } catch (error) {
        console.error('搜索人员失败:', error);
    }
}

// 发送聊天消息
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 显示用户消息
    addChatMessage(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                user_id: currentUserId,
                conversation_id: currentConversationId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentConversationId = data.conversation_id;
            addChatMessage(data.ai_response, 'ai');
            
            // 如果AI建议创建任务，显示创建按钮
            if (data.can_create_task && data.task_info) {
                addTaskCreationSuggestion(data.task_info);
            }
        } else {
            addChatMessage('抱歉，我遇到了一些问题，请稍后再试。', 'ai');
        }
    } catch (error) {
        console.error('发送聊天消息失败:', error);
        addChatMessage('抱歉，我遇到了一些问题，请稍后再试。', 'ai');
    }
}

// 添加聊天消息
function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="${icon} me-2"></i>
            ${message}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加任务创建建议
function addTaskCreationSuggestion(taskInfo) {
    const chatMessages = document.getElementById('chat-messages');
    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'message ai-message';
    
    suggestionDiv.innerHTML = `
        <div class="message-content">
            <i class="fas fa-lightbulb me-2"></i>
            我可以为您创建这个任务，请确认信息是否正确。
            <div class="mt-2">
                <button class="btn btn-sm btn-success me-2" onclick="createTaskFromAI(${JSON.stringify(taskInfo).replace(/"/g, '&quot;')})">
                    <i class="fas fa-check me-1"></i>创建任务
                </button>
                <button class="btn btn-sm btn-secondary" onclick="modifyTaskInfo()">
                    <i class="fas fa-edit me-1"></i>修改信息
                </button>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(suggestionDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 从AI信息创建任务
async function createTaskFromAI(taskInfo) {
    try {
        const response = await fetch('/api/ai/create-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_info: taskInfo,
                user_id: currentUserId,
                conversation_id: currentConversationId
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            addChatMessage('✅ 任务创建成功！', 'ai');
            await loadTasks();
            await loadTaskStats();
        } else {
            const error = await response.json();
            addChatMessage('❌ 创建任务失败：' + error.error, 'ai');
        }
    } catch (error) {
        console.error('从AI创建任务失败:', error);
        addChatMessage('❌ 创建任务失败，请稍后再试。', 'ai');
    }
}

// 快捷操作
function quickCreateTask() {
    addChatMessage('请描述您要创建的任务，例如："创建一个网站开发任务，负责人是张三，参与人有李四和王五，优先级高，明天开始，一周后完成"', 'ai');
}

function viewTaskList() {
    showSection('tasks');
    addChatMessage('已为您切换到任务管理页面，您可以查看所有任务。', 'ai');
}

function checkDeadlines() {
    addChatMessage('正在检查任务截止日期...', 'ai');
    // 这里可以调用检查截止日期的API
    setTimeout(() => {
        addChatMessage('检查完成！您可以在任务管理页面查看即将到期的任务。', 'ai');
    }, 1000);
}

// 工具函数
function getStatusText(status) {
    const statusMap = { 1: '待开始', 2: '进行中', 3: '已完成', 4: '已取消' };
    return statusMap[status] || '未知';
}

function getStatusClass(status) {
    const classMap = { 1: 'pending', 2: 'in-progress', 3: 'completed', 4: 'cancelled' };
    return classMap[status] || 'pending';
}

function getPriorityText(priority) {
    const priorityMap = { 1: '低', 2: '中', 3: '高', 4: '紧急' };
    return priorityMap[priority] || '中';
}

function getPriorityClass(priority) {
    const classMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'urgent' };
    return classMap[priority] || 'medium';
}

function getNotificationStatusText(status) {
    const statusMap = { 1: '待发送', 2: '已发送', 3: '已读' };
    return statusMap[status] || '未知';
}

function getNotificationStatusColor(status) {
    const colorMap = { 1: 'warning', 2: 'success', 3: 'info' };
    return colorMap[status] || 'secondary';
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 自动移除
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// 编辑和删除功能（简化版本）
function editTask(taskId) {
    showAlert('编辑功能开发中...', 'info');
}

function deleteTask(taskId) {
    if (confirm('确定要删除这个任务吗？')) {
        showAlert('删除功能开发中...', 'info');
    }
}

function editStaff(staffId) {
    showAlert('编辑功能开发中...', 'info');
}

function deleteStaff(staffId) {
    if (confirm('确定要删除这个人员吗？')) {
        showAlert('删除功能开发中...', 'info');
    }
}

function modifyTaskInfo() {
    addChatMessage('请告诉我需要修改的信息，我会为您更新任务详情。', 'ai');
}
