<template>
  <div ref="chartRef" style="width:100%;height:300px;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      boundaryGap: false
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: [12, 18, 15, 22, 30, 26, 20],
        areaStyle: {
          color: 'rgba(74, 108, 247, 0.2)'
        },
        lineStyle: {
          color: '#4a6cf7'
        }
      }
    ]
  }
  chartInstance.setOption(option)

  // 窗口缩放自适应
  const handleResize = () => {
    chartInstance?.resize()
  }
  window.addEventListener('resize', handleResize)

  // 组件销毁时清理
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chartInstance?.dispose()
  })
})
</script>