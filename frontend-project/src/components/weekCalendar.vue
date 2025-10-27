<template>
  <div
    ref="outerScroll"
    class="min-w-[740px] max-w-[0px] overflow-x-auto border h-[800px] rounded-md relative"
  >
    <!-- Inner grid with dynamic width -->
    <div
      ref="innerGrid"
      class="min-w-max relative"
      :style="{ width: `${monthDays.length * 80 + 80}px` }"
    >
      <!-- Current time dashed line + time label (only within today's column) -->
      <div
        v-if="isCurrentMonth && currentDayIndex >= 0"
        class="absolute pointer-events-none flex items-center"
        :style="{
          top: `${currentTopRem}rem`,
          left: `${80 + currentDayIndex * 80}px`,
          width: '80px',
          zIndex: 50,
        }"
      >
        <!-- Time label -->
        <div
          class="absolute -left-[68px] top-[2px] text-xs font-medium px-2 py-[1px] rounded bg-black text-white border shadow-sm"
          :style="{
            transform: 'translateY(-50%)',
          }"
        >
          {{ format(currentTime, 'hh:mm a') }}
        </div>

        <!-- Dashed line -->
        <div class="w-full border-t-2 border-dashed border-black"></div>
      </div>

      <!-- Header Row (sticky) -->
      <div
        class="grid grid-cols-[80px_repeat(var(--cols),80px)] sticky top-0 z-20 bg-white border-b"
        :style="{ '--cols': monthDays.length }"
      >
        <div class="p-2 bg-white sticky left-0 z-30 border-r"></div>
        <div v-for="day in monthDays" :key="day.date" class="p-2 border-l text-center">
          {{ format(day.date, 'EEE dd') }}
        </div>
      </div>

      <!-- Hours + Days -->
      <div
        class="grid grid-cols-[80px_repeat(var(--cols),80px)]"
        :style="{ '--cols': monthDays.length }"
      >
        <!-- Hours column (sticky) -->
        <div class="flex flex-col sticky left-0 z-10 border-r bg-white relative">
          <div
            v-for="hour in hours"
            :key="hour"
            class="h-16 border-b text-sm text-gray-500 flex items-center justify-end mr-1"
          >
            {{ hour }}
          </div>
        </div>

        <!-- Days columns -->
        <div
          v-for="day in monthDays"
          :key="day.date"
          class="relative border-l bg-[rgba(198,231,255,0.3)]"
        >
          <div v-for="hour in hours" :key="hour" class="h-16 border-b"></div>

          <!-- Tasks -->
          <div
            v-for="item in getItemsForDay(day.date)"
            :key="item.id"
            class="absolute left-1 right-1 bg-white rounded shadow p-1 text-xs border border-gray-200 overflow-hidden"
            :style="getItemStyle(item)"
          >
            <span
              class="block w-full h-[3px] rounded-sm mb-1"
              :style="{ backgroundColor: getColor(item) }"
            ></span>
            <div>
              <div class="font-semibold">{{ item.e_title || item.t_name }}</div>
              <div class="text-gray-500 text-[10px]">{{ formatTimeRange(item) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { startOfMonth, endOfMonth, addDays, format, differenceInMinutes } from 'date-fns'
import { useTaskStore } from '@/stores/task'
import { useEventStore } from '@/stores/event'

// Props
const props = defineProps({ monthStartDate: { type: Date, default: () => new Date() } })

// Generate all days of the month
const monthDays = []
let day = startOfMonth(props.monthStartDate)
const monthEnd = endOfMonth(props.monthStartDate)
while (day <= monthEnd) {
  monthDays.push({ date: new Date(day) })
  day = addDays(day, 1)
}

// Generate 24 hours
const hours = Array.from({ length: 24 }).map((_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
})

// Task & Event stores
const taskStore = useTaskStore()
const eventStore = useEventStore()

// Refs for scroll/positioning
const outerScroll = ref(null)
const innerGrid = ref(null)

// Reactive current time (updates every minute)
const currentTime = ref(new Date())
let timer
onMounted(async () => {
  await Promise.all([eventStore.fetchEvents(), taskStore.fetchTasks()])

  // initial center scroll to current day (best-effort)
  await nextTick()
  centerCurrentDate()

  timer = setInterval(() => (currentTime.value = new Date()), 60000)
})
onUnmounted(() => clearInterval(timer))

/* ---------- Current date / position helpers ---------- */
const isCurrentMonth = computed(() => {
  const today = new Date(currentTime.value)
  // same year and month as props.monthStartDate
  return (
    today.getFullYear() === props.monthStartDate.getFullYear() &&
    today.getMonth() === props.monthStartDate.getMonth()
  )
})

// index of today's day in monthDays (0-based)
const currentDayIndex = computed(() => {
  if (!isCurrentMonth.value) return -1
  const today = new Date(currentTime.value)
  const start = startOfMonth(props.monthStartDate)
  const diffMs = today.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 0
  if (diffDays >= monthDays.length) return monthDays.length - 1
  return diffDays
})

// top position in rem units (same scale as your task item calculation):
// you used: (hours + minutes/60) * 4 rem per hour => 4rem per hour
const currentTopRem = computed(() => {
  const t = new Date(currentTime.value)
  const hoursVal = t.getHours()
  const minutes = t.getMinutes()
  return (hoursVal + minutes / 60) * 4
})

function centerCurrentDate() {
  // best-effort centering of the current date column on first view
  if (!outerScroll.value || !innerGrid.value) return
  if (currentDayIndex.value < 0) return

  const container = outerScroll.value
  const containerWidth = container.clientWidth
  // each column is 80px; first column (hours) is 80px
  const dayLeft = 80 + currentDayIndex.value * 80 // px
  const dayCenter = dayLeft + 40 // center of the day column
  const targetScrollLeft = Math.max(0, Math.round(dayCenter - containerWidth / 2))
  container.scrollLeft = targetScrollLeft
}

/* ---------- Data selection & formatting (unchanged logic) ---------- */
function getItemsForDay(dayDate) {
  const dayStart = new Date(format(dayDate, 'yyyy-MM-dd') + 'T00:00:00')
  const dayEnd = new Date(format(dayDate, 'yyyy-MM-dd') + 'T23:59:59')

  // Tasks for the day
  const taskItems = taskStore.tasks
    .filter((t) => t.start_date && t.due_date)
    .filter((t) => {
      const start = new Date(t.start_date)
      const end = new Date(t.due_date)
      return end > dayStart && start < dayEnd
    })
    .map((t) => {
      const startTime = new Date(t.start_date)
      const endTime = new Date(t.due_date)
      return {
        ...t,
        type: 'task',
        startTime: startTime < dayStart ? dayStart : startTime,
        endTime: endTime > dayEnd ? dayEnd : endTime,
      }
    })

  // Events for the day
  const eventItems = eventStore.events
    .filter((e) => e.start_date)
    .filter((e) => {
      const start = new Date(e.start_date)
      const end = e.end_date ? new Date(e.end_date) : start
      return end > dayStart && start < dayEnd
    })
    .map((e) => {
      const startTime = new Date(e.start_date)
      const endTime = e.end_date ? new Date(e.end_date) : startTime
      return {
        ...e,
        type: 'event',
        startTime: startTime < dayStart ? dayStart : startTime,
        endTime: endTime > dayEnd ? dayEnd : endTime,
      }
    })

  return [...taskItems, ...eventItems] // Merge tasks + events
}

function formatTimeRange(item) {
  if (item.startTime && item.endTime) {
    const startStr = format(item.startTime, 'hh:mm a')
    const endStr = format(item.endTime, 'hh:mm a')
    return `${startStr} - ${endStr}`
  }
  return ''
}

function getItemStyle(item) {
  if (!item.startTime || !item.endTime) return { top: '0rem', height: '4rem' }
  const top = (item.startTime.getHours() + item.startTime.getMinutes() / 60) * 4
  const height = (differenceInMinutes(item.endTime, item.startTime) / 60) * 4
  return { top: `${top}rem`, height: `${height}rem` }
}

function getColor(item) {
  if (item.type === 'event') {
    if (item.project?.priority?.toUpperCase() === 'LOW') return '#C6E7FF'
    if (item.project?.priority?.toUpperCase() === 'MEDIUM') return '#FFD5DB'
    if (item.project?.priority?.toUpperCase() === 'HIGH') return '#FF8A5B'
  }

  if (item.type === 'task') {
    if (item.t_priority?.toUpperCase() === 'LOW') return '#C6E7FF'
    if (item.t_priority?.toUpperCase() === 'MEDIUM') return '#FFD5DB'
    if (item.t_priority?.toUpperCase() === 'HIGH') return '#FF8A5B'
  }

  return '#000000'
}
</script>
