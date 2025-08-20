<template>
  <div class="description-label">
    <div class="label">{{ label }}</div>
    <div class="description">{{ description }}</div>
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
<style scoped>
.description-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  color: #1e1e1e;
  opacity: 0.8;
}
.description {
  font-size: 20px;
}
</style>
