<template>
  <div class="flex flex-col gap-1">
    <div class="text-gray-800/80 font-medium">{{ label }}</div>
    <div class="text-lg text-gray-900">
      <slot v-if="$slots.default" />
      <span v-else>{{ description || 'N/A' }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
