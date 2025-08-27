<template>
  <CalendarLayout>
    <div class="flex justify-between w-full gap-4">
      <!-- Left Sidebar -->
      <div class="container border border-1 w-fit p-4 flex flex-col gap-4 rounded-md">
        <!-- View Option -->
        <Option v-model="viewType" />

        <!-- Calendar Mini -->
        <Calendar />

        <!-- Add Schedule -->
        <!-- <div class="flex items-center">
          <div>Add Schedule</div>
          <button
            class="ml-auto bg-[#C6E7FF] text-black px-2 py-1 rounded hover:bg-blue-300 transition"
          >
            <img src="@/assets/icons/add.svg" alt="Add" class="w-4 h-4 inline" />
          </button>
        </div> -->

        <!-- Categories / Projects -->
        <div>
          <div class="font-semibold mb-2">Categories</div>
          <ul class="flex flex-col gap-2">
            <li
              v-for="project in projectStore.projects"
              :key="project.id"
              class="flex items-center gap-2"
            >
              <!-- Colored Circle -->
              <div
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: getRandomColor(project.id) }"
              ></div>

              <!-- Project Name -->
              <div class="px-2 py-1 cursor-pointer" @click="selectProject(project)">
                {{ project.p_name }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main Calendar View -->
      <div class="flex-1">
        <div class="flex mb-4 items-center">
          <h2 class="text-2xl font-semibold mr-4">{{ currentMonthYear }}</h2>
        </div>

        <!-- Conditional Calendar Views -->
        <DayCalendar v-if="viewType === 'Day'" />
        <WeekCalendar v-else-if="viewType === 'Week'" />
        <MonthCalendar v-else-if="viewType === 'Month'" />
      </div>
    </div>
  </CalendarLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'

// Components
import CalendarLayout from './calendarLayout.vue'
import MonthCalendar from '@/components/monthCalendar.vue'
import WeekCalendar from '@/components/weekCalendar.vue'
import DayCalendar from '@/components/dayCalendar.vue'
import Option from '@/components/option.vue'
import Calendar from '@/components/calendar.vue'

// Pinia Store
import { useProjectStore } from '@/stores/project'

const viewType = ref('Day')

// Reactive current date
const currentDate = ref(new Date())

// Computed month & year
const currentMonthYear = computed(() => format(currentDate.value, 'MMMM yyyy'))

// Project store
const projectStore = useProjectStore()

// Fetch projects on mount
onMounted(() => {
  projectStore.fetchProjects()
})

// Select a project (set current in store)
function selectProject(project) {
  projectStore.setCurrent(project)
}

const props = defineProps({
  viewType: {
    type: String,
    default: 'Day',
  },
})
// Define your three colors
const colors = ['#FFE578', '#FFD5DB', '#D9CBFB']

// Return a "random" color based on project id (so it stays consistent)
function getRandomColor(projectId) {
  // Simple hash to map id to a color index
  const index = projectId % colors.length
  return colors[index]
}
</script>
