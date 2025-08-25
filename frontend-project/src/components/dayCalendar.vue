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

      <!-- Events Column -->
      <div class="relative flex-1 bg-[rgba(198,231,255,0.3)] min-w-[300px]">
        <!-- Hour lines -->
        <div v-for="hour in hours" :key="hour" class="h-12 border-b"></div>

        <!-- Events -->
        <div
          v-for="(event, idx) in getEventsForDay(day)"
          :key="idx"
          class="absolute left-1 right-1 bg-white rounded shadow p-1 text-xs border border-gray-200 overflow-hidden"
          :style="getEventStyle(event)"
        >
          <div class="font-semibold">{{ event.title }}</div>
          <div class="text-gray-500 text-[10px]">{{ event.time }}</div>
        </div>

        <!-- Current time line -->
        <div
          v-if="format(day, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd')"
          class="absolute left-0 right-0 border-t-2 border-red-500 border-dashed"
          :style="getCurrentTimeStyle()"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { format, parse, differenceInMinutes, isToday as isTodayFn } from 'date-fns'

const props = defineProps({
  day: { type: Date, default: () => new Date() },
  events: {
    type: Array,
    default: () => [
      { date: '2025-08-11', time: '08:10 AM - 09:00 AM', title: 'Daily Standup' },
      { date: '2025-08-11', time: '10:00 AM - 11:30 AM', title: 'Project Meeting' },
      { date: '2025-08-11', time: '02:00 PM - 03:00 PM', title: 'Code Review' },
    ],
  },
})

// Generate hours dynamically from 12 AM to 11 PM
const hours = Array.from({ length: 24 }).map((_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
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

// --- Helpers ---
function getEventsForDay(selectedDay) {
  return props.events.filter((event) => {
    const eventDate = format(new Date(event.date), 'yyyy-MM-dd')
    const slotDay = format(selectedDay, 'yyyy-MM-dd')
    return eventDate === slotDay
  })
}

function getEventStyle(event) {
  const [startStr, endStr] = event.time.split(' - ')
  const dayStart = parse(startStr, 'hh:mm a', new Date())
  const dayEnd = parse(endStr, 'hh:mm a', new Date())

  const minutesFromStart = dayStart.getHours() * 60 + dayStart.getMinutes()
  const durationMinutes = differenceInMinutes(dayEnd, dayStart)

  return {
    top: `${(minutesFromStart / 60) * 4}rem`,
    height: `${(durationMinutes / 60) * 4}rem`,
  }
}

function getCurrentTimeStyle() {
  const now = currentTime.value
  const topRem = now.getHours() + now.getMinutes() / 60
  return {
    top: `${topRem * 4}rem`,
  }
}

function isToday(date) {
  return isTodayFn(date)
}
</script>

<style scoped>
/* Nice scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
