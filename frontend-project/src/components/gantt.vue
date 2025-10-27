<template>
  <div ref="outerScroll" class="overflow-x-auto border border-black rounded-md relative bg-white">
    <!-- Inner grid -->
    <div
      ref="innerGrid"
      class="min-w-max relative"
      :style="{ width: `${(monthDays.length + 1) * columnWidth}px` }"
    >
      <!-- Header Row -->
      <div class="flex sticky top-0 bg-gray-100 z-20 border-b border-black">
        <!-- Sticky Task Header -->
        <div
          class="w-[240px] flex-shrink-0 text-center font-semibold py-4 border-r border-black bg-[#C6E7FF] sticky left-0 z-30"
        >
          Task
        </div>

        <!-- Day Headers -->
        <div class="flex">
          <div
            v-for="day in monthDays"
            :key="day"
            class="w-[110px] text-center py-4 border-r border-black text-sm bg-[#C6E7FF]"
            :class="{ 'bg-[#C6E7FF] opacity-40 font-bold': day === currentDay }"
          >
            {{ day }}
          </div>
        </div>
      </div>

      <!-- Task Rows -->
      <div v-for="(row, i) in rows" :key="i" class="flex border-b border-black relative h-[48px]">
        <!-- Sticky Task Name -->
        <div
          class="w-[240px] flex-shrink-0 border-r border-black py-4 px-3 sticky left-0 bg-white z-10 font-medium"
        >
          {{ row.label }}
        </div>

        <!-- Day Cells -->
        <div class="flex relative w-full">
          <div
            v-for="day in monthDays"
            :key="day"
            class="w-[110px] border-r border-black"
            :class="{ 'bg-[#C6E7FF] opacity-40': day === currentDay }"
          ></div>

          <!-- Subtask Bars -->
          <div
            v-for="(task, j) in row.tasks && row.tasks.length ? row.tasks : fallbackTask(row)"
            :key="j"
            class="absolute top-[8px] h-[32px] flex items-center rounded-full px-2 gap-1.5 overflow-hidden whitespace-nowrap text-ellipsis"
            :style="{
              left: `${getTaskOffset(task.start)}px`,
              width: `${getTaskWidth(task.start, task.end)}px`,
              backgroundColor: task.color || '#FFD5DB',
            }"
          >
            <img
              v-if="task.icon"
              :src="task.icon"
              class="w-[28px] h-[28px] rounded-full -ml-1.5 border-2 border-white"
            />
            <span class="task-name text-sm font-medium">{{ task.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
})

const columnWidth = 110
const today = new Date()
const currentDay = today.getDate()

// Outer scroll reference
const outerScroll = ref(null)

// Days in month
const monthDays = computed(() => {
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
})

// Task bar offset
function getTaskOffset(startDate) {
  if (!startDate) return 0
  const start = new Date(startDate).getDate()
  return (start - 1) * columnWidth // sticky column width
}

// Task bar width
function getTaskWidth(startDate, endDate) {
  if (!startDate || !endDate) return columnWidth
  const start = new Date(startDate).getDate()
  const end = new Date(endDate).getDate()
  return (end - start + 1) * columnWidth
}

// Auto-scroll to current day
onMounted(() => {
  const scrollPos = (currentDay - 1) * columnWidth + 240 - 400
  if (outerScroll.value) outerScroll.value.scrollLeft = scrollPos > 0 ? scrollPos : 0
})

// Fallback task for rows without subtasks
function fallbackTask(row) {
  return []
}
</script>
