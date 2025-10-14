// 认证相关功能
class AuthManager {
    constructor() {
        // 不再自动获取token和user，每次都需要重新登录
        this.token = null;
        this.user = null;
        this.init();
    }

    init() {
        // 绑定事件
        this.bindEvents();
        // 恢复记住的用户名
        this.restoreRememberedUsername();
    }

    bindEvents() {
        // 只在登录页面绑定事件
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        const regPasswordConfirm = document.getElementById('regPasswordConfirm');
        if (regPasswordConfirm) {
            regPasswordConfirm.addEventListener('input', () => {
                this.validatePasswordConfirm();
            });
        }
    }

    // 恢复记住的用户名
    restoreRememberedUsername() {
        const rememberedUsername = localStorage.getItem('remembered_username');
        if (rememberedUsername && document.getElementById('username')) {
            document.getElementById('username').value = rememberedUsername;
        }
    }

    // 保存用户名到本地存储
    saveRememberedUsername(username) {
        localStorage.setItem('remembered_username', username);
    }

    async login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showError('请输入用户名和密码');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 只保存用户名，不保存token和用户信息
                this.saveRememberedUsername(username);
                
                // 临时保存认证信息用于当前会话
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('token', this.token); // 兼容 AI 助手
                localStorage.setItem('user_info', JSON.stringify(this.user));

                this.showSuccess('登录成功，正在跳转...');
                setTimeout(() => {
                    this.redirectToMain();
                }, 1000);
            } else {
                this.showError(data.error || '登录失败');
            }
        } catch (error) {
            console.error('登录错误:', error);
            this.showError('网络错误，请稍后重试');
        }
    }

    async register() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;

        // 验证输入
        if (!username || !email || !password || !passwordConfirm) {
            this.showError('请填写所有必填字段');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('两次输入的密码不一致');
            return;
        }

        if (password.length < 6) {
            this.showError('密码长度至少6位');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 关闭注册模态框
                const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                if (registerModal) {
                    registerModal.hide();
                }

                // 显示成功消息
                this.showSuccess(data.message || '注册成功！请登录。');
                
                // 自动填充登录表单
                setTimeout(() => {
                    document.getElementById('username').value = username;
                    // 不自动填充密码，让用户手动输入更安全
                    document.getElementById('username').focus();
                }, 500);
            } else {
                this.showError(data.error || '注册失败');
            }
        } catch (error) {
            console.error('注册错误:', error);
            this.showError('网络错误，请稍后重试');
        }
    }

    validatePasswordConfirm() {
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;
        
        if (passwordConfirm && password !== passwordConfirm) {
            document.getElementById('regPasswordConfirm').setCustomValidity('密码不一致');
        } else {
            document.getElementById('regPasswordConfirm').setCustomValidity('');
        }
    }

    showRegisterForm() {
        const modal = new bootstrap.Modal(document.getElementById('registerModal'));
        modal.show();
    }

    redirectToMain() {
        window.location.href = '/';
    }

    showError(message) {
        const errorAlert = document.getElementById('errorAlert');
        const errorMessage = document.getElementById('errorMessage');
        const successAlert = document.getElementById('successAlert');

        successAlert.style.display = 'none';
        errorMessage.textContent = message;
        errorAlert.style.display = 'block';

        // 3秒后自动隐藏
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 3000);
    }

    showSuccess(message) {
        const successAlert = document.getElementById('successAlert');
        const successMessage = document.getElementById('successMessage');
        const errorAlert = document.getElementById('errorAlert');

        errorAlert.style.display = 'none';
        successMessage.textContent = message;
        successAlert.style.display = 'block';

        // 3秒后自动隐藏
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 3000);
    }

    // 静态方法：检查认证状态
    static checkAuth() {
        const token = localStorage.getItem('auth_token');
        const user = JSON.parse(localStorage.getItem('user_info') || 'null');
        
        if (!token || !user) {
            // 未登录，重定向到登录页面
            window.location.href = '/login.html';
            return false;
        }

        // 验证token是否过期
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < currentTime) {
                // Token已过期，清除存储的认证信息并重定向到登录页面
                localStorage.removeItem('auth_token');
                localStorage.removeItem('token');
                localStorage.removeItem('user_info');
                window.location.href = '/login.html';
                return false;
            }
        } catch (error) {
            // Token格式错误，清除存储的认证信息并重定向到登录页面
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user_info');
            window.location.href = '/login.html';
            return false;
        }
        
        return { token, user };
    }

    // 静态方法：登出
    static logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token'); // 兼容 AI 助手
        localStorage.removeItem('user_info');
        // 不删除记住的用户名，保留用户名记忆功能
        window.location.href = '/login.html';
    }

    // 静态方法：获取认证头
    static getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
}

// 全局函数，供HTML调用
function showRegisterForm() {
    authManager.showRegisterForm();
}

function register() {
    authManager.register();
}

// 初始化认证管理器
const authManager = new AuthManager();
