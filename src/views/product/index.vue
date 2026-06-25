<template>
  <div class="product-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
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
        <el-button type="primary" @click="handleAdd">新增商品</el-button>
        <el-button type="success" @click="handleExport">📊 导出 Excel</el-button>
      </div>

      <el-table 
        :data="tableData" 
        border 
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" width="120" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="row.status === 1 ? 'warning' : 'success'" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
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
        <el-form-item label="商品名称">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model.number="formData.price" type="number" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option label="电子产品" value="电子产品" />
            <el-option label="服装" value="服装" />
            <el-option label="食品" value="食品" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" />
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import { logOperation } from '@/utils/logger'

// ========== 默认数据 ==========
const defaultProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 7999, category: '电子产品', description: '最新款苹果手机', status: 1 },
  { id: 2, name: 'MacBook Air M2', price: 8999, category: '电子产品', description: '轻薄笔记本电脑', status: 1 },
  { id: 3, name: 'AirPods Pro 2', price: 1899, category: '电子产品', description: '降噪耳机', status: 0 },
]

// ========== localStorage 读写 ==========
const getProducts = () => {
  const stored = localStorage.getItem('products')
  if (stored) {
    return JSON.parse(stored)
  }
  return defaultProducts
}
const mockProducts = ref(getProducts())
const saveProducts = () => {
  localStorage.setItem('products', JSON.stringify(mockProducts.value))
}

// ========== 搜索 ==========
const searchForm = reactive({ name: '', status: '' })
const handleSearch = () => { pageNum.value = 1; fetchData() }
const resetSearch = () => { searchForm.name = ''; searchForm.status = ''; handleSearch() }

// ========== 表格 ==========
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const filtered = mockProducts.value.filter(item => {
      const matchName = item.name.includes(searchForm.name)
      const matchStatus = searchForm.status === '' || item.status === searchForm.status
      return matchName && matchStatus
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
const dialogTitle = ref('新增商品')
const formData = reactive({ id: null, name: '', price: '', category: '', description: '', status: 1 })

const handleAdd = () => {
  dialogTitle.value = '新增商品'
  formData.id = null
  formData.name = ''
  formData.price = ''
  formData.category = ''
  formData.description = ''
  formData.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑商品'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!formData.name || !formData.price) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (formData.id) {
    const index = mockProducts.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      mockProducts.value[index] = { ...formData }
      logOperation('编辑商品', '商品管理', `商品名称：${formData.name}`)
    }
  } else {
    const maxId = mockProducts.value.reduce((max, item) => Math.max(max, item.id), 0)
    mockProducts.value.push({
      id: maxId + 1,
      name: formData.name,
      price: formData.price,
      category: formData.category,
      description: formData.description,
      status: formData.status || 1
    })
    logOperation('新增商品', '商品管理', `商品名称：${formData.name}`)
  }
  saveProducts()
  ElMessage.success('保存成功')
  dialogVisible.value = false
  fetchData()
}

// ========== 删除 ==========
const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除吗？', '提示').then(() => {
    mockProducts.value = mockProducts.value.filter(item => item.id !== id)
    saveProducts()
    logOperation('删除商品', '商品管理', `商品ID：${id}`)
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

// ========== 上架/下架 ==========
const handleToggleStatus = (row) => {
  const action = row.status === 1 ? '下架' : '上架'
  ElMessageBox.confirm(`确定${action}该商品吗？`, '提示').then(() => {
    row.status = row.status === 1 ? 0 : 1
    saveProducts()
    logOperation(action, '商品管理', `商品名称：${row.name}`)
    ElMessage.success(`${action}成功`)
    fetchData()
  }).catch(() => {})
}

// ========== 导出 Excel ==========
const handleExport = () => {
  const data = mockProducts.value.map(item => ({
    'ID': item.id,
    '商品名称': item.name,
    '价格': item.price,
    '分类': item.category,
    '描述': item.description,
    '状态': item.status === 1 ? '上架' : '下架'
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, '商品列表')
  XLSX.writeFile(wb, `商品列表_${new Date().toLocaleDateString()}.xlsx`)
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.product-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.search-card { flex-shrink: 0; }
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>