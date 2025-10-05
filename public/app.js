// 全局变量
let currentUserId = null;
let currentUser = null;
let currentConversationId = null;
let currentDepartment = null;

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
        
        // 设置部门选择事件
        setupDepartmentEvents();
        
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

// 设置部门选择事件
function setupDepartmentEvents() {
    // 部门选择器变化事件
    document.getElementById('project-department').addEventListener('change', function() {
        updateDepartmentSpecificFields(this.value);
    });
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

// 选择部门
function selectDepartment(departmentName) {
    // 更新当前部门
    currentDepartment = departmentName;
    
    // 更新部门卡片选中状态
    document.querySelectorAll('.department-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.department-card').classList.add('selected');
    
    // 加载该部门的项目
    loadDepartmentProjects(departmentName);
}

// 加载部门项目
async function loadDepartmentProjects(departmentName) {
    try {
        const response = await fetch(`/api/departments/${encodeURIComponent(departmentName)}/projects`, {
            headers: AuthManager.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('加载项目失败');
        }
        
        const projects = await response.json();
        displayDepartmentProjects(projects, departmentName);
    } catch (error) {
        console.error('加载部门项目失败:', error);
        showAlert('加载项目失败', 'danger');
    }
}

// 显示部门项目
function displayDepartmentProjects(projects, departmentName) {
    const container = document.getElementById('department-projects');
    
    let html = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3><i class="fas fa-building me-2"></i>${departmentName} 项目</h3>
            <button class="btn btn-primary" onclick="showCreateProjectModal('${departmentName}')">
                <i class="fas fa-plus me-1"></i>创建项目
            </button>
        </div>
    `;
    
    if (projects.length === 0) {
        html += `
            <div class="text-center text-muted py-5">
                <i class="fas fa-folder-open fa-3x mb-3"></i>
                <h5>暂无项目</h5>
                <p>点击"创建项目"按钮开始创建第一个项目</p>
            </div>
        `;
    } else {
        html += '<div class="row">';
        projects.forEach(project => {
            const priorityClass = getPriorityClass(project.优先级);
            const statusText = getStatusText(project.状态);
            
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card project-card ${priorityClass}">
                        <div class="card-body">
                            <h6 class="card-title">${project.项目名称}</h6>
                            <p class="card-text text-muted small">${project.项目描述 || '无描述'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-${getPriorityColor(project.优先级)}">${getPriorityText(project.优先级)}</span>
                                <span class="badge bg-${getStatusColor(project.状态)}">${statusText}</span>
                            </div>
                            <div class="mt-2">
                                <small class="text-muted">
                                    <i class="fas fa-user me-1"></i>${project.负责人 || '未分配'}
                                    <br><i class="fas fa-calendar me-1"></i>${formatDateTime(project.创建时间)}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// 显示创建项目模态框
function showCreateProjectModal(presetDepartment = null) {
    const modal = new bootstrap.Modal(document.getElementById('createProjectModal'));
    
    // 如果预设了部门，自动选择
    if (presetDepartment) {
        document.getElementById('project-department').value = presetDepartment;
        updateDepartmentSpecificFields(presetDepartment);
    }
    
    modal.show();
}

// 更新部门特有字段
function updateDepartmentSpecificFields(department) {
    const container = document.getElementById('department-specific-fields');
    
    if (!department) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<hr><h6 class="mb-3">部门特有信息</h6>';
    
    switch (department) {
        case '产业分析':
            html += `
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="analysis-type" class="form-label">分析类型</label>
                            <select class="form-select" id="analysis-type">
                                <option value="">请选择</option>
                                <option value="市场分析">市场分析</option>
                                <option value="竞品分析">竞品分析</option>
                                <option value="趋势分析">趋势分析</option>
                                <option value="用户分析">用户分析</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="target-industry" class="form-label">目标行业</label>
                            <input type="text" class="form-control" id="target-industry" placeholder="如：新能源汽车">
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="analysis-scope" class="form-label">分析范围</label>
                    <textarea class="form-control" id="analysis-scope" rows="2" placeholder="描述分析的具体范围和内容"></textarea>
                </div>
                <div class="mb-3">
                    <label for="data-sources" class="form-label">数据来源</label>
                    <input type="text" class="form-control" id="data-sources" placeholder="如：公开数据、调研报告、内部数据等">
                </div>
            `;
            break;
            
        case '创意实践':
            html += `
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="creative-type" class="form-label">创意类型</label>
                            <select class="form-select" id="creative-type">
                                <option value="">请选择</option>
                                <option value="产品创意">产品创意</option>
                                <option value="营销创意">营销创意</option>
                                <option value="服务创意">服务创意</option>
                                <option value="流程创意">流程创意</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="target-users" class="form-label">目标用户</label>
                            <input type="text" class="form-control" id="target-users" placeholder="如：企业客户、个人用户">
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="creative-concept" class="form-label">创意概念</label>
                    <textarea class="form-control" id="creative-concept" rows="2" placeholder="描述创意的核心概念和想法"></textarea>
                </div>
                <div class="mb-3">
                    <label for="implementation-plan" class="form-label">实施计划</label>
                    <textarea class="form-control" id="implementation-plan" rows="2" placeholder="描述具体的实施步骤和计划"></textarea>
                </div>
            `;
            break;
            
        case '活动策划':
            html += `
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="activity-type" class="form-label">活动类型</label>
                            <select class="form-select" id="activity-type">
                                <option value="">请选择</option>
                                <option value="线上活动">线上活动</option>
                                <option value="线下活动">线下活动</option>
                                <option value="混合活动">混合活动</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="target-audience" class="form-label">目标受众</label>
                            <input type="text" class="form-control" id="target-audience" placeholder="如：媒体和客户">
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="activity-scale" class="form-label">活动规模</label>
                            <select class="form-select" id="activity-scale">
                                <option value="">请选择</option>
                                <option value="小型">小型 (50人以下)</option>
                                <option value="中型">中型 (50-200人)</option>
                                <option value="大型">大型 (200人以上)</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="budget-range" class="form-label">预算范围</label>
                            <input type="text" class="form-control" id="budget-range" placeholder="如：10-50万">
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="activity-location" class="form-label">活动地点</label>
                    <input type="text" class="form-control" id="activity-location" placeholder="如：上海国际会议中心">
                </div>
            `;
            break;
            
        case '资源拓展':
            html += `
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="resource-type" class="form-label">资源类型</label>
                            <select class="form-select" id="resource-type">
                                <option value="">请选择</option>
                                <option value="人力资源">人力资源</option>
                                <option value="技术资源">技术资源</option>
                                <option value="资金资源">资金资源</option>
                                <option value="渠道资源">渠道资源</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="target-object" class="form-label">目标对象</label>
                            <input type="text" class="form-control" id="target-object" placeholder="如：AI技术公司">
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="expansion-method" class="form-label">拓展方式</label>
                    <select class="form-select" id="expansion-method">
                        <option value="">请选择</option>
                        <option value="合作">合作</option>
                        <option value="收购">收购</option>
                        <option value="联盟">联盟</option>
                        <option value="投资">投资</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="resource-value" class="form-label">资源价值</label>
                    <textarea class="form-control" id="resource-value" rows="2" placeholder="描述资源的潜在价值和重要性"></textarea>
                </div>
            `;
            break;
    }
    
    container.innerHTML = html;
}

// 创建项目
async function createProject() {
    try {
        const department = document.getElementById('project-department').value;
        const projectName = document.getElementById('project-name').value;
        const projectDescription = document.getElementById('project-description').value;
        
        if (!department || !projectName) {
            showAlert('请填写必填字段', 'danger');
            return;
        }
        
        // 构建项目数据
        const projectData = {
            项目名称: projectName,
            项目描述: projectDescription,
            负责人: document.getElementById('project-assignee').value,
            优先级: parseInt(document.getElementById('project-priority').value),
            开始时间: document.getElementById('project-start-time').value,
            预计完成时间: document.getElementById('project-end-time').value,
            创建者: currentUserId
        };
        
        // 添加部门特有字段
        switch (department) {
            case '产业分析':
                projectData.分析类型 = document.getElementById('analysis-type').value;
                projectData.目标行业 = document.getElementById('target-industry').value;
                projectData.分析范围 = document.getElementById('analysis-scope').value;
                projectData.数据来源 = document.getElementById('data-sources').value;
                break;
                
            case '创意实践':
                projectData.创意类型 = document.getElementById('creative-type').value;
                projectData.目标用户 = document.getElementById('target-users').value;
                projectData.创意概念 = document.getElementById('creative-concept').value;
                projectData.实施计划 = document.getElementById('implementation-plan').value;
                break;
                
            case '活动策划':
                projectData.活动类型 = document.getElementById('activity-type').value;
                projectData.目标受众 = document.getElementById('target-audience').value;
                projectData.活动规模 = document.getElementById('activity-scale').value;
                projectData.预算范围 = document.getElementById('budget-range').value;
                projectData.活动地点 = document.getElementById('activity-location').value;
                break;
                
            case '资源拓展':
                projectData.资源类型 = document.getElementById('resource-type').value;
                projectData.目标对象 = document.getElementById('target-object').value;
                projectData.拓展方式 = document.getElementById('expansion-method').value;
                projectData.资源价值 = document.getElementById('resource-value').value;
                break;
        }
        
        const response = await fetch(`/api/departments/${encodeURIComponent(department)}/projects`, {
            method: 'POST',
            headers: AuthManager.getAuthHeaders(),
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            showAlert('项目创建成功', 'success');
            bootstrap.Modal.getInstance(document.getElementById('createProjectModal')).hide();
            document.getElementById('createProjectForm').reset();
            
            // 如果当前选择了该部门，刷新项目列表
            if (currentDepartment === department) {
                await loadDepartmentProjects(department);
            }
        } else {
            const error = await response.json();
            showAlert(error.error || '创建项目失败', 'danger');
        }
    } catch (error) {
        console.error('创建项目失败:', error);
        showAlert('创建项目失败', 'danger');
    }
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
