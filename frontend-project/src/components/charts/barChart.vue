<template>
  <div class="h-[350px] p-4 rounded-lg border w-full">
    <div class="text-xl font-bold mb-3">{{ title }}</div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getRandomColors } from '@/utils/colors'
Chart.register(...registerables)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  title: { type: String },
})

const canvasRef = ref(null)
let chartInstance = null

const destroyChart = () => {
  if (chartInstance) chartInstance.destroy()
}

const renderChart = () => {
  if (!canvasRef.value) return
  destroyChart()

  const colors = getRandomColors()
  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: props.datasets.map((ds, i) => ({
        ...ds,
        backgroundColor: colors[i % colors.length],
        borderRadius: 4,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom' },
        title: { display: !!props.title, text: props.title },
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true },
      },
    },
  })
}

watch([() => props.labels, () => props.datasets], renderChart, { deep: true })
onMounted(renderChart)
onBeforeUnmount(destroyChart)
</script>
