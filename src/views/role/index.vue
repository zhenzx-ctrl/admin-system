<template>
  <div class="role-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" />
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
        <el-button type="primary" @click="handleAdd">新增角色</el-button>
        <el-button type="success" @click="handleExport">📊 导出 Excel</el-button>
      </div>

      <el-table 
        :data="tableData" 
        border 
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="primary" @click="handlePermission(row)">分配权限</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
        <el-form-item label="角色名称">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-dialog v-model="permDialogVisible" title="分配权限" width="500px">
      <el-tree
        ref="treeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        default-expand-all
        :props="defaultProps"
      />
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import { logOperation } from '@/utils/logger'

// ========== 模拟数据 ==========
const defaultRoles = [
  { id: 1, name: '超级管理员', description: '拥有所有权限' },
  { id: 2, name: '管理员', description: '管理用户和内容' },
  { id: 3, name: '运营人员', description: '看数据、导报表' },
  { id: 4, name: '普通员工', description: '只读权限' },
]

const mockRoles = ref(
  JSON.parse(localStorage.getItem('roles') || JSON.stringify(defaultRoles))
)

const saveRoles = () => {
  localStorage.setItem('roles', JSON.stringify(mockRoles.value))
}

// ========== 权限树数据 ==========
const menuTree = [
  {
    id: 1,
    label: '数据看板',
    children: [
      { id: 11, label: '查看数据' }
    ]
  },
  {
    id: 2,
    label: '用户管理',
    children: [
      { id: 21, label: '查看用户' },
      { id: 22, label: '新增用户' },
      { id: 23, label: '编辑用户' },
      { id: 24, label: '删除用户' }
    ]
  },
  {
    id: 3,
    label: '角色管理',
    children: [
      { id: 31, label: '查看角色' },
      { id: 32, label: '新增角色' },
      { id: 33, label: '编辑角色' },
      { id: 34, label: '删除角色' },
      { id: 35, label: '分配权限' }
    ]
  },
  {
    id: 4,
    label: '商品管理',
    children: [
      { id: 41, label: '查看商品' },
      { id: 42, label: '新增商品' },
      { id: 43, label: '编辑商品' },
      { id: 44, label: '删除商品' }
    ]
  }
]

const defaultProps = {
  children: 'children',
  label: 'label'
}

// ========== 搜索 ==========
const searchForm = reactive({ name: '' })
const handleSearch = () => { pageNum.value = 1; fetchData() }
const resetSearch = () => { searchForm.name = ''; handleSearch() }

// ========== 表格数据 ==========
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const filtered = mockRoles.value.filter(item => {
      return item.name.includes(searchForm.name)
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

// ========== 新增/编辑 ==========
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formData = reactive({ id: null, name: '', description: '' })

const handleAdd = () => {
  dialogTitle.value = '新增角色'
  formData.id = null
  formData.name = ''
  formData.description = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  formData.id = row.id
  formData.name = row.name
  formData.description = row.description
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!formData.name) {
    ElMessage.warning('请输入角色名称')
    return
  }
  if (formData.id) {
    const index = mockRoles.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      mockRoles.value[index] = { ...formData }
      logOperation('编辑角色', '角色管理', `角色名称：${formData.name}`)
    }
  } else {
    const maxId = mockRoles.value.reduce((max, item) => Math.max(max, item.id), 0)
    mockRoles.value.push({
      id: maxId + 1,
      name: formData.name,
      description: formData.description
    })
    logOperation('新增角色', '角色管理', `角色名称：${formData.name}`)
  }
  saveRoles()
  ElMessage.success('保存成功')
  dialogVisible.value = false
  fetchData()
}

// ========== 删除 ==========
const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除吗？', '提示').then(() => {
    const index = mockRoles.value.findIndex(item => item.id === id)
    if (index !== -1) {
      mockRoles.value.splice(index, 1)
      saveRoles()
      logOperation('删除角色', '角色管理', `角色ID：${id}`)
      ElMessage.success('删除成功')
      fetchData()
    }
  }).catch(() => {})
}

// ========== 分配权限 ==========
const permDialogVisible = ref(false)
const treeRef = ref(null)
const currentRoleId = ref(null)

const handlePermission = (row) => {
  currentRoleId.value = row.id
  permDialogVisible.value = true
  setTimeout(() => {
    treeRef.value?.setCheckedKeys([11, 21, 22])
  }, 100)
}

const handleSavePermission = () => {
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  console.log(`角色 ${currentRoleId.value} 的权限：`, checkedKeys)
  ElMessage.success('权限保存成功（模拟）')
  permDialogVisible.value = false
}

// ========== 导出 Excel ==========
const handleExport = () => {
  const data = mockRoles.value.map(item => ({
    'ID': item.id,
    '角色名称': item.name,
    '描述': item.description
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, '角色列表')
  XLSX.writeFile(wb, `角色列表_${new Date().toLocaleDateString()}.xlsx`)
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.role-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.search-card {
  flex-shrink: 0;
}
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>