<template>
  <div class="profile-page">
    <el-card>
      <h2>个人中心</h2>
      <el-form :model="form" label-width="100px" style="max-width:400px;">
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-input :value="roleLabel" disabled />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const currentUser = ref(localStorage.getItem('username') || 'admin')
const currentRole = ref(localStorage.getItem('userRole') || 'user')

const roleLabel = computed(() => {
  const map = {
    super: '超级管理员',
    admin: '管理员',
    user: '普通用户'
  }
  return map[currentRole.value] || '未知角色'
})

const form = reactive({
  username: currentUser.value,
  newPassword: '',
  confirmPassword: ''
})

const handleSave = () => {
  if (!form.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (form.newPassword.length < 6) {
    ElMessage.warning('密码至少6位')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  // 更新 localStorage 中的用户密码
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const index = users.findIndex(u => u.username === currentUser.value)
  if (index !== -1) {
    users[index].password = form.newPassword
    localStorage.setItem('users', JSON.stringify(users))
    ElMessage.success('密码修改成功，请重新登录')
    // 退出登录
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  }
}
</script>

<style scoped>
.profile-page { padding: 20px; }
</style>