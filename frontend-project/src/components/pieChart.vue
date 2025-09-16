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

      chart = new Pie(chartContainer.value, {
  data: props.data,
  angleField: 'value',
  colorField: 'type',
  radius: 1,
  innerRadius: 0.5,
  height: props.height,
  color: ['#4F4F4F', '#A3D9C8', '#B0E0FF'],
  label: {
    type: 'spider',
    labelHeight: 20,
    content: '{name}',
    autoRotate: false,   // prevent tilted text
    autoHide: true,      // hides label if it would overflow
    layout: [
      { type: 'limit-in-plot', cfg: { action: 'hide' } }, // keeps labels inside
    ],
  },
  interactions: [{ type: 'element-active' }],
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
