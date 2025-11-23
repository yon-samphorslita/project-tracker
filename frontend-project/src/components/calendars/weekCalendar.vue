<template>
  <div ref="outerScroll" class="w-[827px] overflow-x-auto border h-[800px] rounded-md relative">
    <div class="min-w-max relative" :style="{ width: `${monthDays.length * 100 + 100}px` }">
      <!-- time line -->
      <div
        v-if="isCurrentMonth && currentDayIndex >= 0"
        class="absolute pointer-events-none flex items-center"
        :style="{
          top: `${currentTopRem}rem`,
          left: `${100 + currentDayIndex * 100}px`,
          width: '100px',
          zIndex: 8,
        }"
      >
        <div
          class="absolute -left-[68px] top-[2px] text-xs font-medium px-2 py-[1px] rounded bg-[var(--black-bg)] text-[var(--white-text)] border shadow-sm"
          style="transform: translateY(-50%)"
        >
          {{ format(currentTime, 'hh:mm a') }}
        </div>
        <div class="w-full border-t-2 border-dashed border-[var(--main-border)]"></div>
      </div>

      <!-- Header Row -->
      <div
        class="grid grid-cols-[100px_repeat(var(--cols),100px)] sticky top-0 z-10 bg-main-bg border-b"
        :style="{ '--cols': monthDays.length }"
      >
        <div class="p-2 bg-main-bg sticky left-0 z-0 border-r"></div>
        <div
          v-for="(day, index) in monthDays"
          :key="day.date"
          class="p-2 border-l text-center"
          :style="{
            backgroundColor:
              isCurrentMonth && index === currentDayIndex
                ? `rgba(var(--blue-bg-rgb), 0.7)`
                : `var(--main-bg)`,
          }"
        >
          {{ format(day.date, 'EEE dd') }}
        </div>
      </div>
      <div
        class="grid grid-cols-[100px_repeat(var(--cols),100px)]"
        :style="{ '--cols': monthDays.length }"
      >
        <div class="flex flex-col sticky left-0 z-[9] border-r bg-main-bg">
          <div
            v-for="hour in hours"
            :key="hour"
            class="h-16 border-b text-sm text-sub-text flex items-center justify-end pr-2"
          >
            {{ hour }}
          </div>
        </div>
        <div
          v-for="(day, index) in monthDays"
          :key="day.date"
          class="relative border-l"
          :style="{
            backgroundColor:
              isCurrentMonth && index === currentDayIndex
                ? `rgba(var(--blue-bg-rgb), 0.7)`
                : `rgba(var(--blue-bg-rgb), 0.3)`,
          }"
        >
          <div v-for="hour in hours" :key="hour" class="h-16 border-b"></div>

          <!-- Tasks and Events -->
          <div
            v-for="item in getItemsForDay(day.date)"
            :key="item.id"
            class="absolute left-1 right-1 bg-main-bg rounded shadow p-1 text-xs border border-gray-200 overflow-hidden cursor-pointer"
            :style="getItemStyle(item)"
            @click="openEventPopup(item, $event)"
          >
            <span
              class="block w-full h-[3px] rounded-sm mb-1"
              :style="{ backgroundColor: getColor(item) }"
            ></span>
            <div>
              <div class="font-semibold">{{ item.e_name || item.t_name }}</div>
              <div class="text-sub-text text-[10px]">
                {{ formatTimeRange(item) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Event Popup -->
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
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns'
import { useTaskStore } from '@/stores/task'
import { useEventStore } from '@/stores/event'
import EventPopup from '@/components/detail-cards/eventPopup.vue'
import { toLocal, formatTimeRange } from '@/utils/localTime.js'
import { getColor } from '@/utils/colors'
const props = defineProps({
  monthStartDate: { type: Date, default: () => new Date() },
})

// Generate all days of the month
const monthDays = []
let day = startOfMonth(props.monthStartDate)
const monthEnd = endOfMonth(props.monthStartDate)
while (day <= monthEnd) {
  monthDays.push({ date: new Date(day) })
  day = addDays(day, 1)
}

// 24-hour labels
const hours = Array.from({ length: 24 }, (_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
})

const taskStore = useTaskStore()
const eventStore = useEventStore()

const outerScroll = ref(null)
const currentTime = ref(new Date())
const selectedEvent = ref(null)
const showEventPopup = ref(false)
const popupItemTop = ref(0)
const popupItemLeft = ref(0)
let timer

onMounted(async () => {
  await Promise.all([eventStore.fetchEvents(), taskStore.fetchTasks()])
  await nextTick()
  centerCurrentDate()
  timer = setInterval(() => (currentTime.value = new Date()), 60000)
})

onUnmounted(() => clearInterval(timer))

// Computed Helpers
const isCurrentMonth = computed(() => {
  const today = new Date(currentTime.value)
  return (
    today.getFullYear() === props.monthStartDate.getFullYear() &&
    today.getMonth() === props.monthStartDate.getMonth()
  )
})

const currentDayIndex = computed(() => {
  if (!isCurrentMonth.value) return -1
  const today = new Date(currentTime.value)
  const start = startOfMonth(props.monthStartDate)
  const diffDays = Math.floor(
    (today.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
  )
  return Math.min(Math.max(diffDays, 0), monthDays.length - 1)
})

const currentTopRem = computed(() => {
  const t = new Date(currentTime.value)
  return (t.getHours() + t.getMinutes() / 60) * 4 + 2.8
})

function centerCurrentDate() {
  if (!outerScroll.value || currentDayIndex.value < 0) return
  const container = outerScroll.value
  const containerWidth = container.clientWidth
  const dayLeft = 100 + currentDayIndex.value * 100
  container.scrollLeft = Math.max(0, Math.round(dayLeft + 40 - containerWidth / 2))
}

// Data & Styling Helpers
function getItemsForDay(dayDate) {
  const dayStart = new Date(dayDate.setHours(0, 0, 0, 0))
  const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999))

  const tasks = taskStore.tasks
    .filter((t) => t.start_date && t.due_date)
    .filter((t) => {
      const start = toLocal(t.start_date)
      const end = toLocal(t.due_date)
      return end > dayStart && start < dayEnd
    })
    .map((t) => ({
      ...t,
      type: 'task',
      start: new Date(Math.max(toLocal(t.start_date), dayStart)),
      end: new Date(Math.min(toLocal(t.due_date), dayEnd)),
    }))

  const events = eventStore.events
    .filter((e) => e.start_date)
    .filter((e) => {
      const start = toLocal(e.start_date)
      const end = e.end_date ? toLocal(e.end_date) : start
      return end > dayStart && start < dayEnd
    })
    .map((e) => ({
      ...e,
      type: 'event',
      start: new Date(Math.max(toLocal(e.start_date), dayStart)),
      end: new Date(Math.min(toLocal(e.end_date || e.start_date), dayEnd)),
    }))

  return [...tasks, ...events]
}

function getItemStyle(item) {
  if (!item.start || !item.end) return { top: '0rem', height: '1rem' }

  const HOUR_HEIGHT_REM = 4
  const minuteToRem = HOUR_HEIGHT_REM / 60
  const startMinutes = item.start.getHours() * 60 + item.start.getMinutes()
  const endMinutes = item.end.getHours() * 60 + item.end.getMinutes()

  if (item.type === 'event') {
    const duration = Math.max(endMinutes - startMinutes, 15)
    return {
      top: `${startMinutes * minuteToRem}rem`,
      height: `${duration * minuteToRem}rem`,
    }
  } else {
    const OFFSET_HOURS = 3
    const offsetMinutes = OFFSET_HOURS * 60
    const displayStart = Math.max(endMinutes - offsetMinutes, startMinutes)
    const displayHeight = endMinutes - displayStart
    return {
      top: `${displayStart * minuteToRem}rem`,
      height: `${displayHeight * minuteToRem}rem`,
    }
  }
}

// Popup Handling
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
</script>
