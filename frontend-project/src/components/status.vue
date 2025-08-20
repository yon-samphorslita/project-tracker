<template>
  <span :class="statusClass" class="status-badge">
    {{ status }}
  </span>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

// Map status to colors
const statusClass = computed(() => {
  switch (props.status.toLowerCase()) {
    case 'completed':
      return 'completed'
    case 'in progress':
      return 'in-progress'
    case 'not started':
      return 'not-started'
    default:
      return 'unknown'
  }
})
</script>

<style scoped>
.status-badge {
  padding: 4px 8px;
  border-radius: 5px;
  color: white;
  font-weight: 500;
  font-size: 16px;
  text-transform: capitalize;
}

.completed {
  background-color: #4caf50; /* green */
}

.in-progress {
  background-color: #ff9800; /* orange */
}

.not-started {
  background-color: #f44336; /* red */
}

.unknown {
  background-color: #9e9e9e; /* grey */
}
</style>
