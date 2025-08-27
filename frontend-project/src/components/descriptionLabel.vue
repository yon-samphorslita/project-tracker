<template>
  <div class="flex flex-col gap-1">
    <div class="text-gray-800/80 font-medium">{{ label }}</div>
    <div class="text-lg text-gray-900">{{ description }}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>
