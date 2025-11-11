<template>
  <div ref="outerScroll" class="w-[687px] overflow-x-auto border h-[800px] rounded-md relative">
    <!-- Inner grid -->
    <div class="min-w-max relative" :style="{ width: `${monthDays.length * 80 + 80}px` }">
      <!-- Current time line -->
      <div
        v-if="isCurrentMonth && currentDayIndex >= 0"
        class="absolute pointer-events-none flex items-center"
        :style="{
          top: `${currentTopRem}rem`,
          left: `${80 + currentDayIndex * 80}px`,
          width: '80px',
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
        class="grid grid-cols-[80px_repeat(var(--cols),80px)] sticky top-0 z-10 bg-main-bg border-b"
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

      <!-- Hours + Days -->
      <div
        class="grid grid-cols-[80px_repeat(var(--cols),80px)]"
        :style="{ '--cols': monthDays.length }"
      >
        <!-- Hours column -->
        <div class="flex flex-col sticky left-0 z-[9] border-r bg-main-bg">
          <div
            v-for="hour in hours"
            :key="hour"
            class="h-16 border-b text-sm text-sub-text flex items-center justify-end pr-2"
          >
            {{ hour }}
          </div>
        </div>

        <!-- Days columns -->
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

          <!-- Tasks & Events -->
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
              <div class="text-sub-text text-[10px]">{{ formatTimeRange(item) }}</div>
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
import { format, differenceInMinutes, startOfMonth, endOfMonth, addDays } from 'date-fns'
import { useTaskStore } from '@/stores/task'
import { useEventStore } from '@/stores/event'
import EventPopup from '@/components/detail-cards/eventPopup.vue'

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

/* ---------- Computed Helpers ---------- */
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
  const dayLeft = 80 + currentDayIndex.value * 80
  container.scrollLeft = Math.max(0, Math.round(dayLeft + 40 - containerWidth / 2))
}

/* ---------- Data & Styling Helpers ---------- */
function getItemsForDay(dayDate) {
  const dayStart = new Date(format(dayDate, 'yyyy-MM-dd') + 'T00:00:00')
  const dayEnd = new Date(format(dayDate, 'yyyy-MM-dd') + 'T23:59:59')

  const tasks = taskStore.tasks
    .filter((t) => t.start_date && t.due_date)
    .filter((t) => {
      const start = new Date(t.start_date)
      const end = new Date(t.due_date)
      return end > dayStart && start < dayEnd
    })
    .map((t) => ({
      ...t,
      type: 'task',
      startTime: new Date(Math.max(new Date(t.start_date), dayStart)),
      endTime: new Date(Math.min(new Date(t.due_date), dayEnd)),
    }))

  const events = eventStore.events
    .filter((e) => e.start_date)
    .filter((e) => {
      const start = new Date(e.start_date)
      const end = e.end_date ? new Date(e.end_date) : start
      return end > dayStart && start < dayEnd
    })
    .map((e) => ({
      ...e,
      type: 'event',
      startTime: new Date(Math.max(new Date(e.start_date), dayStart)),
      endTime: new Date(Math.min(new Date(e.end_date || e.start_date), dayEnd)),
    }))

  return [...tasks, ...events]
}

function formatTimeRange(item) {
  if (!item.startTime || !item.endTime) return ''
  return `${format(item.startTime, 'hh:mm a')} - ${format(item.endTime, 'hh:mm a')}`
}

function getItemStyle(item) {
  if (!item.startTime || !item.endTime) return { top: '0rem', height: '4rem' }
  const top = (item.startTime.getHours() + item.startTime.getMinutes() / 60) * 4
  const height = (differenceInMinutes(item.endTime, item.startTime) / 60) * 4
  return { top: `${top}rem`, height: `${height}rem` }
}

function getColor(item) {
  const priority =
    item.type === 'event' ? item.project?.priority?.toUpperCase() : item.t_priority?.toUpperCase()

  switch (priority) {
    case 'LOW':
      return '#C6E7FF'
    case 'MEDIUM':
      return '#FFD5DB'
    case 'HIGH':
      return '#FF8A5B'
    default:
      return '#000000'
  }
}

/* ---------- Popup Handling ---------- */
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
