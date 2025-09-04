<template>
  <button
    class="px-5 py-2.5 rounded-md text-center text-base shadow-md"
    :style="{ background: btnColor, color: btntext, 'font-size': btntextsize }"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  label: {
    type: String,
    required: true,
  },
  btnColor: {
    type: String,
    default: '#007BFF',
  },
  btntext: {
    type: String,
    default: 'white',
  },
  btntextsize: {
    type: String,
    default: '16px',
  },
})
</script>

<style></style>
