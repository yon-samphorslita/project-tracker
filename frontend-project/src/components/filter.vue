<template>
  <div ref="dropdownRef" class="filter-dropdown relative inline-block">
    <button
      @click="toggle"
      class="flex items-center gap-2 px-3 py-1 rounded-md transition hover:bg-black/15"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        class="w-4 h-4"
        :style="{ fill: 'var(--graysvg-text)' }"
      >
        <path
          fill="currentColor"
          d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z"
        />
      </svg>
      <span class="text-sm font-medium truncate">{{ title }}</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-56 bg-main-bg border border-gray-200 rounded-lg shadow-lg z-50 p-3"
    >
      <div v-if="options.length">
        <div
          v-for="opt in options"
          :key="opt.value"
          class="px-3 py-2 cursor-pointer hover:bg-black/15 rounded-md text-sm"
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
        <button @click="applyForm" class="w-full py-2 rounded-md text-sm btn transition">
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
