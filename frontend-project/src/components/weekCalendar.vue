<template>
  <div class="w-full overflow-auto max-h-screen border rounded-md">
    <!-- Header Row -->
    <div class="grid grid-cols-8 min-w-max sticky top-0 z-20 bg-white border-b">
      <!-- Hours column (small) -->
      <div class="p-2 bg-white sticky left-0 z-30 border-r"></div>
      <!-- Days headers -->
      <!-- Days headers -->
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
        class="relative border-l min-w-[98px] bg-[rgba(198,231,255,0.3)]"
      >
        <!-- Grid background -->
        <div v-for="hour in hours" :key="hour" class="h-16 border-b"></div>

        <!-- Events -->
        <div
          v-for="(event, idx) in getEventsForDay(day.date)"
          :key="idx"
          class="absolute left-1 right-1 bg-white rounded shadow p-1 text-xs border border-gray-200 overflow-hidden"
          :style="getEventStyle(event)"
        >
          <div class="font-semibold">{{ event.title }}</div>
          <div class="text-gray-500 text-[10px]">{{ event.time }}</div>
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
import { startOfWeek, addDays, format, parse, differenceInMinutes } from 'date-fns'

// Props
const props = defineProps({
  weekStart: { type: Date, default: () => new Date() },
  events: {
    type: Array,
    default: () => [
      { date: '2025-08-11', time: '08:10 AM - 09:00 AM', title: 'Weekly Report' },
      { date: '2025-08-12', time: '08:10 AM - 12:00 PM', title: 'Group Meeting' },
      { date: '2025-08-14', time: '01:00 PM - 03:00 PM', title: 'Team Review' },
    ],
  },
})

// Reactive current time
const currentTime = ref(new Date())

// Update current time every minute
let timer
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})
onUnmounted(() => clearInterval(timer))

// Generate week days
const weekDays = Array.from({ length: 7 }).map((_, i) => {
  const date = addDays(startOfWeek(props.weekStart, { weekStartsOn: 0 }), i)
  return { date }
})

// Generate all 24 hours dynamically
const hours = Array.from({ length: 24 }).map((_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
})

// --- Helpers ---
function getEventsForDay(dayDate) {
  return props.events.filter((event) => {
    const eventDate = format(new Date(event.date), 'yyyy-MM-dd')
    const slotDay = format(dayDate, 'yyyy-MM-dd')
    return eventDate === slotDay
  })
}

// Event positioning
function getEventStyle(event) {
  const [startStr, endStr] = event.time.split(' - ')
  const dayStart = parse(startStr, 'hh:mm a', new Date())
  const dayEnd = parse(endStr, 'hh:mm a', new Date())

  const minutesFromStart = dayStart.getHours() * 60 + dayStart.getMinutes()
  const durationMinutes = differenceInMinutes(dayEnd, dayStart)

  return {
    top: `${(minutesFromStart / 60) * 4}rem`, // 1 hour = 4rem
    height: `${(durationMinutes / 60) * 4}rem`,
  }
}

// Current time line positioning
function getCurrentTimeStyle() {
  const now = currentTime.value
  const topRem = now.getHours() + now.getMinutes() / 60
  return {
    top: `${topRem * 4}rem`,
  }
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
