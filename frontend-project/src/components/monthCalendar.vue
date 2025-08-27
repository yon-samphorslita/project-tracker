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

        <!-- Events & Tasks -->
        <div
          v-for="(item, i) in day.items"
          :key="i"
          class="truncate text-xs p-1 my-1 border rounded bg-white shadow-sm flex items-center"
        >
          <!-- Color bar -->
          <span
            class="rounded-md w-[2px] h-4 p-[1px] mr-1"
            :style="{ backgroundColor: getColor(item) }"
          ></span>

          <!-- Time + Title -->
          <span class="text-[rgba(56,56,56,0.8)]">{{ item.time || item.start_time || '' }}</span>
          - {{ item.title || item.t_name }}
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

const taskStore = useTaskStore()

// Weekday names
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Props
const props = defineProps({
  year: { type: Number, default: new Date().getFullYear() },
  month: { type: Number, default: new Date().getMonth() },
})

// Fetch events & tasks on mount
onMounted(async () => {
  // await eventStore.fetchEvents()
  await taskStore.fetchTasks()
})

// Generate calendar days
const days = computed(() => {
  const start = startOfWeek(startOfMonth(new Date(props.year, props.month)))
  const end = endOfWeek(endOfMonth(new Date(props.year, props.month)))

  return eachDayOfInterval({ start, end }).map((date) => {
    const formatted = format(date, 'yyyy-MM-dd') // local day string

    const dayTasks = taskStore.tasks.filter((t) => {
      if (!t.due_date) return false
      const dueDate = parseISO(t.due_date) // parse into Date (local)
      const dueDay = format(dueDate, 'yyyy-MM-dd')
      return dueDay === formatted
    })

    return {
      date,
      isCurrentMonth: isSameMonth(date, new Date(props.year, props.month)),
      items: [...dayTasks],
    }
  })
})

// Check today
function isToday(date) {
  return isTodayFn(date)
}

// Colors for events/tasks
const colors = ['#FFE578', '#FFD5DB', '#D9CBFB']
function getColor(item) {
  // Event by project
  if (item.projectId) return colors[item.projectId % colors.length]

  // Task by priority
  if (item.t_priority) {
    if (item.t_priority.toUpperCase() === 'LOW') return '#C6E7FF'
    if (item.t_priority.toUpperCase() === 'MEDIUM') return '#FFD5DB'
    if (item.t_priority.toUpperCase() === 'HIGH') return '#FF8A5B'
  }

  return colors[0]
}
</script>
