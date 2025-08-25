<template>
  <div class="w-full border rounded-md">
    <!-- Calendar Header -->
    <div class="grid grid-cols-7 border-b text-center font-semibold sticky top-0 z-10">
      <div v-for="day in weekDays" :key="day" class="p-2">
        {{ day }}
      </div>
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
          class="text-xs font-semibold mb-1 flex items-center justify-center"
          :class="{
            'text-gray-400': !day.isCurrentMonth,
            'bg-blue-200 rounded-full w-6 h-6': isToday(day.date),
          }"
        >
          {{ day.date.getDate() }}
        </div>

        <!-- Events -->
        <div
          v-for="(event, i) in day.events"
          :key="i"
          class="truncate text-xs p-1 my-1 border rounded bg-white shadow-sm flex items-center"
        >
          <!-- Random color bar -->
          <span
            class="rounded-md w-[2px] h-4 p-[1px] mr-1"
            :style="{ backgroundColor: getRandomColor() }"
          ></span>

          <!-- Time + Title -->
          <span class="text-[rgba(56,56,56,0.8)]">{{ event.time }}</span> - {{ event.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday as isTodayFn,
} from 'date-fns'

const props = defineProps({
  year: { type: Number, default: new Date().getFullYear() },
  month: { type: Number, default: new Date().getMonth() }, // 0 = Jan
  events: {
    type: Array,
    default: () => [
      { date: '2025-08-02', time: '07:10 AM', title: 'Weekly Meeting' },
      { date: '2025-08-07', time: '10:00 AM', title: 'Design Review' },
      { date: '2025-08-24', time: '01:00 PM', title: 'Sprint Planning' },
    ],
  },
})

// Weekday names
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Generate days for the grid
const days = computed(() => {
  const start = startOfWeek(startOfMonth(new Date(props.year, props.month)))
  const end = endOfWeek(endOfMonth(new Date(props.year, props.month)))
  return eachDayOfInterval({ start, end }).map((date) => {
    const formatted = date.toISOString().split('T')[0]
    return {
      date,
      isCurrentMonth: isSameMonth(date, new Date(props.year, props.month)),
      events: props.events.filter((e) => e.date === formatted),
    }
  })
})

// Check if date is today
function isToday(date) {
  return isTodayFn(date)
}

// Random color generator (from three options)
const colors = ['#FFE578', '#FFD5DB', '#D9CBFB']
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)]
}
</script>
