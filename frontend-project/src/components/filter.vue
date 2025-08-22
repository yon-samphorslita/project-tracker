<template>
  <div class="filter-dropdown">
    <!-- Trigger -->
    <button @click="toggle" class="filter-icon-btn">
      <img src="../assets/icons/filter.svg" alt="Filter" class="filter-icon" />
      <span class="filter-label-text">{{ title }}</span>
    </button>

    <!-- Dropdown -->
    <div v-if="open" class="filter-panel">
      <!-- Case 1: predefined options (Sort dropdown) -->
      <div
        v-if="options.length"
        v-for="opt in options"
        :key="opt.value"
        class="filter-option"
        @click="selectOption(opt.value)"
      >
        {{ opt.label }}
      </div>

      <!-- Case 2: dynamic fields (Form filter) -->
      <div v-else>
        <div v-for="field in fields" :key="field.key" class="filter-field">
          <label>{{ field.label }}</label>

          <!-- Text search -->
          <input
            v-if="field.type === 'text'"
            type="text"
            v-model="form[field.key]"
            class="filter-input"
          />

          <!-- Select dropdown -->
          <select v-if="field.type === 'select'" v-model="form[field.key]" class="filter-input">
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <!-- Date picker -->
          <input
            v-if="field.type === 'date'"
            type="date"
            v-model="form[field.key]"
            class="filter-input"
          />
        </div>

        <button class="apply-btn" @click="applyForm">Apply</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Filter' },
  options: { type: Array, default: () => [] }, // for sort dropdown
  fields: { type: Array, default: () => [] }, // for form filter
})

const emit = defineEmits(['select', 'update'])

const open = ref(false)
const form = reactive({})

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
</script>

<style scoped>
.filter-dropdown {
  position: relative;
  display: inline-block;
}

.filter-icon-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s;
}
.filter-icon-btn:hover {
  background: #f0f0f0;
}
.filter-icon {
  width: 18px;
  height: 18px;
}
.filter-label-text {
  font-size: 14px;
  font-weight: 500;
}

.filter-panel {
  position: absolute;
  top: 40px;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  z-index: 100;
  padding: 10px;
}

.filter-option {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}
.filter-option:hover {
  background: #f5f5f5;
}

.filter-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.filter-input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.apply-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: #2196f3;
  color: white;
  cursor: pointer;
  font-size: 14px;
}
.apply-btn:hover {
  background: #1976d2;
}
</style>
