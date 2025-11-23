<template>
  <div class="p-4 rounded-lg border w-full">
    <div class="text-xl font-bold mb-3">{{ title }}</div>
    <div ref="chartContainer" :style="{ height: `${height}px`, padding: '10px' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Pie } from '@antv/g2plot'
import { getRandomColors } from '@/utils/colors'

// Props
const props = defineProps({
  data: { type: Array, required: true },
  height: { type: Number, default: 450 },
  title: { type: String, default: '' },
})

const chartContainer = ref(null)
let chart = null

const renderChart = () => {
  if (!chartContainer.value) return
  if (chart) chart.destroy()

  const styles = getComputedStyle(document.documentElement)
  const mainTextColor = styles.getPropertyValue('--main-text').trim()

  // Use exported shuffled colors
  const pieColors = getRandomColors()

  chart = new Pie(chartContainer.value, {
    data: props.data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.4,
    height: props.height,
    color: pieColors,
    label: { style: { fill: mainTextColor } },
    legend: { itemName: { style: { fill: mainTextColor } } },
    interactions: [{ type: 'element-active' }],
    statistic: false,
  })

  chart.render()
}

onMounted(renderChart)
watch(() => props.data, renderChart, { deep: true })
onUnmounted(() => chart?.destroy())
</script>
