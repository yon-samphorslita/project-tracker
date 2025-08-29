<template>
  <span
    :class="badgeClass"
    class="inline-block px-2 py-1 rounded-md font-medium text-sm text-center capitalize"
  >
    {{ value }}
  </span>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  priority: { type: String, default: '' },
  active: { type: Boolean, default: false },
})

const value = computed(() => {
  if (props.status) return props.status
  if (props.priority) return props.priority
  if (props.active !== undefined) return props.active ? 'Active' : 'Inactive'
  return 'N/A'
})

const badgeClass = computed(() => {
  if (props.status) {
    switch (props.status.toLowerCase()) {
      case 'completed':
        return 'bg-[rgb(7,199,14,0.3)] text-[#07c70e]'
      case 'in progress':
      case 'in_progress':
        return 'bg-[rgb(250,192,54,0.3)] text-[#fac036]'
      case 'not started':
      case 'not_started':
        return 'bg-[rgb(199,7,7,0.3)] text-[#c70707]'
      default:
        return 'bg-[#9e9e9e]'
    }
  } else if (props.priority) {
    switch (props.priority.toLowerCase()) {
      case 'high':
        return 'bg-[rgb(199,7,7,0.3)] text-[#c70707]'
      case 'medium':
        return 'bg-[rgb(250,192,54,0.3)] text-[#fac036]'
      case 'low':
        return 'bg-[rgb(7,199,14,0.3)] text-[#07c70e]'
      default:
        return 'bg-[#9e9e9e]'
    }
  } else if (props.active !== undefined) {
    return props.active
      ? 'bg-[rgb(7,199,14,0.3)] text-[#07c70e]'
      : 'bg-[rgb(199,7,7,0.3)] text-[#c70707]'
  } else return 'bg-[#9e9e9e]'
})
</script>
