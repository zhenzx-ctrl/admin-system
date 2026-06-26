# 🚀 企业后台管理系统

基于 Vue 3 + Vite + Element Plus + Pinia + ECharts 开发的企业后台管理平台。

## ✨ 技术栈

- **Vue 3** - 组合式 API
- **Vite** - 构建工具
- **Element Plus** - UI 组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **ECharts** - 数据可视化
- **xlsx** - Excel 导出

## 📦 功能模块

| 模块 | 功能 |
|------|------|
| 🔐 登录认证 | 用户名密码 + 验证码 + 路由守卫 |
| 👤 权限管理 | 动态菜单，不同角色展示不同页面 |
| 📋 用户管理 | 增删改查 + 批量删除 + 搜索 + 分页 + Excel 导出 |
| 🎯 角色管理 | 增删改查 + 分配权限 |
| 🛍️ 商品管理 | 增删改查 + 上架/下架 + Excel 导出 |
| 📊 数据看板 | ECharts 统计卡片 + 折线图 + 饼图 |
| 📝 日志审计 | 操作日志 + 登录日志 |
| 👤 个人中心 | 修改密码 |

## 🚀 快速启动

```bash
# 克隆项目
git clone https://github.com/zhenzx-ctrl/admin-system.git

# 进入目录
cd admin-system

# 安装依赖
npm install
admin-system/
├── src/
│   ├── api/          # 接口请求
│   ├── components/   # 通用组件
│   ├── composables/  # 组合式函数
│   ├── layouts/      # 布局组件
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia 状态管理
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue
│   └── main.js
├── public/
├── index.html
├── package.json
└── vite.config.js
# 启动项目
npm run dev
