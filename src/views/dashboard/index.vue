<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="item in stats" :key="item.label">
        <el-card class="stat-card">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-change" :style="{ color: item.change > 0 ? '#2ecc71' : '#e74c3c' }">
            {{ item.change > 0 ? '↑' : '↓' }} {{ Math.abs(item.change) }}%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card>
          <LineChart />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <PieChart />
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增：近7日操作统计 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card>
          <div ref="barChartRef" style="width:100%;height:300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import LineChart from '@/components/Charts/LineChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'

// ===== 统计卡片 =====
const stats = ref([
  { label: '总用户', value: 128, change: 12 },
  { label: '总商品', value: 56, change: 8 },
  { label: '今日访问', value: 89, change: -3 },
  { label: '总订单', value: 456, change: 15 },
])

// ===== 柱状图（近7日操作统计） =====
const barChartRef = ref(null)

onMounted(() => {
  if (!barChartRef.value) return
  const chart = echarts.init(barChartRef.value)
  chart.setOption({
    title: { text: '近7日操作统计' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '操作次数',
        type: 'bar',
        data: [23, 18, 31, 25, 42, 38, 19],
        itemStyle: {
          color: '#4a6cf7',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  })
  window.addEventListener('resize', () => chart.resize())
})
</script>

<style scoped>
.dashboard { padding: 20px; }
.stats-row { margin-bottom: 20px; }
.stat-card { text-align: center; }
.stat-value { font-size: 28px; font-weight: bold; color: #1a1a2e; }
.stat-label { font-size: 14px; color: #888; margin-top: 4px; }
.stat-change { font-size: 14px; margin-top: 6px; font-weight: 500; }
.charts-row { margin-top: 20px; }
</style>