<template>
  <div class="w-full overflow-auto max-h-screen border rounded-md">
    <!-- Header Row -->
    <div class="grid grid-cols-8 min-w-max sticky top-0 z-20 bg-white border-b">
      <div class="p-2 bg-white sticky left-0 z-30 border-r"></div>
      <div v-for="day in weekDays" :key="day.date" class="p-2 border-l text-center min-w-[80px]">
        <div class="font-semibold">{{ format(day.date, 'EEE dd') }}</div>
      </div>
    </div>

    <!-- Time Slots + Days -->
    <div class="grid grid-cols-8">
      <!-- Hours Column -->
      <div class="flex flex-col sticky left-0 z-10 border-r bg-white">
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-16 border-b text-sm text-gray-500 flex items-center justify-end mr-1"
        >
          {{ hour }}
        </div>
      </div>

      <!-- Days Columns -->
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="relative border-l bg-[rgba(198,231,255,0.3)]"
      >
        <div v-for="hour in hours" :key="hour" class="h-16 border-b"></div>

        <!-- Tasks -->
        <div
          v-for="(item, idx) in getItemsForDay(day.date)"
          :key="item.id"
          class="absolute left-1 right-1 bg-white rounded shadow p-1 text-xs border border-gray-200 overflow-hidden"
          :style="getItemStyle(item)"
        >
          <!-- Short horizontal line -->
          <span
            class="block w-full h-[3px] rounded-sm mb-1"
            :style="{ backgroundColor: getColor(item) }"
          ></span>

          <!-- Content -->
          <div>
            <div class="font-semibold">{{ item.e_title || item.t_name }}</div>
            <div class="text-gray-500 text-[10px]">
              {{ formatTimeRange(item) }}
            </div>
          </div>
        </div>

        <!-- Current Time Line -->
        <div
          v-if="format(day.date, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd')"
          class="absolute left-0 right-0 border-t-2 border-black border-dashed"
          :style="getCurrentTimeStyle()"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { startOfWeek, addDays, format, differenceInMinutes } from 'date-fns'
import { useTaskStore } from '@/stores/task'

const taskStore = useTaskStore()

// Reactive current time
const currentTime = ref(new Date())
let timer

onMounted(async () => {
  // Fetch tasks from store
  await taskStore.fetchTasks()

  // Update current time every minute
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

onUnmounted(() => clearInterval(timer))

// Props
const props = defineProps({ weekStart: { type: Date, default: () => new Date() } })

// Generate week days (Sunday start)
const weekDays = Array.from({ length: 7 }).map((_, i) => ({
  date: addDays(startOfWeek(props.weekStart, { weekStartsOn: 0 }), i),
}))

// Generate 24 hours
const hours = Array.from({ length: 24 }).map((_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
})

// --- Helpers ---
function getItemsForDay(dayDate) {
  const dayStart = new Date(format(dayDate, 'yyyy-MM-dd') + 'T00:00:00')
  const dayEnd = new Date(format(dayDate, 'yyyy-MM-dd') + 'T23:59:59')

  return taskStore.tasks
    .filter((t) => {
      const start = new Date(t.start_date)
      const end = new Date(t.due_date)
      // Include task only if it overlaps this day
      return end > dayStart && start < dayEnd
    })
    .map((t) => {
      const startTime = new Date(t.start_date)
      const endTime = new Date(t.due_date)
      return {
        ...t,
        startTime: startTime < dayStart ? dayStart : startTime,
        endTime: endTime > dayEnd ? dayEnd : endTime,
      }
    })
}

function formatTimeRange(item) {
  if (item.startTime && item.endTime) {
    const startStr = format(new Date(item.startTime), 'hh:mm a')
    const endStr = format(new Date(item.endTime), 'hh:mm a')
    return `${startStr} - ${endStr}`
  }
  return ''
}

// Event / Task positioning
function getItemStyle(item) {
  if (!item.startTime || !item.endTime) return { top: '0rem', height: '4rem' }

  const start = new Date(item.startTime)
  const end = new Date(item.endTime)

  const top = (start.getHours() + start.getMinutes() / 60) * 4 // 1 hour = 4rem
  const height = (differenceInMinutes(end, start) / 60) * 4

  return {
    top: `${top}rem`,
    height: `${height}rem`,
  }
}

// Priority / Color
function getColor(item) {
  if (item.t_priority) {
    if (item.t_priority.toUpperCase() === 'LOW') return '#C6E7FF'
    if (item.t_priority.toUpperCase() === 'MEDIUM') return '#FFD5DB'
    if (item.t_priority.toUpperCase() === 'HIGH') return '#FF8A5B'
  }
  if (item.t_status && item.t_status.toLowerCase() === 'completed') return '#A3E635'
  return '#FFE578'
}

// Current time line positioning
function getCurrentTimeStyle() {
  const now = currentTime.value
  const top = (now.getHours() + now.getMinutes() / 60) * 4
  return { top: `${top}rem` }
}
</script>
