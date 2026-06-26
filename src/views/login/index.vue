<template>
  <div class="login-container">
    <div class="login-card">
      <h1>后台管理系统</h1>
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <div style="display:flex; gap:10px;">
            <el-input v-model="form.captcha" placeholder="验证码" style="flex:1;" />
            <div 
              @click="generateCaptcha" 
              style="width:120px; height:40px; background:#f0f2f5; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:20px; letter-spacing:4px; font-weight:bold; border-radius:4px; user-select:none;"
            >
              {{ captchaText }}
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width:100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// ===== 先定义所有数据（顺序很重要）=====
const router = useRouter()
const form = reactive({ username: '', password: '', captcha: '' })
const loading = ref(false)
const captchaText = ref('')

// ===== 再定义函数 =====
const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
}

const handleLogin = () => {
  if (form.captcha.toUpperCase() !== captchaText.value.toUpperCase()) {
    ElMessage.error('验证码错误')
    generateCaptcha()
    form.captcha = ''
    return
  }

  loading.value = true
  const users = JSON.parse(localStorage.getItem('users') || '[]')

  setTimeout(() => {
    loading.value = false
    const user = users.find(u => u.username.toLowerCase() === form.username.toLowerCase())

    if (!user) {
      ElMessage.error('用户不存在')
    } else if (user.status !== 1) {
      ElMessage.error('账号已被禁用')
    } else if (user.password !== form.password) {
      ElMessage.error('密码错误')
    } else {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('userRole', user.role || 'user')
      ElMessage.success(`登录成功，欢迎 ${user.username}`)
      router.push('/dashboard')
    }
  }, 500)
}

onMounted(() => {
  generateCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.login-card h1 { text-align: center; margin-bottom: 30px; }
</style>