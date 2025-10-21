<template>
  <div class="w-full border rounded-md">
    <!-- Calendar Header -->
    <div class="grid grid-cols-7 border-b text-center font-semibold sticky top-0 z-10 bg-white">
      <div v-for="day in weekDays" :key="day" class="p-2">{{ day }}</div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 border-l border-t">
      <div
        v-for="(day, idx) in days"
        :key="idx"
        class="h-28 border-r border-b p-1 relative bg-[rgba(198,231,255,0.3)]"
      >
        <!-- Date Number -->
        <div
          class="text-xs font-semibold mb-1 flex items-center justify-start"
          :class="{
            'text-gray-400': !day.isCurrentMonth,
            'bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center': isToday(day.date),
          }"
        >
          {{ day.date.getDate() }}
        </div>

        <!-- Events & Tasks (max 3 shown) -->
        <div v-for="(item, i) in day.items.slice(0, 2)" :key="i" class="truncate text-xs p-1 my-1 border rounded bg-white shadow-sm flex items-center">
          <!-- Color bar -->
          <span
            class="rounded-md w-[2px] h-4 p-[1px] mr-1"
            :style="{ backgroundColor: getColor(item) }"
          ></span>

          <!-- Time + Title -->
          <span class="text-[rgba(56,56,56,0.8)]">{{ item.time || item.start_time || '' }}</span>
          - {{ item.title || item.t_name }}
        </div>

        <!-- +N More indicator -->
        <div
          v-if="day.items.length > 3"
          class="text-xs text-gray-500 italic mt-1 ml-1"
        >
          +{{ day.items.length - 3 }} more
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday as isTodayFn,
  format,
  parseISO,
} from 'date-fns'
import { useTaskStore } from '@/stores/task'
import { useEventStore } from '@/stores/event'

// Stores
const taskStore = useTaskStore()
const eventStore = useEventStore()

// Weekday names
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Props
const props = defineProps({
  year: { type: Number, default: new Date().getFullYear() },
  month: { type: Number, default: new Date().getMonth() },
})

// Fetch both events and tasks on mount
onMounted(async () => {
  await Promise.all([eventStore.fetchEvents(), taskStore.fetchTasks()])
})

// Generate calendar days
const days = computed(() => {
  const start = startOfWeek(startOfMonth(new Date(props.year, props.month)))
  const end = endOfWeek(endOfMonth(new Date(props.year, props.month)))

  return eachDayOfInterval({ start, end }).map((date) => {
    const formatted = format(date, 'yyyy-MM-dd')

    // --- TASKS ---
    const dayTasks = taskStore.tasks.filter((t) => {
      if (!t.due_date) return false
      const dueDate = parseISO(t.due_date)
      return format(dueDate, 'yyyy-MM-dd') === formatted
    })

    // --- EVENTS ---
    const dayEvents = eventStore.events.filter((e) => {
      if (!e.start_date) return false
      const startDate = parseISO(e.start_date)
      const endDate = e.end_date ? parseISO(e.end_date) : startDate
      const startStr = format(startDate, 'yyyy-MM-dd')
      const endStr = format(endDate, 'yyyy-MM-dd')
      // Event spans multiple days
      return formatted >= startStr && formatted <= endStr
    })

    // Combine both
    return {
      date,
      isCurrentMonth: isSameMonth(date, new Date(props.year, props.month)),
      items: [
        ...dayEvents.map((e) => ({
          ...e,
          type: 'event',
          title: e.e_title,
          time: e.start_time,
        })),
        ...dayTasks.map((t) => ({
          ...t,
          type: 'task',
          title: t.t_title,
          time: t.start_time,
        })),
      ],
    }
  })
})

// Check today
function isToday(date) {
  return isTodayFn(date)
}

// Colors for events/tasks
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

  return '#D9CBFB'
}
</script>
