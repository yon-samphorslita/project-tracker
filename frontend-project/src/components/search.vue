<template>
  <div class="fixed w-full flex justify-center items-center h-12 top-24 px-4 z-50">
    <div class="w-full max-w-2xl">
      <input type="text" placeholder="Search..."
            class="w-full p-2 md:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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


<style scoped>
</style>
