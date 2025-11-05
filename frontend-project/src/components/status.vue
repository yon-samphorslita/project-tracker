<template>
  <span
    :class="badgeClass"
    class="inline-block px-2 py-1 rounded-md font-medium text-sm text-center capitalize relative z-0"
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
import { ref, computed, watchEffect } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  priority: { type: String, default: '' },
  active: { type: Boolean, default: false },
  editable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:status'])

const currentValue = ref(getInitialValue())

function getInitialValue() {
  if (props.status) return props.status
  if (props.priority) return props.priority
  return props.active ? 'Active' : 'Inactive'
}

watchEffect(() => {
  currentValue.value = getInitialValue()
})

function emitChange() {
  emit('update:status', currentValue.value)
}

const displayValue = computed(() => currentValue.value)

const badgeClass = computed(() => {
  const val = currentValue.value?.toLowerCase()
  switch (val) {
    case 'completed':
    case 'low':
    case 'active':
      return 'bg-[rgba(7,199,14,0.15)] text-[#07c70e]'
    case 'in progress':
    case 'medium':
      return 'bg-[rgba(250,192,54,0.15)] text-[#fac036]'
    case 'not started':
    case 'high':
    case 'inactive':
      return 'bg-[rgba(199,7,7,0.15)] text-[#c70707]'
    default:
      return 'bg-gray-200 text-gray-text'
  }
})
</script>
