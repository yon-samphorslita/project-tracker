<template>
  <div
    class="rounded-md p-4 flex items-center justify-center flex-col gap-2"
    :style="{ backgroundColor: getRandomColor() }"
  >
    <p class="text-4xl font-bold">{{ value }}</p>

    <h3 class="text-xl font-semibold w-[130px] text-center">{{ title }}</h3>
  </div>
</template>
<script setup>
const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
})
function getRandomColor() {
  const styles = getComputedStyle(document.documentElement)
  const colors = []

  // Collect all --random-color-* variables (assume max 10)
  for (let i = 1; i <= 10; i++) {
    const value = styles.getPropertyValue(`--random-color-${i}`).trim()
    if (value) colors.push(value)
  }

  // Pick a random color
  const index = Math.floor(Math.random() * colors.length)
  return colors[index]
}
</script>
