<template>
  <div class="layout">
    <div class="sidebar">
      <div class="logo">后台管理系统</div>
      <el-menu
        router
        :default-active="$route.path"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item v-if="userRole === 'super' || userRole === 'admin'" index="/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item v-if="userRole === 'super'" index="/role">
          <el-icon><Setting /></el-icon>
          <span>角色管理</span>
        </el-menu-item>
        <el-menu-item v-if="userRole === 'super' || userRole === 'admin'" index="/product">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <!-- 只有 super 能看日志 -->
        <el-sub-menu v-if="userRole === 'super'" index="/logs">
        <template #title>
        <el-icon><Document /></el-icon>
        <span>日志管理</span>
        </template>
        <el-menu-item index="/logs/operation">操作日志</el-menu-item>
        <el-menu-item index="/logs/login">登录日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <div class="main">
      <div class="header">
        <span>欢迎回来，当前角色：{{ roleLabel }}</span>
        <div class="header-right">
          <el-button type="primary" size="small" @click="goProfile">👤 个人中心</el-button>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </div>

      <!-- 面包屑 -->
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentPageName }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataBoard, User, Setting, Goods, Document } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const userRole = ref(localStorage.getItem('userRole') || 'user')

const roleLabel = computed(() => {
  const map = {
    super: '超级管理员',
    admin: '管理员',
    user: '普通用户'
  }
  return map[userRole.value] || '未知角色'
})

// 当前页面名称
const currentPageName = computed(() => {
  const map = {
    '/dashboard': '数据看板',
    '/user': '用户管理',
    '/role': '角色管理',
    '/product': '商品管理',
    '/profile': '个人中心'
  }
  return map[route.path] || route.path
})

const goProfile = () => {
  router.push('/profile')
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  ElMessage.success('已退出')
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; height: 100vh; }
.sidebar { width: 220px; background: #001529; color: white; display: flex; flex-direction: column; flex-shrink: 0; }
.logo { height: 64px; line-height: 64px; text-align: center; font-size: 18px; font-weight: bold; color: white; border-bottom: 1px solid #2d3a4b; }
.main { flex: 1; display: flex; flex-direction: column; background: #f0f2f5; }
.header {
  height: 60px;
  background: white;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex-shrink: 0;
}
.header-right { display: flex; gap: 12px; align-items: center; }
.breadcrumb {
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;
}
.content { flex: 1; padding: 20px; overflow: auto; }
</style>