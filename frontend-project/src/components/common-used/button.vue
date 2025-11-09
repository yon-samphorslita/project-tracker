<template>
  <button
    :class="[
      'px-5 py-2.5 rounded-md text-center text-base shadow-md transition-colors duration-200',
      btnClass || defaultClass,
    ]"
    :style="inlineStyle"
    @click="$emit('click')"
    @mouseover="hover = true"
    @mouseout="hover = false"
  >
    {{ label }}
  </button>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  btnBg: { type: String, default: '' }, // dynamic color
  btnText: { type: String, default: '' }, // dynamic text color
  btnHoverBg: { type: String, default: '' }, // dynamic hover
  btnClass: { type: String, default: '' }, // additional class from parent
  btntextsize: { type: String, default: '16px' },
})

const hover = ref(false)

const resolveColor = (color) => {
  if (!color) return null
  return color.startsWith('var(')
    ? getComputedStyle(document.documentElement)
        .getPropertyValue(color.replace('var(', '').replace(')', '').trim())
        .trim()
    : color
}

// Inline style only applied if dynamic colors are provided
const inlineStyle = computed(() => ({
  fontSize: props.btntextsize,
  backgroundColor:
    props.btnBg || props.btnHoverBg
      ? hover.value
        ? resolveColor(props.btnHoverBg)
        : resolveColor(props.btnBg)
      : undefined,
  color: props.btnText ? resolveColor(props.btnText) : undefined,
}))

// Default class if nothing else provided
const defaultClass = 'btn'
</script>
