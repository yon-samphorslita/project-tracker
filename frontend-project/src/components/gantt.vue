<template>
  <div class="gantt-container">
    <!-- Header Row -->
    <div class="gantt-header">
      <div class="gantt-header-cell task-column sticky-column">
        <select id="monthYear" v-model="selectedMonthYear" @change="onMonthChange">
          <option v-for="(option, index) in monthYearOptions" :key="index" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="gantt-header-scroll" ref="headerScroll">
        <div class="gantt-header-content">
          <div v-for="(day, i) in dateRange" :key="i" class="gantt-header-cell">
            <div class="day">{{ day.day }}</div>
            <div class="weekday">{{ day.weekday }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Rows -->
    <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="gantt-row">
      <div class="gantt-row-label sticky-column">
        <div class="label">
          {{ row.label }}
        </div>
      </div>

      <div class="gantt-row-cells-scroll" :ref="setTaskRowScroll" @scroll="onScroll">
        <div class="gantt-row-content">
          <!-- Task bars -->
          <div
            v-for="(task, tIndex) in row.tasks || []"
            :key="tIndex"
            class="gantt-task"
            :style="taskBarStyle(task)"
          >
            <img v-if="task.icon" :src="task.icon" class="task-icon" />
            <span class="task-name">{{ task.name }}</span>
          </div>

          <!-- Empty cells to match header -->
          <div v-for="(day, i) in dateRange" :key="`empty-${i}`" class="gantt-cell"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({ rows: { type: Array, required: true } })

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
      date: current.toISOString().split('T')[0],
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
  const startIndex = dateRange.value.findIndex((d) => d.date === task.start.split('T')[0])
  const endIndex = dateRange.value.findIndex((d) => d.date === task.end.split('T')[0])
  const start = startIndex >= 0 ? startIndex : 0
  const end = endIndex >= 0 ? endIndex : dateRange.value.length - 1

  const left = start * DAY_WIDTH + TASK_LEFT_OFFSET
  const width = (end - start + 1) * DAY_WIDTH

  return {
    left: `${left}px`,
    width: `${width}px`,
    background: task.color || '#FFD5DB',
    zIndex: 2,
  }
}

function onScroll(e) {
  const scrollLeft = e.target.scrollLeft
  if (headerScroll.value) headerScroll.value.scrollLeft = scrollLeft
  taskRowScroll.value.forEach((s) => {
    if (s !== e.target) s.scrollLeft = scrollLeft
  })
}
</script>

<style scoped>
.gantt-container {
  font-family: sans-serif;
  width: 100%;
}

/* Header */
.gantt-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 3;
  border: 1px solid rgba(56, 56, 56, 0.8);
  border-radius: 5px 5px 0 0;
}
.gantt-header-scroll {
  overflow-x: hidden;
  flex: 1;
}
.gantt-header-content {
  display: flex;
}
.gantt-header-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 120px;
  width: 120px;
  max-width: 120px;
  height: 80px;
  border: 1px solid transparent;
}
#monthYear {
  font-size: 16px;
  border: none;
  background-color: transparent;
}
/* Sticky label column */
.task-column.sticky-column,
.gantt-row-label.sticky-column {
  position: sticky;
  left: 0;
  z-index: 5;
  min-width: 120px;
  width: 120px;
  max-width: 120px;
  display: flex;
  align-items: center;
  height: 80px;
}
.label {
  margin-left: 30px;
}
/* Rows */
.gantt-row {
  display: flex;
  position: relative;
  min-height: 80px;
  border: 1px solid rgba(56, 56, 56, 0.8);
  border-radius: 0 0 5px 5px;
}
.gantt-row-cells-scroll {
  overflow-x: auto;
  flex: 1;
  position: relative;
}
.gantt-row-content {
  display: flex;
  position: relative;
}

/* Cells */
.gantt-cell {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  height: 80px;
  flex-shrink: 0;
  border: 0.5px solid rgba(56, 56, 56, 0.8);
  border-top-style: none;
}

/* Task bars */
.gantt-task {
  position: absolute;
  top: 15px;
  height: 50px;
  display: flex;
  align-items: center;
  border-radius: 50px;
  font-size: 14px;
  padding: 0 8px;
  gap: 6px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.task-icon {
  width: 43px;
  height: 43px;
  border-radius: 50%;
  margin-left: -6px;
  border: 2px solid white;
}
</style>
