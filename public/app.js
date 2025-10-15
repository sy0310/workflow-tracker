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
        
        // 加载人员选择器（用于各个表单）
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
    
    // 旧的 AI 聊天输入框事件监听已移除（现在使用 ai-assistant.js）
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
    // 检查认证状态
    const auth = AuthManager.checkAuth();
    if (!auth) {
        console.log('用户未登录，重定向到登录页面');
        window.location.href = '/login.html';
        return;
    }
    
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
    
    // 根据不同的部分加载相应数据
    if (sectionName === 'tasks') {
        loadTasks();
        loadTaskStats();
    } else if (sectionName === 'staff') {
        loadStaff();
    } else if (sectionName === 'notifications') {
        loadNotifications();
    }
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
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="card-title mb-0">${project.项目名称}</h6>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary btn-sm" onclick="editProject('${departmentName}', ${project.id})" title="编辑">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="deleteProject('${departmentName}', ${project.id}, '${project.项目名称}')" title="删除">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
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
async function showCreateProjectModal(presetDepartment = null) {
    // 加载员工列表到负责人下拉框
    await loadStaffToSelect('project-assignee');
    
    const modal = new bootstrap.Modal(document.getElementById('createProjectModal'));
    
    // 如果预设了部门，自动选择
    if (presetDepartment) {
        document.getElementById('project-department').value = presetDepartment;
        updateDepartmentSpecificFields(presetDepartment);
    }
    
    modal.show();
}

// 加载员工列表到下拉框
async function loadStaffToSelect(selectId) {
    try {
        const response = await fetch('/api/staff', {
            headers: AuthManager.getAuthHeaders()
        });
        
        if (!response.ok) {
            console.error('获取员工列表失败');
            return;
        }
        
        const staff = await response.json();
        const select = document.getElementById(selectId);
        
        // 清空现有选项（保留第一个"请选择"选项）
        select.innerHTML = '<option value="">选择负责人</option>';
        
        // 添加员工选项
        staff.forEach(person => {
            const option = document.createElement('option');
            option.value = person.name;
            option.textContent = `${person.name}${person.department ? ' - ' + person.department : ''}${person.position ? ' (' + person.position + ')' : ''}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('加载员工列表失败:', error);
    }
}

// 更新部门特有字段（使用配置文件）
function updateDepartmentSpecificFields(department) {
    const container = document.getElementById('department-specific-fields');
    
    if (!department || !DEPARTMENT_FIELDS[department]) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<hr><h6 class="mb-3">部门特有信息</h6>';
    html += generateTwoColumnFieldsHTML(DEPARTMENT_FIELDS[department], {}, '');
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
        
        // 添加部门特有字段（使用配置文件）
        const departmentFields = collectFieldData(department, '');
        Object.assign(projectData, departmentFields);
        
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

// 删除项目
async function deleteProject(departmentName, projectId, projectName) {
    if (!confirm(`确定要删除项目"${projectName}"吗？此操作不可恢复。`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/departments/${encodeURIComponent(departmentName)}/projects/${projectId}`, {
            method: 'DELETE',
            headers: AuthManager.getAuthHeaders()
        });
        
        if (response.ok) {
            showAlert('项目删除成功', 'success');
            // 刷新所有相关数据
            await Promise.all([
                loadDepartmentProjects(departmentName),  // 刷新部门项目列表
                loadTasks(),                             // 刷新任务列表
                loadTaskStats()                          // 刷新任务统计
            ]);
        } else {
            const error = await response.json();
            showAlert(error.error || '删除项目失败', 'danger');
        }
    } catch (error) {
        console.error('删除项目失败:', error);
        showAlert('删除项目失败', 'danger');
    }
}

// 编辑项目
async function editProject(departmentName, projectId) {
    try {
        // 加载员工列表到负责人下拉框
        await loadStaffToSelect('edit-project-assignee');
        
        // 获取项目信息
        const response = await fetch(`/api/departments/${encodeURIComponent(departmentName)}/projects`, {
            headers: AuthManager.getAuthHeaders()
        });
        
        if (!response.ok) {
            showAlert('获取项目列表失败', 'danger');
            return;
        }
        
        const projects = await response.json();
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
            showAlert('项目不存在', 'danger');
            return;
        }
        
        // 填充基础信息
        document.getElementById('edit-project-id').value = project.id;
        document.getElementById('edit-project-department').value = departmentName;
        document.getElementById('edit-project-name').value = project.项目名称 || '';
        document.getElementById('edit-project-description').value = project.项目描述 || '';
        document.getElementById('edit-project-priority').value = project.优先级 || 2;
        document.getElementById('edit-project-status').value = project.状态 || 1;
        
        // 设置负责人（在员工列表加载后）
        setTimeout(() => {
            document.getElementById('edit-project-assignee').value = project.负责人 || '';
        }, 100);
        
        // 处理时间字段
        if (project.开始时间) {
            document.getElementById('edit-project-start-time').value = formatDateTimeForInput(project.开始时间);
        }
        if (project.预计完成时间) {
            document.getElementById('edit-project-end-time').value = formatDateTimeForInput(project.预计完成时间);
        }
        
        // 生成部门特有字段
        updateEditDepartmentSpecificFields(departmentName, project);
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();
    } catch (error) {
        console.error('加载项目信息失败:', error);
        showAlert('加载项目信息失败', 'danger');
    }
}

// 更新编辑表单的部门特有字段（使用配置文件）
function updateEditDepartmentSpecificFields(department, project) {
    const container = document.getElementById('edit-department-specific-fields');
    
    if (!department || !DEPARTMENT_FIELDS[department]) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<hr><h6 class="mb-3">部门特有信息</h6>';
    html += generateTwoColumnFieldsHTML(DEPARTMENT_FIELDS[department], project, 'edit-');
    container.innerHTML = html;
}

// 更新项目
async function updateProject() {
    try {
        const projectId = document.getElementById('edit-project-id').value;
        const department = document.getElementById('edit-project-department').value;
        
        if (!department) {
            showAlert('部门信息丢失', 'danger');
            return;
        }
        
        // 构建项目数据
        const projectData = {
            项目名称: document.getElementById('edit-project-name').value,
            项目描述: document.getElementById('edit-project-description').value,
            负责人: document.getElementById('edit-project-assignee').value,
            优先级: parseInt(document.getElementById('edit-project-priority').value),
            状态: parseInt(document.getElementById('edit-project-status').value),
            开始时间: document.getElementById('edit-project-start-time').value,
            预计完成时间: document.getElementById('edit-project-end-time').value
        };
        
        // 数据验证
        console.log('=== 数据验证 ===');
        console.log('项目名称:', projectData.项目名称, '类型:', typeof projectData.项目名称);
        console.log('负责人:', projectData.负责人, '类型:', typeof projectData.负责人);
        console.log('优先级:', projectData.优先级, '类型:', typeof projectData.优先级, '是否NaN:', isNaN(projectData.优先级));
        console.log('状态:', projectData.状态, '类型:', typeof projectData.状态, '是否NaN:', isNaN(projectData.状态));
        console.log('开始时间:', projectData.开始时间, '类型:', typeof projectData.开始时间);
        console.log('预计完成时间:', projectData.预计完成时间, '类型:', typeof projectData.预计完成时间);
        
        // 清理无效数据
        if (isNaN(projectData.优先级)) {
            console.warn('优先级无效，使用默认值 2');
            projectData.优先级 = 2;
        }
        if (isNaN(projectData.状态)) {
            console.warn('状态无效，使用默认值 1');
            projectData.状态 = 1;
        }
        
        // 过滤空字符串
        Object.keys(projectData).forEach(key => {
            if (projectData[key] === '' || projectData[key] === null) {
                delete projectData[key];
                console.log(`移除空字段: ${key}`);
            }
        });
        
        // 添加部门特有字段（使用配置文件）
        const departmentFields = collectFieldData(department, 'edit-');
        Object.assign(projectData, departmentFields);
        
        // 调试信息
        console.log('=== 前端调试信息 ===');
        console.log('项目ID:', projectId);
        console.log('部门:', department);
        console.log('编码后的部门:', encodeURIComponent(department));
        console.log('基础项目数据:', {
            项目名称: projectData.项目名称,
            项目描述: projectData.项目描述,
            负责人: projectData.负责人,
            优先级: projectData.优先级,
            状态: projectData.状态,
            开始时间: projectData.开始时间,
            预计完成时间: projectData.预计完成时间
        });
        console.log('部门特有字段:', departmentFields);
        console.log('完整项目数据:', projectData);
        console.log('请求头:', AuthManager.getAuthHeaders());
        
        const url = `/api/departments/${encodeURIComponent(department)}/projects/${projectId}`;
        console.log('请求URL:', url);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: AuthManager.getAuthHeaders(),
            body: JSON.stringify(projectData)
        });
        
        console.log('响应状态:', response.status);
        console.log('响应头:', response.headers);
        
        if (response.ok) {
            showAlert('项目更新成功', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editProjectModal')).hide();
            document.getElementById('editProjectForm').reset();
            
            // 刷新所有相关数据
            if (currentDepartment === department) {
                await Promise.all([
                    loadDepartmentProjects(department),  // 刷新部门项目列表
                    loadTasks(),                         // 刷新任务列表
                    loadTaskStats()                      // 刷新任务统计
                ]);
            }
        } else {
            console.error('响应不成功，状态码:', response.status);
            let error;
            try {
                error = await response.json();
                console.error('错误响应内容:', error);
            } catch (e) {
                console.error('无法解析错误响应:', e);
                const errorText = await response.text();
                console.error('错误响应文本:', errorText);
                error = { error: '服务器响应格式错误', details: errorText };
            }
            showAlert(error.error || '更新项目失败', 'danger');
            console.error('完整错误信息:', error);
        }
    } catch (error) {
        console.error('更新项目失败 - 网络或其他错误:', error);
        showAlert('更新项目失败: ' + error.message, 'danger');
    }
}

// 辅助函数：格式化日期时间为 input[type="datetime-local"] 格式
function formatDateTimeForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 加载任务统计（统计四个部门的所有项目）
async function loadTaskStats() {
    try {
        const departments = ['产业分析', '创意实践', '活动策划', '资源拓展'];
        
        // 并行加载所有部门的项目
        const promises = departments.map(dept => 
            fetch(`/api/departments/${encodeURIComponent(dept)}/projects`, {
                headers: AuthManager.getAuthHeaders()
            })
            .then(res => res.json())
            .catch(err => {
                console.error(`加载${dept}项目统计失败:`, err);
                return [];
            })
        );
        
        const results = await Promise.all(promises);
        
        // 合并所有项目
        let allProjects = [];
        results.forEach(result => {
            if (Array.isArray(result)) {
                allProjects = allProjects.concat(result);
            }
        });
        
        // 统计
        const total = allProjects.length;
        const pending = allProjects.filter(p => p.状态 === 1).length;
        const inProgress = allProjects.filter(p => p.状态 === 2).length;
        const completed = allProjects.filter(p => p.状态 === 3).length;
        
        document.getElementById('total-tasks').textContent = total;
        document.getElementById('pending-tasks').textContent = pending;
        document.getElementById('in-progress-tasks').textContent = inProgress;
        document.getElementById('completed-tasks').textContent = completed;
    } catch (error) {
        console.error('加载任务统计失败:', error);
        // 出错时显示0
        document.getElementById('total-tasks').textContent = 0;
        document.getElementById('pending-tasks').textContent = 0;
        document.getElementById('in-progress-tasks').textContent = 0;
        document.getElementById('completed-tasks').textContent = 0;
    }
}

// 加载任务列表（综合看板：显示所有部门的项目）
async function loadTasks() {
    try {
        console.log('📋 开始加载任务列表...');
        
        const departmentFilter = document.getElementById('department-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const priorityFilter = document.getElementById('priority-filter').value;
        
        console.log('筛选条件:', { departmentFilter, statusFilter, priorityFilter });
        
        // 四个部门
        const departments = ['产业分析', '创意实践', '活动策划', '资源拓展'];
        
        // 确定要加载哪些部门的项目
        const depsToLoad = departmentFilter ? [departmentFilter] : departments;
        console.log('要加载的部门:', depsToLoad);
        
        // 检查认证状态
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('❌ 未找到认证token');
            throw new Error('请先登录');
        }
        console.log('✅ 认证token存在');
        
        // 并行加载所有部门的项目
        const promises = depsToLoad.map(dept => {
            const url = `/api/departments/${encodeURIComponent(dept)}/projects`;
            console.log(`🔍 请求 ${dept} 项目:`, url);
            
            return fetch(url, {
                headers: AuthManager.getAuthHeaders()
            })
            .then(res => {
                console.log(`📥 ${dept} 响应状态:`, res.status);
                if (!res.ok) {
                    console.warn(`${dept}项目加载失败: HTTP ${res.status}`);
                    return res.json().then(err => {
                        console.error(`${dept}错误详情:`, err);
                        return [];
                    }).catch(() => []);
                }
                return res.json();
            })
            .then(projects => {
                if (!Array.isArray(projects)) {
                    console.warn(`${dept}返回的数据不是数组:`, projects);
                    return [];
                }
                console.log(`✅ ${dept} 获取到 ${projects.length} 个项目`);
                return projects.map(p => ({
                    ...p,
                    department: dept, // 添加部门标识
                    // 统一字段名
                    title: p.项目名称,
                    description: p.项目描述,
                    assignee_name: p.负责人,
                    priority: p.优先级,
                    status: p.状态,
                    created_at: p.创建时间,
                    estimated_completion_time: p.预计完成时间,
                    actual_completion_time: p.实际完成时间
                }));
            })
            .catch(err => {
                console.error(`❌ 加载${dept}项目失败:`, err);
                return [];
            });
        });
        
        const results = await Promise.all(promises);
        console.log('📊 所有部门加载完成，结果:', results);
        
        // 合并所有项目
        let allTasks = [];
        results.forEach(result => {
            if (Array.isArray(result)) {
                allTasks = allTasks.concat(result);
            }
        });
        
        console.log(`📝 合并后共 ${allTasks.length} 个项目`);
        
        // 应用筛选
        let filteredTasks = allTasks;
        if (statusFilter) {
            filteredTasks = filteredTasks.filter(t => t.status == statusFilter);
        }
        if (priorityFilter) {
            filteredTasks = filteredTasks.filter(t => t.priority == priorityFilter);
        }
        
        // 按创建时间降序排序
        filteredTasks.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });
        
        console.log(`✅ 最终显示 ${filteredTasks.length} 个项目`);
        displayTasks(filteredTasks);
    } catch (error) {
        console.error('加载任务列表失败:', error);
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
        
        // 显示友好的错误消息
        const errorMsg = error.message || '加载项目列表失败，请刷新页面重试';
        showAlert(errorMsg, 'danger');
        
        // 显示空状态
        displayTasks([]);
    }
}

// 显示任务列表（综合看板：显示所有部门项目）
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h5>暂无项目</h5>
                <p>所有部门暂无项目</p>
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
                            <h5 class="card-title">
                                ${task.title}
                                <span class="badge bg-secondary ms-2">${task.department}</span>
                            </h5>
                            <p class="card-text text-muted">${task.description || '无描述'}</p>
                            <div class="d-flex flex-wrap gap-2 mb-2">
                                <span class="badge ${getStatusColor(task.status)}">
                                    ${getStatusText(task.status)}
                                </span>
                                <span class="badge ${getPriorityColor(task.priority)}">
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
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="editProject('${task.department}', ${task.id})">
                                    <i class="fas fa-edit"></i> 编辑
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${task.department}', ${task.id}, '${task.title}')">
                                    <i class="fas fa-trash"></i> 删除
                                </button>
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
        // 检查是否已登录
        const auth = AuthManager.checkAuth();
        if (!auth) {
            console.log('用户未登录，重定向到登录页面');
            window.location.href = '/login.html';
            return;
        }
        
        const response = await fetch('/api/staff', {
            headers: AuthManager.getAuthHeaders()
        });
        
        console.log('Staff API response status:', response.status);
        console.log('Staff API response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API请求失败: ${response.status} - ${errorText}`);
        }
        
        const staff = await response.json();
        console.log('Staff data received:', staff);
        console.log('Staff data type:', typeof staff);
        console.log('Is staff an array?', Array.isArray(staff));
        
        if (!Array.isArray(staff)) {
            console.error('Expected array but got:', typeof staff, staff);
            throw new Error('API返回的数据格式不正确');
        }
        
        displayStaff(staff);
    } catch (error) {
        console.error('加载人员列表失败:', error);
        showAlert('加载人员列表失败: ' + error.message, 'danger');
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
    // 此函数用于在表单中加载员工数据
    // 项目创建和编辑表单会调用 loadStaffToSelect
}

// 显示创建人员模态框
function showCreateStaffModal() {
    const modal = new bootstrap.Modal(document.getElementById('createStaffModal'));
    modal.show();
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

// 旧的 AI 助手函数已移除，现在使用浮动窗口版本（ai-assistant.js）

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

function getPriorityColor(priority) {
    const colorMap = { 1: 'secondary', 2: 'info', 3: 'warning', 4: 'danger' };
    return colorMap[priority] || 'info';
}

function getStatusColor(status) {
    const colorMap = { 1: 'secondary', 2: 'primary', 3: 'success', 4: 'dark' };
    return colorMap[status] || 'secondary';
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


async function editStaff(staffId) {
    try {
        // 获取员工信息
        const response = await fetch(`/api/staff/${staffId}`, {
            headers: AuthManager.getAuthHeaders()
        });
        
        if (!response.ok) {
            showAlert('获取员工信息失败', 'danger');
            return;
        }
        
        const staff = await response.json();
        
        // 填充表单
        document.getElementById('edit-staff-id').value = staff.id;
        document.getElementById('edit-staff-name').value = staff.name || '';
        document.getElementById('edit-staff-wechat-id').value = staff.wechat_id || '';
        document.getElementById('edit-staff-wechat-name').value = staff.wechat_name || '';
        document.getElementById('edit-staff-email').value = staff.email || '';
        document.getElementById('edit-staff-phone').value = staff.phone || '';
        document.getElementById('edit-staff-department').value = staff.department || '';
        document.getElementById('edit-staff-position').value = staff.position || '';
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('editStaffModal'));
        modal.show();
    } catch (error) {
        console.error('加载员工信息失败:', error);
        showAlert('加载员工信息失败', 'danger');
    }
}

async function updateStaff() {
    try {
        const staffId = document.getElementById('edit-staff-id').value;
        const formData = new FormData();
        
        formData.append('name', document.getElementById('edit-staff-name').value);
        formData.append('wechat_id', document.getElementById('edit-staff-wechat-id').value);
        formData.append('wechat_name', document.getElementById('edit-staff-wechat-name').value);
        formData.append('email', document.getElementById('edit-staff-email').value);
        formData.append('phone', document.getElementById('edit-staff-phone').value);
        formData.append('department', document.getElementById('edit-staff-department').value);
        formData.append('position', document.getElementById('edit-staff-position').value);
        
        // 处理头像
        const avatarFile = document.getElementById('edit-staff-avatar').files[0];
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        
        const response = await fetch(`/api/staff/${staffId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${AuthManager.getToken()}`
            },
            body: formData
        });
        
        if (response.ok) {
            showAlert('员工信息更新成功', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editStaffModal')).hide();
            document.getElementById('editStaffForm').reset();
            // 刷新所有相关数据
            await Promise.all([
                loadStaff(),                             // 刷新员工列表
                loadStaffSelectors(),                    // 刷新员工选择器
                loadTasks(),                             // 刷新任务列表（可能包含该员工的任务）
                loadTaskStats()                          // 刷新任务统计
            ]);
        } else {
            const error = await response.json();
            showAlert(error.error || '更新员工信息失败', 'danger');
        }
    } catch (error) {
        console.error('更新员工信息失败:', error);
        showAlert('更新员工信息失败', 'danger');
    }
}

async function deleteStaff(staffId) {
    // 先获取员工信息以显示名字
    try {
        const response = await fetch('/api/staff', {
            headers: AuthManager.getAuthHeaders()
        });
        const staff = await response.json();
        const person = staff.find(s => s.id === staffId);
        
        if (!person) {
            showAlert('未找到该员工', 'danger');
            return;
        }
        
        if (!confirm(`确定要删除员工"${person.name}"吗？此操作不可恢复。`)) {
            return;
        }
        
        // 执行删除
        const deleteResponse = await fetch(`/api/staff/${staffId}`, {
            method: 'DELETE',
            headers: AuthManager.getAuthHeaders()
        });
        
        if (deleteResponse.ok) {
            showAlert('员工删除成功', 'success');
            // 刷新所有相关数据
            await Promise.all([
                loadStaff(),                             // 刷新员工列表
                loadStaffSelectors(),                    // 刷新员工选择器
                loadTasks(),                             // 刷新任务列表（可能包含该员工的任务）
                loadTaskStats()                          // 刷新任务统计
            ]);
        } else {
            const error = await deleteResponse.json();
            showAlert(error.error || '删除员工失败', 'danger');
        }
    } catch (error) {
        console.error('删除员工失败:', error);
        showAlert('删除员工失败', 'danger');
    }
}

function modifyTaskInfo() {
    addChatMessage('请告诉我需要修改的信息，我会为您更新任务详情。', 'ai');
}
