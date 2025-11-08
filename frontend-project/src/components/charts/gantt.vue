<template>
  <div class="relative w-full">
    <!-- Top header row -->
    <div
      class="flex rounded-t-md sticky top-0 z-10 bg-blue-bg border border-b-0 border-[var(--main-border)]"
    >
      <!-- Task label column -->
      <div
        class="w-[280px] border-r border-[var(--main-border)] bg-blue-bg rounded-tl-md flex justify-center items-end sticky left-0 z-10 h-[60px]"
      >
        <span class="font-semibold text-lg">{{ title }}</span>
      </div>

      <!-- Week navigation -->
      <div class="flex-1 flex items-center justify-between px-4 h-[60px]">
        <button @click="prevWeek" class="text-xl font-bold">‹</button>
        <span class="font-semibold text-lg">Week: {{ weekLabel(currentWeek) }}</span>
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
        <div class="flex border-b border-[var(--main-border)]">
          <div
            class="w-[280px] border-r border-[var(--main-border)] bg-blue-bg sticky left-0 z-10"
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
            class="w-[280px] flex-shrink-0 border-r border-[var(--main-border)] py-4 px-3 sticky left-0 bg-main-bg z-20 font-medium"
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
                zIndex: isPast(task.end) ? 1 : 10,
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
  title: { type: String, default: 'Gantt Chart' },
})

/* Constants */
const columnWidth = 113
const stickyWidth = 280
const taskRowHeight = 48
const taskGap = 4
const today = new Date()
const outerScroll = ref(null)

/* Week generation (Mon–Sun) */
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

/* Date helpers */
const isWeekend = (d) => [0, 6].includes(d.getDay())
const isToday = (d) => d.toDateString() === today.toDateString()
const isPast = (endDate) => (endDate ? new Date(endDate).setHours(23, 59, 59, 999) < today : false)

/* Task positioning */
const getTaskOffset = (startDate) => {
  if (!startDate) return stickyWidth
  const start = new Date(startDate)
  const firstDay = new Date(allDays.value[0])
  firstDay.setHours(0, 0, 0, 0)
  const diffDays = (start - firstDay) / (1000 * 60 * 60 * 24) - 2.5
  return stickyWidth + diffDays * columnWidth
}

const getTaskWidth = (startDate, endDate) => {
  if (!startDate || !endDate) return 100
  const diffDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  return Math.max(diffDays * columnWidth, 100)
}

const getRandomColor = () => {
  const styles = getComputedStyle(document.documentElement)
  const colors = []
  for (let i = 1; i <= 10; i++) {
    const v = styles.getPropertyValue(`--random-color-${i}`).trim()
    if (v) colors.push(v)
  }
  return colors[Math.floor(Math.random() * colors.length)]
}

/* Row heights */
const rowHeight = (tasks) => {
  return (tasks?.filter((t) => !isPast(t.end)).length || 1) * (taskRowHeight + taskGap) + taskGap
}

/* Task stacking */
const tasksBefore = (task, tasks) => {
  if (isPast(task.end)) return 0
  const futureTasks = tasks.filter((t) => !isPast(t.end))
  return futureTasks.findIndex((t) => t === task)
}

/* Week navigation */
const selectedWeekIndex = ref(weeks.value.findIndex((w) => w.days.some(isToday)) || 0)
const currentWeek = computed(() => weeks.value[selectedWeekIndex.value])
const isProgrammaticScroll = ref(false)

const scrollToWeek = (index) => {
  const week = weeks.value[index]
  if (!week) return
  const firstDay = week.days[0]
  const dayIndex = allDays.value.findIndex((d) => d.toDateString() === firstDay.toDateString())
  if (outerScroll.value) {
    isProgrammaticScroll.value = true
    outerScroll.value.scrollTo({ left: dayIndex * columnWidth, behavior: 'smooth' })
    setTimeout(() => (isProgrammaticScroll.value = false), 600)
  }
}

const prevWeek = () => {
  if (selectedWeekIndex.value > 0) {
    selectedWeekIndex.value--
    scrollToWeek(selectedWeekIndex.value)
  }
}
const nextWeek = () => {
  if (selectedWeekIndex.value < weeks.value.length - 1) {
    selectedWeekIndex.value++
    scrollToWeek(selectedWeekIndex.value)
  }
}

const onScroll = () => {
  if (!outerScroll.value || isProgrammaticScroll.value) return
  const dayIndex = Math.floor(outerScroll.value.scrollLeft / columnWidth)
  if (dayIndex >= 0 && dayIndex < allDays.value.length) {
    const currentDayTime = allDays.value[dayIndex].getTime()
    const weekIndex = weeks.value.findIndex((w) =>
      w.days.some((d) => d.getTime() === currentDayTime),
    )
    if (weekIndex >= 0 && weekIndex !== selectedWeekIndex.value) selectedWeekIndex.value = weekIndex
  }
}

/* Auto-scroll to current week */
onMounted(() => {
  const index = weeks.value.findIndex((w) => w.days.some(isToday))
  if (index >= 0) {
    selectedWeekIndex.value = index
    scrollToWeek(index)
  }
})

/* Week label helper */
const weekLabel = (w) => {
  if (!w?.days?.length) return ''
  const options = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${w.days[0].toLocaleDateString(undefined, options)} - ${w.days[w.days.length - 1].toLocaleDateString(undefined, options)}`
}
</script>
