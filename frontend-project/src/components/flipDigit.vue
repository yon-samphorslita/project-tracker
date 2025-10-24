<template>
  <div class="relative w-16 h-24 perspective-500">
    <!-- top half -->
    <div
      class="absolute inset-0 bg-gray-900 text-white flex items-center justify-center text-4xl font-mono rounded-lg border border-gray-700 overflow-hidden"
    >
      {{ currentDigit }}
    </div>

    <!-- animated flip -->
    <transition name="flip">
      <div
        v-if="isFlipping"
        key="flip"
        class="absolute inset-0 bg-gray-800 text-white flex items-center justify-center text-4xl font-mono rounded-lg border border-gray-700 overflow-hidden"
      >
        {{ nextDigit }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  digit: { type: String, required: true },
})

const currentDigit = ref(props.digit)
const nextDigit = ref(props.digit)
const isFlipping = ref(false)

watch(
  () => props.digit,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      nextDigit.value = newVal
      isFlipping.value = true
      setTimeout(() => {
        currentDigit.value = newVal
        isFlipping.value = false
      }, 500)
    }
  },
)
</script>

<style scoped>
.perspective-500 {
  perspective: 500px;
}

.flip-enter-active {
  animation: flipDown 0.5s ease-in-out forwards;
}
@keyframes flipDown {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-180deg);
  }
}
</style>