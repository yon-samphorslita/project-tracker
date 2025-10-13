<template>
  <CalendarLayout>
    <div class="flex justify-between w-full gap-4 pt-6">
      <!-- Left Sidebar -->
      <div class="container border border-1 w-fit p-4 flex flex-col gap-4 rounded-md">
        <!-- View Option -->
        <Option v-model="viewType" />

        <!-- Calendar Mini -->
        <Calendar />

        <!-- Add Schedule -->
        <div class="flex items-center">
          <div>Add Schedule</div>
          <button
            class="ml-auto bg-[#C6E7FF] text-black px-2 py-1 rounded hover:bg-blue-300 transition"
            @click="openForm"
          >
            <img src="@/assets/icons/add.svg" alt="Add" class="w-4 h-4 inline" />
          </button>
          <Form
            v-model:modelValue="showForm"
            formTitle="Schedule Event"
            :fields="eventFields"
            :initialData="editEventData"
            endpoint="events"
            @submitted="handleSubmit"
          />
        </div>

        <!-- Categories / Projects -->
        <div>
          <div class="font-semibold mb-2">Categories</div>
          <ul class="flex flex-col gap-2 h-[200px] overflow-y-scroll">
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
import { useEventStore } from '@/stores/event'
import { useProjectStore } from '@/stores/project'
import Form from '@/components/form.vue'
import CalendarLayout from './pageLayout.vue'
import MonthCalendar from '@/components/monthCalendar.vue'
import WeekCalendar from '@/components/weekCalendar.vue'
import DayCalendar from '@/components/dayCalendar.vue'
import Option from '@/components/option.vue'
import Calendar from '@/components/calendar.vue'

const showForm = ref(false)
const editEventData = ref(null)
const viewType = ref('Day')
const currentDate = ref(new Date())
const currentMonthYear = computed(() => format(currentDate.value, 'MMMM yyyy'))
const projectStore = useProjectStore()
const eventStore = useEventStore()
// Fetch projects on mount
onMounted(() => {
  projectStore.fetchProjects()
})

// Select a project (set current in store)
function selectProject(project) {
  projectStore.setCurrent(project)
}

const eventFields = computed(() => [
  { model: 'title', label: 'Title', type: 'text', required: true },
  { model: 'startDate', label: 'Start Date & Time', type: 'datetime-local', required: true },
  { model: 'endDate', label: 'End Date & Time', type: 'datetime-local', required: true },
  { model: 'location', label: 'Location', type: 'text' },
  {
    model: 'projectId',
    label: 'Project',
    type: 'select',
    options: projectStore.projects, // now reactive
    required: true,
  },
  { model: 'description', label: 'Description', type: 'textarea' },
])

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
function openForm() {
  editEventData.value = null
  showForm.value = true
}
async function handleSubmit(formUser) {
  try {
    if (editEventData.value?.id) {
      await eventStore.updateEvent({ id: editEventData.value.id, ...formUser })
    }
    await eventStore.fetchEvents()
  } catch (err) {
    console.error('Error saving user:', err)
  } finally {
    showForm.value = false
    editEventData.value = null
  }
}
</script>
