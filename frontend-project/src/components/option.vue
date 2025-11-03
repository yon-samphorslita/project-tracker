<template>
  <div class="flex justify-between rounded-lg overflow-hidden border border-gray-300">
    <button
      v-for="option in options"
      :key="option"
      @click="select(option)"
      :class="[
        'px-6 py-2 text-sm font-medium focus:outline-none w-full',
        selected === option
          ? 'bg-main-bg text-gray-text '
          : 'bg-gray-300 text-gray-900 hover:bg-gray-400',
      ]"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'Day',
  },
  options: {
    type: Array,
    default: () => ['Day', 'Week', 'Month'],
  },
})

const emit = defineEmits(['update:modelValue'])

const selected = ref(props.modelValue)

function select(option) {
  selected.value = option
  emit('update:modelValue', option)
}
</script>

<style scoped>
button + button {
  border-left: 1px solid #ccc;
}
</style>
