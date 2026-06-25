<template>
  <div class="user-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 + 表格 -->
    <el-card>
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">新增用户</el-button>
        <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
        <el-button type="success" @click="handleExport">📊 导出 Excel</el-button>
      </div>

      <el-table 
        :data="tableData" 
        border 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column v-if="canViewPassword" prop="password" label="密码" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'super' ? 'danger' : row.role === 'admin' ? 'warning' : ''">
              {{ row.role === 'super' ? '超级管理员' : row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:page-size="pageSize"
          v-model:current-page="pageNum"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="密码" v-if="!formData.id">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="super" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import { logOperation } from '@/utils/logger'

// ========== 用户角色 ==========
const userRole = ref(localStorage.getItem('userRole') || 'user')
const canViewPassword = computed(() => {
  return userRole.value === 'super' || userRole.value === 'admin'
})

// ========== 默认数据 ==========
const defaultUsers = [
  { id: 1, username: 'admin', password: '123456', email: 'admin@test.com', status: 1, role: 'super' },
  { id: 2, username: 'zhangsan', password: '123456', email: 'zhangsan@test.com', status: 1, role: 'admin' },
  { id: 3, username: 'lisi', password: '123456', email: 'lisi@test.com', status: 0, role: 'user' },
  { id: 4, username: 'wangwu', password: '123456', email: 'wangwu@test.com', status: 1, role: 'admin' },
  { id: 5, username: 'zhaoliu', password: '123456', email: 'zhaoliu@test.com', status: 1, role: 'user' },
]

// ========== localStorage 读写 ==========
const getUsers = () => {
  const stored = localStorage.getItem('users')
  if (stored) {
    const parsed = JSON.parse(stored)
    return parsed.map(u => ({ ...u, password: u.password || '123456' }))
  }
  return defaultUsers
}
const mockUsers = ref(getUsers())
const saveUsers = () => {
  localStorage.setItem('users', JSON.stringify(mockUsers.value))
}

// ========== 搜索 ==========
const searchForm = reactive({ username: '', status: '' })
const handleSearch = () => { pageNum.value = 1; fetchData() }
const resetSearch = () => { searchForm.username = ''; searchForm.status = ''; handleSearch() }

// ========== 表格 ==========
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const filtered = mockUsers.value.filter(item => {
      return item.username.includes(searchForm.username) &&
        (searchForm.status === '' || item.status === searchForm.status)
    })
    total.value = filtered.length
    const start = (pageNum.value - 1) * pageSize.value
    tableData.value = filtered.slice(start, start + pageSize.value)
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
}
fetchData()

// ========== 批量删除 ==========
const selectedIds = ref([])
const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(row => row.id)
}

const handleBatchDelete = () => {
  if (!selectedIds.value.length) return
  ElMessageBox.confirm('确定删除选中的用户吗？', '提示').then(() => {
    mockUsers.value = mockUsers.value.filter(item => !selectedIds.value.includes(item.id))
    selectedIds.value = []
    saveUsers()
    logOperation('批量删除用户', '用户管理', `删除 ${selectedIds.value.length} 个用户`)
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

// ========== 新增/编辑 ==========
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const formData = reactive({ id: null, username: '', password: '', email: '', role: 'user', status: 1 })

const handleAdd = () => {
  dialogTitle.value = '新增用户'
  formData.id = null
  formData.username = ''
  formData.password = ''
  formData.email = ''
  formData.role = 'user'
  formData.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  formData.id = row.id
  formData.username = row.username
  formData.password = ''
  formData.email = row.email
  formData.role = row.role
  formData.status = row.status
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!formData.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!formData.id && !formData.password) {
    ElMessage.warning('请输入密码')
    return
  }

  if (formData.id) {
    const index = mockUsers.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      const updateData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      mockUsers.value[index] = { ...mockUsers.value[index], ...updateData }
      logOperation('编辑用户', '用户管理', `用户名：${formData.username}`)
    }
  } else {
    const maxId = mockUsers.value.reduce((max, item) => Math.max(max, item.id), 0)
    mockUsers.value.push({
      id: maxId + 1,
      username: formData.username,
      password: formData.password,
      email: formData.email,
      role: formData.role,
      status: formData.status
    })
    logOperation('新增用户', '用户管理', `用户名：${formData.username}`)
  }
  saveUsers()
  ElMessage.success('保存成功')
  dialogVisible.value = false
  fetchData()
}

// ========== 删除 ==========
const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除吗？', '提示').then(() => {
    mockUsers.value = mockUsers.value.filter(item => item.id !== id)
    saveUsers()
    logOperation('删除用户', '用户管理', `用户ID：${id}`)
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

// ========== 导出 Excel ==========
const handleExport = () => {
  const data = mockUsers.value.map(item => ({
    'ID': item.id,
    '用户名': item.username,
    '密码': item.password,
    '邮箱': item.email,
    '角色': item.role === 'super' ? '超级管理员' : item.role === 'admin' ? '管理员' : '普通用户',
    '状态': item.status === 1 ? '启用' : '禁用'
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, '用户列表')
  XLSX.writeFile(wb, `用户列表_${new Date().toLocaleDateString()}.xlsx`)
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.user-page { display: flex; flex-direction: column; gap: 16px; }
.search-card { flex-shrink: 0; }
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>