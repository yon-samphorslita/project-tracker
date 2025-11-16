<template>
  <span
    :class="badgeClass"
    class="inline-block px-2 py-1 rounded-md font-medium text-sm text-center capitalize cursor-pointer relative z-10"
    @click="handleClick"
  >
    {{ displayValue }}

    <!-- Only show select for non-active editable fields -->
    <select
      v-if="editable && mode !== 'active'"
      v-model="currentValue"
      @change="emitChange"
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
    >
      <option v-for="item in options" :key="item" :value="item">
        {{ item }}
      </option>
    </select>
  </span>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'

const props = defineProps({
  status: { type: String, default: null },       // e.g. "Not Started"
  priority: { type: String, default: null },     // e.g. "Low"
  active: { type: Boolean, default: null },      // true / false
  editable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:status'])

// Auto-detect mode
const mode = computed(() => {
  if (typeof props.status === 'string' && props.status !== null) return 'status'
  if (typeof props.priority === 'string' && props.priority !== null) return 'priority'
  if (typeof props.active === 'boolean') return 'active'
  return 'unknown'
})

// Options for select
const options = computed(() => {
  switch (mode.value) {
    case 'status':
      return ['Not Started', 'In Progress', 'Completed']
    case 'priority':
      return ['Low', 'Medium', 'High']
    case 'active':
      return ['Active', 'Inactive']
    default:
      return []
  }
})

// Initialize current value
function getInitialValue() {
  if (mode.value === 'status') return props.status
  if (mode.value === 'priority') return props.priority
  if (mode.value === 'active') return props.active ? 'Active' : 'Inactive'
  return ''
}

const currentValue = ref(getInitialValue())

watchEffect(() => {
  currentValue.value = getInitialValue()
})

// Emit change
function emitChange() {
  if (mode.value === 'active') {
    const newActive = currentValue.value === 'Active'
    emit('update:status', newActive)
  } else {
    emit('update:status', currentValue.value)
  }
}

// Display value
const displayValue = computed(() => currentValue.value)

// Badge color classes
const badgeClass = computed(() => {
  const val = currentValue.value.toLowerCase()

  if (['completed', 'active', 'low'].includes(val))
    return 'bg-[rgba(7,199,14,0.15)] text-[#07c70e]'

  if (['in progress', 'medium'].includes(val))
    return 'bg-[rgba(250,192,54,0.15)] text-[#fac036]'

  if (['not started', 'inactive', 'high'].includes(val))
    return 'bg-[rgba(199,7,7,0.15)] text-[#c70707]'

  return 'bg-gray-200 text-gray-text'
})

// Handle click for toggling Active/Inactive
function handleClick() {
  if (!props.editable) return

  if (mode.value === 'active') {
    currentValue.value = currentValue.value === 'Active' ? 'Inactive' : 'Active'
    emitChange()
  }
}
</script>
