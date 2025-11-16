<template>
  <transition name="fade">
    <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end">
      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-[rgba(153,153,153,0.2)]" @click="closeForm"></div>

      <!-- Side Panel Form -->
      <div
        class="relative bg-main-bg w-[500px] max-w-full h-full shadow-xl p-6 overflow-auto transition-transform duration-300 transform"
        :class="showForm ? 'translate-x-0' : 'translate-x-full'"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">{{ title }}</h2>
          <button @click="closeForm" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <!-- Form -->
        <Form
          v-if="fields && endpoint"
          v-model:modelValue="showForm"
          :fields="fields"
          :initialData="initialData"
          :fullScreen="false"
          :endpoint="endpoint"
          @submitted="onSubmitted"
        />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import Form from './form.vue'

const props = defineProps({
  title: { type: String, default: 'Edit' },
  fields: { type: Array, required: true },
  initialData: { type: Object, default: () => ({}) },
  endpoint: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submitted'])
const showForm = ref(props.modelValue)

// Sync with v-model
watch(
  () => props.modelValue,
  (val) => (showForm.value = val),
)
watch(showForm, (val) => emit('update:modelValue', val))

function closeForm() {
  showForm.value = false
}

function onSubmitted(data) {
  emit('submitted', data)
  showForm.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
