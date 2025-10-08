<template>
  <div class="w-full flex items-center justify-between gap-2">
    <div class="min-w-[80px] w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-2 bg-[#07c70e] transition-all duration-500 ease-out"
        :style="{ width: percentage + '%' }"
      ></div>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-900">{{ percentage }}%</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completed: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
})

const percentage = computed(() =>
  props.total > 0 ? Math.round((props.completed / props.total) * 100) : 0,
)
</script>
