<template>
  <div
    class="rounded-md p-4 flex items-center justify-center flex-col gap-2"
    :style="{ backgroundColor: randomColor }"
  >
    <p class="text-4xl font-bold">{{ value }}</p>
    <h3 class="text-xl font-semibold w-[130px] text-center">{{ title }}</h3>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
})

// Compute random color once per component instance
const randomColor = computed(() => {
  const styles = getComputedStyle(document.documentElement)
  const colors = []

  for (let i = 1; i <= 10; i++) {
    const value = styles.getPropertyValue(`--random-color-${i}`).trim()
    if (value) colors.push(value)
  }

  return colors[Math.floor(Math.random() * colors.length)]
})
</script>
