<template>
  <div class="relative w-full">
    <!-- Top header row -->
    <div
      class="flex rounded-t-md sticky top-0 z-30 bg-blue-bg border border-b-0 border-[var(--main-border)]"
    >
      <!-- Task label column -->
      <div
        class="w-[280px] border-r border-[var(--main-border)] bg-blue-bg rounded-tl-md flex flex-col justify-end items-center sticky left-0 z-40 h-[60px]"
      >
        <span class="font-semibold text-lg">Tasks</span>
      </div>
      <!-- Week navigation -->
      <div class="flex-1 flex items-center justify-between px-4 h-[60px]">
        <button @click="prevWeek" class="text-xl font-bold">‹</button>
        <span class="font-semibold text-lg"> Week: {{ weekLabel(currentWeek) }} </span>
        <button @click="nextWeek" class="text-xl font-bold">›</button>
      </div>
    </div>

    <!-- Scrollable grid -->
    <div
      ref="outerScroll"
      class="overflow-x-auto border border-t-0 border-[var(--main-border)] rounded-b-md relative bg-main-bg"
      @scroll="onScroll"
    >
      <div
        ref="innerGrid"
        class="min-w-max relative"
        :style="{ width: `${allDays.length * columnWidth + stickyWidth}px` }"
      >
        <!-- Day headers -->
        <div class="flex border-b border-[var(--main-border)] bg-[var(--gray-bg)]">
          <div
            class="w-[280px] border-r border-[var(--main-border)] bg-blue-bg sticky left-0 z-20"
          ></div>
          <div class="flex">
            <div
              v-for="day in allDays"
              :key="day.toISOString()"
              class="w-[113px] flex items-center justify-center border-r border-t border-[var(--main-border)] text-lg"
              :class="{
                'bg-[var(--gray-bg)]': isWeekend(day) && !isToday(day),
                'bg-blue-bg opacity-40 font-bold': isToday(day),
              }"
            >
              {{ day.getDate() }}
            </div>
          </div>
        </div>

        <!-- Task rows -->
        <div
          v-for="(row, i) in rows"
          :key="i"
          class="flex border-b border-[var(--main-border)] relative"
          :style="{ height: `${rowHeight(row.tasks)}px` }"
        >
          <!-- Task label column -->
          <div
            class="w-[280px] flex-shrink-0 border-r border-[var(--main-border)] py-4 px-3 sticky left-0 bg-main-bg z-10 font-medium"
          >
            {{ row.label }}
          </div>

          <!-- Task cells -->
          <div class="flex relative w-full">
            <div
              v-for="day in allDays"
              :key="day.toISOString()"
              class="w-[113px] border-r border-[var(--main-border)]"
              :class="{
                'bg-[var(--gray-bg)]': isWeekend(day) && !isToday(day),
                'bg-blue-bg opacity-40 font-bold': isToday(day),
              }"
            ></div>

            <!-- Task bars -->
            <div
              v-for="(task, j) in row.tasks || []"
              :key="j"
              class="absolute h-12 flex items-center mt-1 rounded-full px-2 gap-1.5 overflow-hidden whitespace-nowrap text-ellipsis"
              :style="{
                top: `${tasksBefore(task, row.tasks) * (taskRowHeight + taskGap)}px`,
                left: `${getTaskOffset(task.start)}px`,
                width: `${getTaskWidth(task.start, task.end)}px`,
                backgroundColor: getRandomColor(),
                opacity: isPast(task.end) ? 0.5 : 1,
              }"
            >
              <img
                v-if="task.icon"
                :src="task.icon"
                class="w-10 h-10 rounded-full -ml-1.5 border-2 border-white"
              />
              <span class="task-name text-black text-md font-medium">{{ task.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
})

const columnWidth = 113
const minColumnWidth = 100
const stickyWidth = 280
const taskRowHeight = 48
const today = new Date()
const outerScroll = ref(null)
const taskGap = 4

// Generate weeks (Mon–Sun)
const weeks = computed(() => {
  const result = []
  const current = new Date(today)
  current.setHours(0, 0, 0, 0)
  let dayOfWeek = current.getDay()
  if (dayOfWeek === 0) dayOfWeek = 7
  current.setDate(current.getDate() - (dayOfWeek - 1))
  const startDate = new Date(current)
  for (let w = 0; w < 9; w++) {
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      weekDays.push(new Date(startDate))
      startDate.setDate(startDate.getDate() + 1)
    }
    result.push({ days: weekDays })
  }
  return result
})

const allDays = computed(() => weeks.value.flatMap((w) => w.days))

const currentDay = today.getDate()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()

function monthName(m) {
  return new Date(currentYear, m, 1).toLocaleString('default', { month: 'short' })
}
function formatDate(d) {
  return `${d.getDate()} ${monthName(d.getMonth())}, ${d.getFullYear()}`
}
function weekLabel(w) {
  if (!w || !w.days?.length) return ''
  const start = w.days[0],
    end = w.days[w.days.length - 1]
  return `${formatDate(start)} - ${formatDate(end)}`
}
function isWeekend(d) {
  const dow = d.getDay()
  return dow === 0 || dow === 6
}
function isToday(d) {
  return (
    d.getDate() === currentDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  )
}
function isPast(endDate) {
  if (!endDate) return false
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  return end < today
}
function getTaskOffset(startDate) {
  if (!startDate) return stickyWidth
  const start = new Date(startDate)
  const diffDays = Math.floor((start - allDays.value[0]) / (24 * 60 * 60 * 1000))
  return stickyWidth + diffDays * columnWidth
}
function getTaskWidth(startDate, endDate) {
  if (!startDate || !endDate) return minColumnWidth
  const diffMs = new Date(endDate) - new Date(startDate)
  const diffDays = diffMs / (24 * 60 * 60 * 1000)
  return Math.max(diffDays * columnWidth, minColumnWidth)
}
function getRandomColor() {
  const styles = getComputedStyle(document.documentElement)
  const colors = []
  for (let i = 1; i <= 10; i++) {
    const v = styles.getPropertyValue(`--random-color-${i}`).trim()
    if (v) colors.push(v)
  }
  return colors[Math.floor(Math.random() * colors.length)]
}

// Row height based on future/current tasks only
function rowHeight(tasks) {
  if (!tasks || tasks.length === 0) return taskRowHeight
  const futureCount = tasks.filter((t) => !isPast(t.end)).length
  return Math.max(futureCount, 1) * (taskRowHeight + taskGap) + taskGap
}

// Count of tasks before this one (stacking future tasks)
function tasksBefore(task, tasks) {
  return tasks.filter((t) => !isPast(t.end)).findIndex((t) => t === task)
}

// Week navigation
const selectedWeekIndex = ref(weeks.value.findIndex((w) => w.days.some(isToday)) || 0)
const currentWeek = computed(() => weeks.value[selectedWeekIndex.value])
const isProgrammaticScroll = ref(false)

function scrollToWeek(index) {
  const week = weeks.value[index]
  if (!week) return
  const firstDay = week.days[0]
  const dayIndex = allDays.value.findIndex(
    (d) =>
      d.getDate() === firstDay.getDate() &&
      d.getMonth() === firstDay.getMonth() &&
      d.getFullYear() === firstDay.getFullYear(),
  )
  const left = dayIndex * columnWidth
  if (outerScroll.value) {
    isProgrammaticScroll.value = true
    outerScroll.value.scrollTo({ left, behavior: 'smooth' })
    setTimeout(() => (isProgrammaticScroll.value = false), 600)
  }
}
function prevWeek() {
  if (selectedWeekIndex.value > 0) {
    selectedWeekIndex.value--
    scrollToWeek(selectedWeekIndex.value)
  }
}
function nextWeek() {
  if (selectedWeekIndex.value < weeks.value.length - 1) {
    selectedWeekIndex.value++
    scrollToWeek(selectedWeekIndex.value)
  }
}

// Scroll sync
function onScroll() {
  if (!outerScroll.value || isProgrammaticScroll.value) return
  const scrollLeft = outerScroll.value.scrollLeft
  const dayIndex = Math.floor(scrollLeft / columnWidth)
  if (dayIndex >= 0 && dayIndex < allDays.value.length) {
    const currentDayTime = allDays.value[dayIndex].getTime()
    const weekIndex = weeks.value.findIndex((w) =>
      w.days.some((d) => d.getTime() === currentDayTime),
    )
    if (weekIndex >= 0 && weekIndex !== selectedWeekIndex.value) selectedWeekIndex.value = weekIndex
  }
}

// Auto-scroll to current week
onMounted(() => {
  const index = weeks.value.findIndex((w) => w.days.some(isToday))
  if (index >= 0) {
    selectedWeekIndex.value = index
    scrollToWeek(index)
  }
})
</script>
