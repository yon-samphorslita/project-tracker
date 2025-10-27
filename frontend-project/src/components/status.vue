<template>
  <span
    :class="badgeClass"
    class="inline-block px-2 py-1 rounded-md font-medium text-sm text-center capitalize relative"
  >
    {{ displayValue }}

    <!-- Always show dropdown when editable -->
    <template v-if="editable && status">
      <select
        v-model="currentValue"
        @change="emitChange"
        class="bg-transparent absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
    </template>

    <!-- Display only if not editable -->
    <template v-else> </template>
  </span>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  priority: { type: String, default: '' },
  active: { type: Boolean, default: false },
  editable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:status'])

const currentValue = ref(props.status || props.priority || (props.active ? 'Active' : 'Inactive'))

watch(
  () => props.status,
  (val) => (currentValue.value = val),
)
watch(
  () => props.priority,
  (val) => (currentValue.value = val),
)
watch(
  () => props.active,
  (val) => (currentValue.value = val ? 'Active' : 'Inactive'),
)

function emitChange() {
  emit('update:status', currentValue.value)
}

const displayValue = computed(() => currentValue.value)

const badgeClass = computed(() => {
  if (props.status) {
    switch (props.status.toLowerCase()) {
      case 'completed':
        return 'bg-[rgba(7,199,14,0.15)] text-[#07c70e]'
      case 'in progress':
        return 'bg-[rgba(250,192,54,0.15)] text-[#fac036]'
      case 'not started':
        return 'bg-[rgba(199,7,7,0.15)] text-[#c70707]'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  } else if (props.priority) {
    switch (props.priority.toLowerCase()) {
      case 'high':
        return 'bg-[rgba(199,7,7,0.15)] text-[#c70707]'
      case 'medium':
        return 'bg-[rgba(250,192,54,0.15)] text-[#fac036]'
      case 'low':
        return 'bg-[rgba(7,199,14,0.15)] text-[#07c70e]'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  } else if (props.active !== undefined) {
    return props.active
      ? 'bg-[rgba(7,199,14,0.15)] text-[#07c70e]'
      : 'bg-[rgba(199,7,7,0.15)] text-[#c70707]'
  }
  return 'bg-gray-200 text-gray-700'
})
</script>
