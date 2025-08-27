<template>
  <div
    class="calendar-frame max-w-[420px] shadow-[0_2px_12px_rgba(0,0,0,0.1)] border overflow-x-auto p-4 rounded-xl border-solid border-[#e6e6e6]"
  >
    <div class="vue-calendar max-w-[400px] mx-auto my-0 pb-4 rounded-[10px]">
      <!-- Header -->
      <header class="vc-header flex items-center justify-between mb-2 px-0 py-3" v-if="showHeader">
        <button
          class="vc-btn prev text-[22px] cursor-pointer w-10 text-[#222] border-[none]"
          @click="changeMonth(-1)"
        >
          ‹
        </button>
        <div class="vc-title-bg flex-1 flex justify-center">
          <span
            class="vc-title bg-[#c6e7ff] w-[90%] text-center font-semibold text-base px-0 py-2 rounded-lg"
            >{{ monthName }} {{ displayYear }}</span
          >
        </div>
        <button
          class="vc-btn nex text-[22px] cursor-pointer w-10 text-[#222] border-[none]t"
          @click="changeMonth(1)"
        >
          ›
        </button>
      </header>

      <!-- Weekdays -->
      <div class="vc-weekdays-row bg-[#c6e7ff] flex mb-2.5 rounded-[5px]">
        <div
          v-for="d in weekdayNames"
          :key="d"
          class="vc-weekday flex-1 text-center text-[15px] text-[#222] font-medium px-0 py-2"
        >
          {{ d }}
        </div>
      </div>

      <!-- Calendar Rows -->
      <div class="vc-rows flex flex-col gap-2.5">
        <div
          v-for="(week, wIdx) in weeks"
          :key="wIdx"
          class="vc-row flex gap-2.5 relative rounded-[5px]"
        >
          <!-- background layer with opacity -->
          <div
            class="vc-row-bg absolute z-0 rounded-[5px] inset-0"
            :style="{ backgroundColor: '#C6E7FF', opacity: 0.9 - wIdx * 0.1 }"
          ></div>

          <!-- days -->
          <div
            v-for="cell in week"
            :key="cell.key"
            class="vc-day flex-1 h-8 min-w-[34px] flex items-center justify-center relative cursor-default z-[1] rounded-md"
            :class="{
              'vc-day--other opacity-[0.45]': cell.otherMonth,
              'vc-day--today w-9 h-9 flex items-center justify-center font-semibold rounded-[100px] border-2 border-solid border-[black]':
                cell.isToday,
            }"
          >
            <div class="vc-day-num text-[15px] font-medium">{{ cell.date.getDate() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Date, default: () => new Date() },
  events: { type: Array, default: () => [] },
  startWeekOnMonday: { type: Boolean, default: false },
  locale: { type: String, default: navigator.language || 'en-US' },
  showHeader: { type: Boolean, default: true },
  maxEventDots: { type: Number, default: 3 },
})

const emit = defineEmits(['update:modelValue', 'date-click', 'month-change'])

const internalValue = ref(new Date(props.modelValue))
watch(
  () => props.modelValue,
  (v) => (internalValue.value = new Date(v)),
)

const displayDate = ref(
  new Date(internalValue.value.getFullYear(), internalValue.value.getMonth(), 1),
)
watch(internalValue, (v) => {
  displayDate.value = new Date(v.getFullYear(), v.getMonth(), 1)
})

const monthName = computed(() => displayDate.value.toLocaleString(props.locale, { month: 'long' }))
const displayYear = computed(() => displayDate.value.getFullYear())

function changeMonth(delta) {
  displayDate.value = new Date(
    displayDate.value.getFullYear(),
    displayDate.value.getMonth() + delta,
    1,
  )
  emit('month-change', {
    year: displayDate.value.getFullYear(),
    month: displayDate.value.getMonth() + 1,
  })
}

const weekdayNames = computed(() => {
  const base = new Date(1970, 0, 4) // Sunday Jan 4 1970
  return Array.from({ length: 7 }).map((_, i) =>
    new Date(base.getTime() + i * 86400000).toLocaleString(props.locale, {
      weekday: 'short',
    }),
  )
})

function firstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}
function lastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}
function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const calendarCells = computed(() => {
  const first = firstDayOfMonth(displayDate.value)
  const last = lastDayOfMonth(displayDate.value)

  const startIdx = first.getDay()
  const daysBefore = startIdx
  const totalDays = daysBefore + last.getDate()
  const rows = Math.ceil(totalDays / 7)
  const cellCount = rows * 7

  return Array.from({ length: cellCount }).map((_, i) => {
    const dayNumber = i - daysBefore + 1
    const date = new Date(displayDate.value.getFullYear(), displayDate.value.getMonth(), dayNumber)
    return {
      key: date.toISOString(),
      date,
      otherMonth: date.getMonth() !== displayDate.value.getMonth(),
      isToday: isSameDay(date, new Date()),
    }
  })
})

const weeks = computed(() => {
  const arr = []
  for (let i = 0; i < calendarCells.value.length; i += 7) {
    arr.push(calendarCells.value.slice(i, i + 7))
  }
  return arr
})
</script>
