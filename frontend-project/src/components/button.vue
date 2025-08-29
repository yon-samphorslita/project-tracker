<template>
  <button
    class="btn"
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

<style>
.btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  text-align: center;
  font-size: 16px;
  /* position: fixed; */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
