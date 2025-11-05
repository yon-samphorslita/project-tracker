<template>
  <div class="w-full max-h-screen overflow-auto border rounded-md relative flex-1">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-main-bg border-b">
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
          class="h-12 border-b text-sm text-gray-text flex items-center justify-center p-2"
          :style="{ backgroundColor: 'rgba(var(--blue-bg-rgb), 0.3)' }"
        >
          {{ hour }}
        </div>
      </div>

      <!-- Events/Tasks Column -->
      <div
        class="relative flex-1 min-w-[300px] overflow-hidden"
        :style="{ backgroundColor: 'rgba(var(--blue-bg-rgb), 0.3)' }"
      >
        <div v-for="hour in hours" :key="hour" class="h-12 border-b"></div>

        <!-- Current Time Dashed Line -->
        <div
          v-if="isToday(day)"
          class="absolute left-0 right-0 border-t-2 border-dashed border-red-400 z-10"
          :style="{ top: `${currentTimePosition}px` }"
        >
          <div class="absolute -left-1 top-[-3px] w-2 h-2 bg-red-400 rounded-full"></div>
        </div>

        <!-- Events + Tasks -->
        <div
          v-for="(item, idx) in getItemsForDay(day)"
          :key="idx"
          class="absolute flex justify-between gap-4 left-1 right-1 bg-main-bg rounded shadow p-1 text-xs border border-gray-200 overflow-hidden"
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
          <div class="text-sub-text text-[10px]">
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

const props = defineProps({
  day: { type: Date, default: () => new Date() },
})

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
  popupItemLeft.value = rect.left + rect.width / 2 + window.scrollX
  popupItemTop.value = rect.top + rect.height / 2 + window.scrollY
  popupItemWidth.value = rect.width
  popupItemHeight.value = rect.height
  showEventPopup.value = true
}

// Hours from 12 AM to 11 PM
const hours = Array.from({ length: 24 }).map(
  (_, i) => `${i % 12 === 0 ? 12 : i % 12} ${i < 12 ? 'AM' : 'PM'}`,
)

function toLocal(dateStr) {
  return dateStr ? parseISO(dateStr) : null
}

const taskStore = useTaskStore()
const eventStore = useEventStore()
const subtaskStore = useSubtaskStore()

const items = computed(() => {
  const tasks = taskStore.tasks.map((t) => ({
    ...t,
    start: toLocal(t.start_date),
    end: toLocal(t.due_date),
    title: t.t_name || t.title,
    description: t.t_description,
    type: 'task',
  }))
  const events = eventStore.events.map((e) => ({
    ...e,
    start: toLocal(e.start_date),
    end: toLocal(e.end_date),
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
  return [...tasks, ...events, ...subtasks]
})

onMounted(async () => {
  await Promise.all([taskStore.fetchTasks(), eventStore.fetchEvents()])
})

// Current Time Dashed Line
const currentTimePosition = ref(0)
const HOUR_HEIGHT_PX = 48
function updateCurrentTimePosition() {
  const now = new Date()
  currentTimePosition.value = (now.getHours() * 60 + now.getMinutes()) * (HOUR_HEIGHT_PX / 60)
}
onMounted(() => {
  updateCurrentTimePosition()
  const interval = setInterval(updateCurrentTimePosition, 60000)
  onUnmounted(() => clearInterval(interval))
})

function isToday(date) {
  return isSameDay(new Date(), date)
}
function formatTimeRange(item) {
  return item.start && item.end
    ? `${format(item.start, 'HH:mm')} - ${format(item.end, 'HH:mm')}`
    : ''
}

function getItemsForDay(selectedDay) {
  const dayStart = new Date(selectedDay)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(selectedDay)
  dayEnd.setHours(23, 59, 59, 999)
  return items.value.filter(
    (item) => item.start && item.end && item.start <= dayEnd && item.end >= dayStart,
  )
}

function getItemStyle(item) {
  if (!item.start || !item.end) return { top: '0', height: '0.25rem' }
  const dayStart = new Date(props.day)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(props.day)
  dayEnd.setHours(23, 59, 59, 999)
  const renderStart = item.start < dayStart ? dayStart : item.start
  const renderEnd = item.end > dayEnd ? dayEnd : item.end
  const startMinutes = renderStart.getHours() * 60 + renderStart.getMinutes()
  const durationMinutes = Math.max(
    renderEnd.getHours() * 60 + renderEnd.getMinutes() - startMinutes,
    15,
  )
  const minuteToRem = 3 / 60
  return { top: `${startMinutes * minuteToRem}rem`, height: `${durationMinutes * minuteToRem}rem` }
}

function getColor(item) {
  const priority = (item.type === 'event' ? item.project?.priority : item.t_priority)?.toUpperCase()
  if (!priority) return '#D9D9D9'
  return priority === 'LOW' ? '#C6E7FF' : priority === 'MEDIUM' ? '#FFD5DB' : '#FF8A5B'
}
</script>
