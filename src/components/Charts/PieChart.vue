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
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [
      {
        name: '用户状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: true, position: 'outside' },
        data: [
          { value: 89, name: '启用', itemStyle: { color: '#4a6cf7' } },
          { value: 39, name: '禁用', itemStyle: { color: '#dc3545' } }
        ]
      }
    ]
  }
  chartInstance.setOption(option)

  const handleResize = () => {
    chartInstance?.resize()
  }
  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chartInstance?.dispose()
  })
})
</script>