<template>
  <div ref="chartContainer" :style="{ height: `${height}px`, padding: '10px' }"></div>
</template>

<script>
import { Pie } from '@antv/g2plot'
import { onMounted, ref, watch, onUnmounted } from 'vue'

export default {
  name: 'PieChart',
  props: {
    data: { type: Array, required: true },
    height: { type: Number, default: 450 },
  },
  setup(props) {
    const chartContainer = ref(null)
    let chart = null

    const renderChart = () => {
      if (!chartContainer.value) return
      if (chart) chart.destroy()

      const styles = getComputedStyle(document.documentElement)
      const mainTextColor = styles.getPropertyValue('--main-text').trim()

      const getPieColors = () => {
        const colors = []
        for (let i = 1; i <= 10; i++) {
          const value = styles.getPropertyValue(`--random-color-${i}`).trim()
          if (value) colors.push(value)
        }
        // Shuffle colors
        for (let i = colors.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[colors[i], colors[j]] = [colors[j], colors[i]]
        }
        return colors
      }

      chart = new Pie(chartContainer.value, {
        data: props.data,
        angleField: 'value',
        colorField: 'type',
        radius: 1,
        innerRadius: 0.4,
        height: props.height,
        color: getPieColors(),
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

    return { chartContainer }
  },
}
</script>
