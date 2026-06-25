import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// ===== 初始化默认用户数据 =====
const initUsers = () => {
    const defaultUsers = [
        { id: 1, username: 'admin', password: '123456', email: 'admin@test.com', status: 1, role: 'super' },
        { id: 2, username: 'zhangsan', password: '123456', email: 'zhangsan@test.com', status: 1, role: 'admin' },
        { id: 3, username: 'lisi', password: '123456', email: 'lisi@test.com', status: 0, role: 'user' },
        { id: 4, username: 'wangwu', password: '123456', email: 'wangwu@test.com', status: 1, role: 'admin' },
        { id: 5, username: 'zhaoliu', password: '123456', email: 'zhaoliu@test.com', status: 1, role: 'user' },
    ]

    const stored = localStorage.getItem('users')
    if (!stored) {
        localStorage.setItem('users', JSON.stringify(defaultUsers))
    } else {
        try {
            const parsed = JSON.parse(stored)
            if (parsed.length < 5) {
                localStorage.setItem('users', JSON.stringify(defaultUsers))
            }
        } catch {
            localStorage.setItem('users', JSON.stringify(defaultUsers))
        }
    }
}
initUsers()

// 在 initUsers() 后面添加
const initLogs = () => {
    if (!localStorage.getItem('operationLogs')) {
        localStorage.setItem('operationLogs', JSON.stringify([
            { id: 1, user: 'admin', action: '登录系统', module: '系统', detail: 'IP: 127.0.0.1', time: new Date().toLocaleString() },
            { id: 2, user: 'admin', action: '新增用户', module: '用户管理', detail: '用户名：zhangsan', time: new Date().toLocaleString() },
        ]))
    }
    if (!localStorage.getItem('loginLogs')) {
        localStorage.setItem('loginLogs', JSON.stringify([
            { id: 1, user: 'admin', status: 'success', ip: '127.0.0.1', time: new Date().toLocaleString() },
        ]))
    }
}
initLogs()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')