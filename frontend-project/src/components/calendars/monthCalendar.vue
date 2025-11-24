<template>
  <div class="w-full border rounded-md">
    <!-- Calendar Header -->
    <div class="grid grid-cols-7 border-b text-center font-semibold sticky top-0 z-10 bg-main-bg">
      <div v-for="day in weekDays" :key="day" class="p-2">{{ day }}</div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 border-l border-t">
      <div
        v-for="(day, idx) in days"
        :key="idx"
        class="h-[120px] border-r border-b p-1 relative"
        :style="{ backgroundColor: `rgba(var(--blue-bg-rgb), 0.3)` }"
      >
        <!-- Date Number -->
        <div
          class="text-xs font-semibold mb-1 flex items-center justify-start"
          :class="{
            'text-gray-400': !day.isCurrentMonth,
            'bg-blue-bg rounded-full w-6 h-6 flex items-center justify-center': isToday(day.date),
          }"
        >
          {{ day.date.getDate() }}
        </div>

        <!-- Events & Tasks (max 2 shown) -->
        <div
          v-for="(item, i) in day.items.slice(0, 2)"
          :key="i"
          class="truncate cursor-pointer text-xs p-1 my-1 border rounded bg-main-bg shadow-sm flex items-center"
          @click="openEventPopup(item, $event)"
        >
          <!-- Color bar -->
          <span
            class="rounded-md w-[2px] h-4 p-[1px] mr-1"
            :style="{ backgroundColor: getColor(item) }"
          ></span>

          <!-- Title -->
          {{ item.t_name || item.e_name }}
        </div>

        <!-- +N More indicator -->
        <div v-if="day.items.length > 2" class="text-xs text-sub-text italic mt-1 ml-1">
          +{{ day.items.length - 2 }} more
        </div>
      </div>
    </div>
  </div>

  <teleport to="body">
    <EventPopup
      :visible="showEventPopup"
      :event="selectedEvent"
      :item-top="popupItemTop"
      :item-left="popupItemLeft"
      @close="showEventPopup = false"
    />
  </teleport>
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
import { useAuthStore } from '@/stores/auth'
import EventPopup from '@/components/detail-cards/eventPopup.vue'
import { toLocal } from '@/utils/localTime.js'
import { getColor } from '@/utils/colors'

const showEventPopup = ref(false)
const selectedEvent = ref(null)
const popupItemTop = ref(0)
const popupItemLeft = ref(0)

// Stores
const taskStore = useTaskStore()
const eventStore = useEventStore()
const authStore = useAuthStore()
// Weekday names
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Props
const props = defineProps({
  year: { type: Number, default: new Date().getFullYear() },
  month: { type: Number, default: new Date().getMonth() },
})

// Fetch both events and tasks on mount
onMounted(async () => {
  await Promise.all([eventStore.fetchEvents(authStore.user.role), taskStore.fetchTasks()])
})

function openEventPopup(item, e) {
  selectedEvent.value = { ...item }

  const rect = e.currentTarget.getBoundingClientRect()
  const popupWidth = 320,
    popupHeight = 400
  let left = rect.left + rect.width / 2
  let top = rect.top + rect.height / 2

  if (left + popupWidth / 2 > window.innerWidth) left = window.innerWidth - popupWidth / 2 - 10
  if (left - popupWidth / 2 < 0) left = popupWidth / 2 + 10
  if (top + popupHeight / 2 > window.innerHeight) top = window.innerHeight - popupHeight / 2 - 10
  if (top - popupHeight / 2 < 0) top = popupHeight / 2 + 10

  popupItemLeft.value = left
  popupItemTop.value = top
  showEventPopup.value = true
}

// Generate calendar days
const days = computed(() => {
  const start = startOfWeek(startOfMonth(new Date(props.year, props.month)))
  const end = endOfWeek(endOfMonth(new Date(props.year, props.month)))

  return eachDayOfInterval({ start, end }).map((date) => {
    const formatted = format(date, 'yyyy-MM-dd')

    // Tasks for the day
    const dayTasks = taskStore.tasks
      .filter((t) => t.due_date)
      .map((t) => ({ ...t, start: toLocal(t.start_date), end: toLocal(t.due_date) }))
      .filter(
        (t) =>
          format(t.end, 'yyyy-MM-dd') >= formatted && format(t.start, 'yyyy-MM-dd') <= formatted,
      )

    // Events for the day
    const dayEvents = eventStore.events
      .filter((e) => e.start_date)
      .map((e) => ({
        ...e,
        start: toLocal(e.start_date),
        end: toLocal(e.end_date || e.start_date),
      }))
      .filter(
        (e) =>
          format(e.end, 'yyyy-MM-dd') >= formatted && format(e.start, 'yyyy-MM-dd') <= formatted,
      )

    // Combine both
    return {
      date,
      isCurrentMonth: isSameMonth(date, new Date(props.year, props.month)),
      items: [
        ...dayEvents.map((e) => ({ ...e, type: 'event', title: e.e_name })),
        ...dayTasks.map((t) => ({ ...t, type: 'task', title: t.t_title })),
      ],
    }
  })
})

// Check today
function isToday(date) {
  return isTodayFn(date)
}
</script>
