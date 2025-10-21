<template>
  <div class="w-full overflow-x-auto max-h-[500px] overflow-y-auto">
    <!-- Header Row (sticky) -->
    <div class="flex sticky top-0 z-10 border border-gray-800 rounded-t-md bg-white w-fit">
      <div
        class="sticky left-0 z-20 w-[240px] flex items-center h-20 bg-white border-r border-gray-800 rounded-tl-md px-2"
      >
        <select
          v-model="selectedMonthYear"
          @change="onMonthChange"
          class="text-base bg-transparent border-none"
        >
          <option v-for="(option, index) in monthYearOptions" :key="index" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="flex-1 flex" ref="headerScroll">
        <div
          v-for="(day, i) in dateRange"
          :key="i"
          class="flex flex-col justify-center items-center w-[120px] h-20 border-t-0"
          :style="isToday(day.date) ? { backgroundColor: 'rgba(198, 231, 255, 0.3)' } : {}"
        >
          <div class="day">{{ day.day }}</div>
          <div class="weekday">{{ day.weekday }}</div>
        </div>
      </div>
    </div>

    <!-- Task Rows -->
    <div>
      <div
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        class="flex relative min-h-20 border border-gray-800 w-fit"
      >
        <!-- Task Label -->
        <div
          class="sticky left-0  w-[240px] flex items-center h-20 bg-white border-r border-gray-800 rounded-bl-md"
        >
          <div class="p-2.5">{{ row.label }}</div>
        </div>

        <!-- Task Timeline -->
        <div class="flex-1 relative" :ref="setTaskRowScroll" @scroll="onScroll">
          <div class="flex relative">
            <!-- Task Bars -->
            <div
              v-for="(task, tIndex) in row.tasks || []"
              :key="tIndex"
              class="absolute top-3.5 h-[50px] ml-24 flex items-center rounded-full text-sm px-2 gap-1.5 overflow-hidden whitespace-nowrap text-ellipsis"
              :style="taskBarStyle(task)"
            >
              <img
                v-if="task.icon"
                :src="task.icon"
                class="w-[43px] h-[43px] rounded-full -ml-1.5 border-2 border-white"
              />
              <span class="task-name">{{ task.name }}</span>
            </div>

            <!-- Empty Cells -->
            <div
              v-for="(day, i) in dateRange"
              :key="`empty-${i}`"
              class="w-[120px] h-20 flex-shrink-0 border border-gray-800 border-t-0"
              :class="{ 'bg-[#C6E7FF] opacity-30': isToday(day.date) }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  rows: { type: Array, required: true },
  formatDate: {
    type: Function,
    default: (date) =>
      date
        ? new Date(date).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'TBD',
  },
})

const DAY_WIDTH = 120
const today = new Date()
const selectedMonthYear = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
)

const monthYearOptions = []
for (let i = 0; i < 12; i++) {
  const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
  monthYearOptions.push({
    value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    label: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
  })
}

const dateRange = ref([])
const taskRowScroll = ref([])
const headerScroll = ref(null)

function setTaskRowScroll(el) {
  if (el) taskRowScroll.value.push(el)
}

function computeMonthRange() {
  const [year, month] = selectedMonthYear.value.split('-')
  const startDt = new Date(year, month - 1, 1)
  const endDt = new Date(year, month, 0)
  startDt.setHours(0, 0, 0, 0)
  endDt.setHours(0, 0, 0, 0)

  const arr = []
  let current = new Date(startDt)
  while (current <= endDt) {
    arr.push({
      date: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`, // local date
      day: current.getDate(),
      weekday: current.toLocaleString('en-US', { weekday: 'short' }),
    })
    current.setDate(current.getDate() + 1)
  }
  dateRange.value = arr
}

onMounted(() => {
  computeMonthRange()
  nextTick(() => {
    if (headerScroll.value) headerScroll.value.scrollLeft = 0
    taskRowScroll.value.forEach((s) => (s.scrollLeft = 0))
  })
})

function onMonthChange() {
  computeMonthRange()
  nextTick(() => {
    if (headerScroll.value) headerScroll.value.scrollLeft = 0
    taskRowScroll.value.forEach((s) => (s.scrollLeft = 0))
  })
}

const TASK_LEFT_OFFSET = -80 // adjust this px value to move left (-ve = left, +ve = right)

function taskBarStyle(task) {
  if (!task.start || !task.end) return {}

  const startDate =
    task.start instanceof Date ? task.start.toISOString().split('T')[0] : task.start.split('T')[0]
  const endDate =
    task.end instanceof Date ? task.end.toISOString().split('T')[0] : task.end.split('T')[0]

  const startIndex = dateRange.value.findIndex((d) => d.date === startDate)
  const endIndex = dateRange.value.findIndex((d) => d.date === endDate)
  const start = startIndex >= 0 ? startIndex : 0
  const end = endIndex >= 0 ? endIndex : dateRange.value.length - 1

  return {
    left: `${start * DAY_WIDTH + TASK_LEFT_OFFSET}px`,
    width: `${(end - start + 1) * DAY_WIDTH}px`,
    background: task.color || '#FFD5DB',
    zIndex: 2,
  }
}

// Highlight today
function isToday(dateStr) {
  if (!dateStr) return false

  const today = new Date()
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day) // create local date

  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  )
}

// Sync horizontal scroll
function onScroll(e) {
  const scrollLeft = e.target.scrollLeft
  if (headerScroll.value) headerScroll.value.scrollLeft = scrollLeft
  taskRowScroll.value.forEach((s) => {
    if (s !== e.target) s.scrollLeft = scrollLeft
  })
}
</script>
