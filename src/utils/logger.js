// ===== 操作日志 =====
export const logOperation = (action, module, detail) => {
    const logs = JSON.parse(localStorage.getItem('operationLogs') || '[]')
    logs.unshift({
        id: Date.now(),
        user: localStorage.getItem('username') || 'admin',
        action: action,
        module: module,
        detail: detail || '',
        time: new Date().toLocaleString()
    })
    // 只保留最近 500 条
    if (logs.length > 500) {
        logs.length = 500
    }
    localStorage.setItem('operationLogs', JSON.stringify(logs))
}

// ===== 登录日志 =====
export const logLogin = (username, status, ip = '127.0.0.1') => {
    const logs = JSON.parse(localStorage.getItem('loginLogs') || '[]')
    logs.unshift({
        id: Date.now(),
        user: username,
        status: status, // 'success' / 'failed'
        ip: ip,
        time: new Date().toLocaleString()
    })
    if (logs.length > 500) {
        logs.length = 500
    }
    localStorage.setItem('loginLogs', JSON.stringify(logs))
}