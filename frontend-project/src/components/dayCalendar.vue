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

        <!-- Current Time Dashed Line -->
        <div
          v-if="isToday(day)"
          class="absolute left-0 right-0 border-t-2 border-dashed border-red-400 z-10"
          :style="{ top: `${currentTimePosition}px` }"
        >
          <!-- Optional small dot -->
          <div class="absolute -left-1 top-[-3px] w-2 h-2 bg-red-400 rounded-full"></div>
        </div>

        <!-- Events + Tasks -->
        <div
          v-for="(item, idx) in getItemsForDay(day)"
          :key="idx"
          class="absolute flex justify-between gap-4 left-1 right-1 bg-white rounded shadow p-1 text-xs border border-gray-200 overflow-hidden"
          :style="getItemStyle(item)"
          @click="openEventPopup(item, $event)"
        >
          <div class="flex gap-2">
            <div
              class="block h-full w-[3px] rounded-sm mb-1"
              :style="{ backgroundColor: getColor(item) }"
            ></div>
            <div>
              <div class="font-semibold">{{ item.e_title || item.t_name || item.name }}</div>
              <div>
                {{ item.e_description || item.t_description || item.location || item.description }}
              </div>
            </div>
          </div>
          <div class="text-gray-500 text-[10px]">
            {{ item.start && item.end ? formatTimeRange(item) : '' }}
          </div>
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
      :item-width="popupItemWidth"
      :container-top="containerTop"
      :container-height="containerHeight"
      @close="showEventPopup = false"
    />
  </teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { format, parseISO, isSameDay } from 'date-fns'
import { useTaskStore } from '@/stores/task'
import { useEventStore } from '@/stores/event'
import { useSubtaskStore } from '@/stores/subtask'
import EventPopup from './eventPopup.vue'

const selectedEvent = ref(null)
const showEventPopup = ref(false)
const popupItemTop = ref(0)
const popupItemHeight = ref(0)
const containerTop = ref(0)
const containerHeight = ref(0)
const popupItemLeft = ref(0)
const popupItemWidth = ref(0)

function openEventPopup(item, event) {
  selectedEvent.value = item

  const rect = event.currentTarget.getBoundingClientRect()

  // Compute center position of the clicked element
  const centerX = rect.left + rect.width / 2 + window.scrollX
  const centerY = rect.top + rect.height / 2 + window.scrollY

  popupItemLeft.value = centerX
  popupItemTop.value = centerY
  popupItemWidth.value = rect.width
  popupItemHeight.value = rect.height

  showEventPopup.value = true
}

const props = defineProps({
  day: { type: Date, default: () => new Date() },
})

// Hours from 12 AM to 11 PM
const hours = Array.from({ length: 24 }).map((_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
})

function toLocal(dateStr) {
  if (!dateStr) return null
  return parseISO(dateStr)
}

const taskStore = useTaskStore()
const eventStore = useEventStore()
const subtaskStore = useSubtaskStore()

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
    description: e.e_description || e.location,
    type: 'event',
  }))

  const subtasks = subtaskStore.subtasks.map((s) => ({
    ...s,
    title: s.name,
    description: s.description,
    type: 'task',
  }))

  return [...tasks, ...events]
})

// Fetch data
onMounted(async () => {
  await Promise.all([taskStore.fetchTasks(), eventStore.fetchEvents()])
})

// Current Time Dashed Line Logic
const currentTimePosition = ref(0)
const HOUR_HEIGHT_PX = 48 // 12 rows of 48px = 1hr = 3rem in Tailwind h-12
const minuteToPx = HOUR_HEIGHT_PX / 60

function updateCurrentTimePosition() {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  currentTimePosition.value = mins * minuteToPx
}

onMounted(() => {
  updateCurrentTimePosition()
  const interval = setInterval(updateCurrentTimePosition, 60000) // update every minute
  onUnmounted(() => clearInterval(interval))
})

// Show only for today
function isToday(date) {
  return isSameDay(new Date(), date)
}

function formatTimeRange(item) {
  if (!item.start || !item.end) return ''
  return `${format(item.start, 'HH:mm')} - ${format(item.end, 'HH:mm')}`
}

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

function getColor(item) {
  if (item.type === 'event') {
    if (item.project?.priority?.toUpperCase() === 'LOW') return '#C6E7FF'
    if (item.project?.priority?.toUpperCase() === 'MEDIUM') return '#FFD5DB'
    if (item.project?.priority?.toUpperCase() === 'HIGH') return '#FF8A5B'
  }
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
