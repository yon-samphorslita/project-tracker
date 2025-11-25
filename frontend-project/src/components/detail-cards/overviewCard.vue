<template>
  <div
    class="rounded-md h-[150px] p-4 flex items-center justify-center flex-col gap-2"
    :style="{ backgroundColor: getRandomColors() }"
  >
    <p class="text-4xl font-bold">{{ value }}</p>
    <h3 class="text-xl font-semibold w-full text-center">{{ title }}</h3>
  </div>
</template>

<script setup>
import { getRandomColors } from '@/utils/colors'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
})
</script>
