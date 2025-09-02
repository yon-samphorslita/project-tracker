<template>
  <div class="w-full max-h-screen overflow-auto border rounded-md relative flex-1 min-w-[780px]">
    <!-- Header -->
    <div class="sticky top-0 z-20 bg-white border-b">
      <div class="ml-2 my-2 font-semibold text-lg">
        {{ format(day, 'EEE dd') }}
      </div>
    </div>

    <div class="flex">
      <!-- Hours Column -->
      <div class="flex flex-col min-w-[60px]">
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-12 border-b bg-[rgba(198,231,255,0.3)] text-sm text-gray-500 flex items-center justify-center p-2"
        >
          {{ hour }}
        </div>
      </div>

      <!-- Events/Tasks Column -->
      <div class="relative flex-1 bg-[rgba(198,231,255,0.3)] min-w-[300px]">
        <!-- Hour lines -->
        <div v-for="hour in hours" :key="hour" class="h-12 border-b"></div>

        <!-- Events + Tasks -->
        <div
          v-for="(item, idx) in getItemsForDay(day)"
          :key="idx"
          class="absolute flex justify-between gap-4 left-1 right-1 bg-white rounded shadow p-1 text-xs border border-gray-200 overflow-hidden"
          :style="getItemStyle(item)"
        >
          <div class="flex gap-2">
            <div
              class="block h-full w-[3px] rounded-sm mb-1"
              :style="{ backgroundColor: getColor(item) }"
            ></div>

            <div>
              <div class="font-semibold">
                {{ item.e_title || item.t_name }}
              </div>
              <div>
                {{ item.e_description || item.t_description }}
              </div>
            </div>
          </div>
          <div class="text-gray-500 text-[10px]">
            {{ item.start && item.end ? formatTimeRange(item) : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { format, differenceInMinutes, parseISO } from 'date-fns'
import { useTaskStore } from '@/stores/task'

const props = defineProps({
  day: { type: Date, default: () => new Date() },
})

// Generate hours dynamically from 12 AM to 11 PM
const hours = Array.from({ length: 24 }).map((_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
})

// Stores
const taskStore = useTaskStore()

// Merge tasks (parse dates properly)
const items = computed(() => {
  return taskStore.tasks.map((t) => ({
    ...t,
    start: t.start_date ? parseISO(t.start_date) : null,
    end: t.due_date ? parseISO(t.due_date) : null,
    title: t.t_title,
    description: t.t_description,
    type: 'task',
  }))
})

// Fetch data when mounted
onMounted(async () => {
  await taskStore.fetchTasks()
})

// Reactive current time
const currentTime = ref(new Date())
let timer
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})
onUnmounted(() => clearInterval(timer))

function getItemsForDay(selectedDay) {
  const dayStr = format(selectedDay, 'yyyy-MM-dd')
  return items.value.filter(
    (item) =>
      format(item.start, 'yyyy-MM-dd') <= dayStr && format(item.end, 'yyyy-MM-dd') >= dayStr,
  )
}

// Calculate top/height based on local time, clamped to day bounds
function getItemStyle(item) {
  if (!item.start || !item.end) return { top: '0', height: '2rem' }

  const start = new Date(item.start)
  const end = new Date(item.end)

  // Define bounds for the selected day
  const dayStart = new Date(props.day)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(props.day)
  dayEnd.setHours(23, 59, 59, 999)

  // Clamp task to this day's bounds (only for rendering)
  const renderStart = start < dayStart ? dayStart : start
  const renderEnd = end > dayEnd ? dayEnd : end

  // Convert clamped times to minutes
  const minutesFromStart = renderStart.getHours() * 60 + renderStart.getMinutes()
  const durationMinutes = differenceInMinutes(renderEnd, renderStart)

  return {
    top: `${(minutesFromStart / 60) * 4}rem`, // 1 hour = 4rem
    height: `${(durationMinutes / 60) * 4}rem`,
  }
}

// Display true original times, not clamped
function formatTimeRange(item) {
  if (!item.start || !item.end) return ''
  return `${format(item.start, 'HH:mm')} - ${format(item.end, 'HH:mm')}`
}

// Color based on event/task
const colors = ['#FFE578', '#FFD5DB', '#D9CBFB']

function getColor(item) {
  if (item.type === 'event') return colors[0]
  if (item.type === 'task') {
    if (item.t_priority?.toUpperCase() === 'LOW') return '#C6E7FF'
    if (item.t_priority?.toUpperCase() === 'MEDIUM') return '#FFD5DB'
    if (item.t_priority?.toUpperCase() === 'HIGH') return '#FF8A5B'
  }
  return colors[0]
}
</script>
