<template>
  <div class="w-full max-h-screen overflow-auto border rounded-md relative flex-1 min-w-[740px]">
    <!-- Header -->
    <div class="sticky top-0 z-20 bg-main-bg border-b">
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
          class="h-12 border-b text-sm text-[var(--gray-text)] flex items-center justify-center p-2"
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
          class="absolute left-0 right-0 border-t-2 border-dashed border-[var(--btn-red-bg)] z-10"
          :style="{ top: `${currentTimePosition}px` }"
        >
          <div
            class="absolute -left-1 top-[-3px] w-2 h-2 bg-[var(--btn-red-bg)] rounded-full"
          ></div>
        </div>

        <!-- Events + Tasks -->
        <div
          v-for="(item, idx) in getItemsForDay(day)"
          :key="idx"
          class="absolute flex justify-between gap-4 left-1 right-1 bg-main-bg rounded shadow p-1 text-xs border border-[var(--gray-bg)] overflow-hidden cursor-pointer"
          :style="getItemStyle(item)"
          @click="openEventPopup(item, $event)"
        >
          <div class="flex gap-2">
            <div
              class="block h-full w-[3px] rounded-sm mb-1"
              :style="{ backgroundColor: getColor(item) }"
            ></div>
            <div>
              <div class="font-semibold">{{ item.e_name || item.t_name }}</div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { format, parseISO, isSameDay } from 'date-fns'
import { useTaskStore } from '@/stores/task'
import { useEventStore } from '@/stores/event'
import EventPopup from '@/components/detail-cards/eventPopup.vue'
import { getColor } from '@/utils/colors'
import { toLocal } from '@/utils/localTime'

const taskStore = useTaskStore()
const eventStore = useEventStore()

const props = defineProps({ day: { type: Date, default: () => new Date() } })

const selectedEvent = ref(null)
const showEventPopup = ref(false)
const popupItemTop = ref(0)
const popupItemLeft = ref(0)

const hours = Array.from({ length: 24 }).map((_, i) => {
  const hour12 = i % 12 === 0 ? 12 : i % 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return `${hour12} ${ampm}`
})

const items = computed(() => {
  const tasks = taskStore.tasks.map((t) => ({
    ...t,
    get start() {
      return t.start_date ? toLocal(t.start_date) : null
    },
    get end() {
      return t.due_date ? toLocal(t.due_date) : null
    },
    get title() {
      return t.t_name
    },
    get description() {
      return t.t_description
    },
    type: 'task',
  }))

  const events = eventStore.events.map((e) => ({
    ...e,
    get start() {
      return e.start_date ? toLocal(e.start_date) : null
    },
    get end() {
      return e.end_date ? toLocal(e.end_date) : null
    },
    get title() {
      return e.e_name
    },
    get description() {
      return e.e_description || e.location
    },
    type: 'event',
    project: e.project || {},
  }))

  return [...tasks, ...events]
})

onMounted(async () => {
  await Promise.all([taskStore.fetchTasks(), eventStore.fetchEvents()])
})

const currentTimePosition = ref(0)
const HOUR_HEIGHT_PX = 48
const minuteToPx = HOUR_HEIGHT_PX / 60

function updateCurrentTimePosition() {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  currentTimePosition.value = mins * minuteToPx
}

onMounted(() => {
  updateCurrentTimePosition()
  const interval = setInterval(updateCurrentTimePosition, 60000)
  onUnmounted(() => clearInterval(interval))
})

const isToday = (date) => isSameDay(new Date(), date)
const formatTimeRange = (item) => `${format(item.start, 'HH:mm')} - ${format(item.end, 'HH:mm')}`

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
  const startMinutes = item.start.getHours() * 60 + item.start.getMinutes()
  const endMinutes = item.end.getHours() * 60 + item.end.getMinutes()
  const HOUR_ROW_REM = 3
  const minuteToRem = HOUR_ROW_REM / 60

  if (item.type === 'event') {
    const durationMinutes = Math.max(endMinutes - startMinutes, 15)
    return {
      top: `${startMinutes * minuteToRem}rem`,
      height: `${durationMinutes * minuteToRem}rem`,
    }
  } else {
    const displayStart = Math.max(endMinutes - 120, 0)
    const displayHeight = endMinutes - displayStart
    return { top: `${displayStart * minuteToRem}rem`, height: `${displayHeight * minuteToRem}rem` }
  }
}

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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
