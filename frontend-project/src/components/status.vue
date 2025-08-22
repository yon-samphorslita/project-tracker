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
  background-color: rgb(7, 199, 14, 0.3);
  color: #07c70e;
}

.in-progress {
  background-color: rgb(250, 192, 54, 0.3);
  color: #fac036;
}

.not-started {
  background-color: rgb(199, 7, 7, 0.3);
  color: #c70707;
}

.unknown {
  background-color: #9e9e9e;
}
</style>
