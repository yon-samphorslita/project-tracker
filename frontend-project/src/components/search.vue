<template>
  <div class="w-full flex justify-center items-center">
    <div class="w-full max-w-2xl">
      <input
        type="text"
        placeholder="Search..."
        class="w-full p-2 md:p-3 border bg-main-bg text-sub-text border-gray-300 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        v-model="query"
        @input="onInput"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const query = ref('')

const emit = defineEmits(['update:query'])
const onInput = () => {
  emit('update', query.value)
}
</script>

<style scoped></style>
