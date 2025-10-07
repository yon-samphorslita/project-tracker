<template>
  <div class="w-full max-h-screen overflow-auto border rounded-md relative flex-1 min-w-[740px]">
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
      <div class="relative flex-1 bg-[rgba(198,231,255,0.3)] min-w-[300px] overflow-hidden">
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
              <div class="font-semibold">{{ item.e_title || item.t_name }}</div>
              <div>{{ item.e_description || item.t_description || item.location }}</div>
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
import { format, parseISO } from 'date-fns'
import { useTaskStore } from '@/stores/task'
import { useEventStore } from '@/stores/event'

const props = defineProps({
  day: { type: Date, default: () => new Date() },
})

// Hours from 12 AM to 11 PM
const hours = Array.from({ length: 24 }).map((_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
})

// Convert backend ISO (UTC) to local Date
function toLocal(dateStr) {
  if (!dateStr) return null
  return parseISO(dateStr)
}

const taskStore = useTaskStore()
const eventStore = useEventStore()

// Combined list of tasks and events
const items = computed(() => {
  const tasks = taskStore.tasks.map((t) => ({
    ...t,
    start: t.start_date ? toLocal(t.start_date) : null,
    end: t.due_date ? toLocal(t.due_date) : null,
    title: t.t_name || t.title,
    description: t.t_description,
    type: 'task',
  }))

  const events = eventStore.events.map((e) => ({
    ...e,
    start: e.start_date ? toLocal(e.start_date) : null,
    end: e.end_date ? toLocal(e.end_date) : null,
    title: e.e_title,
    description: e.e_description,
    type: 'event',
  }))

  return [...tasks, ...events]
})

// Fetch data
onMounted(async () => {
  await Promise.all([taskStore.fetchTasks(), eventStore.fetchEvents()])
})

// Format time range
function formatTimeRange(item) {
  if (!item.start || !item.end) return ''
  return `${format(item.start, 'HH:mm')} - ${format(item.end, 'HH:mm')}`
}

// Filter items for the day
function getItemsForDay(selectedDay) {
  const dayStart = new Date(selectedDay)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(selectedDay)
  dayEnd.setHours(23, 59, 59, 999)

  return items.value.filter((item) => {
    if (!item.start || !item.end) return false
    return item.start <= dayEnd && item.end >= dayStart
  })
}

// Calculate style for display
function getItemStyle(item) {
  if (!item.start || !item.end) return { top: '0', height: '0.25rem' }

  const start = item.start
  const end = item.end

  const dayStart = new Date(props.day)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(props.day)
  dayEnd.setHours(23, 59, 59, 999)

  const renderStart = start < dayStart ? dayStart : start
  const renderEnd = end > dayEnd ? dayEnd : end

  const startMinutes = renderStart.getHours() * 60 + renderStart.getMinutes()
  const endMinutes = renderEnd.getHours() * 60 + renderEnd.getMinutes()
  const durationMinutes = Math.max(endMinutes - startMinutes, 15)

  const HOUR_ROW_REM = 3
  const minuteToRem = HOUR_ROW_REM / 60

  return {
    top: `${startMinutes * minuteToRem}rem`,
    height: `${durationMinutes * minuteToRem}rem`,
  }
}

// Color coding
function getColor(item) {
  if (item.type === 'event') return '#FFE578'
  if (item.type === 'task') {
    switch (item.t_priority?.toUpperCase()) {
      case 'LOW':
        return '#C6E7FF'
      case 'MEDIUM':
        return '#FFD5DB'
      case 'HIGH':
        return '#FF8A5B'
    }
  }
  return '#D9CBFB'
}
</script>
