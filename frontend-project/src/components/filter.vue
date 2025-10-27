<template>
  <div ref="dropdownRef" class="filter-dropdown relative inline-block">
    <button
      @click="toggle"
      class="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 transition"
    >
      <img src="../assets/icons/filter.svg" alt="Filter" class="w-4 h-4" />
      <span class="text-sm font-medium truncate">{{ title }}</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3"
    >
      <div v-if="options.length">
        <div
          v-for="opt in options"
          :key="opt.value"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md text-sm"
          @click="selectOption(opt.value)"
        >
          {{ opt.label }}
        </div>
      </div>

      <div v-else>
        <div v-for="field in fields" :key="field.key" class="mb-3 flex flex-col">
          <label class="text-sm font-medium mb-1">{{ field.label }}</label>
          <input
            v-if="field.type === 'text'"
            v-model="form[field.key]"
            class="border rounded-md px-2 py-1 text-sm"
          />
          <select
            v-if="field.type === 'select'"
            v-model="form[field.key]"
            class="border rounded-md px-2 py-1 text-sm"
          >
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <input
            v-if="field.type === 'date'"
            type="date"
            v-model="form[field.key]"
            class="border rounded-md px-2 py-1 text-sm"
          />
        </div>
        <button
          @click="applyForm"
          class="w-full py-2 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600 transition"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Filter' },
  options: { type: Array, default: () => [] },
  fields: { type: Array, default: () => [] },
})

const emit = defineEmits(['select', 'update'])

const open = ref(false)
const form = reactive({})
const dropdownRef = ref(null)

function toggle() {
  open.value = !open.value
}

function selectOption(value) {
  emit('select', value)
  open.value = false
}

function applyForm() {
  emit('update', { ...form })
  open.value = false
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
