import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layouts/index.vue'
import Login from '../views/login/index.vue'
import Dashboard from '../views/dashboard/index.vue'
import User from '../views/user/index.vue'
import Role from '../views/role/index.vue'
import Product from '../views/product/index.vue'
import Profile from '../views/profile/index.vue'
import OperationLog from '../views/logs/operation.vue'
import LoginLog from '../views/logs/login.vue'

// 在 children 中添加


const routes = [
    { path: '/login', component: Login },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'user', component: User, meta: { roles: ['admin', 'super'] } },
            { path: 'role', component: Role, meta: { roles: ['super'] } },
            { path: 'product', component: Product, meta: { roles: ['admin', 'super'] } },
            { path: 'profile', component: Profile },
            { path: 'logs/operation', component: OperationLog, meta: { roles: ['super'] } },
            { path: 'logs/login', component: LoginLog, meta: { roles: ['super'] } },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from) => {
    const token = localStorage.getItem('token')
    if (to.path !== '/login' && !token) {
        return '/login'
    } else if (to.path === '/login' && token) {
        return '/dashboard'
    }
})

export default router