<template>
  <CalendarLayout>
    <div class="flex gap-8 w-full">
      <!-- Left Sidebar -->
      <div class="container w-fit p-4 flex flex-col gap-4 border rounded-md">
        <!-- View Option -->
        <Option v-model="viewType" />

        <!-- Mini Calendar -->
        <Calendar />

        <!-- Add Schedule -->
        <div class="flex items-center">
          <div>Add Schedule</div>
          <button class="ml-auto btn text-main-text px-2 py-1 rounded transition" @click="openForm">
            <Plus />
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
                :style="{ backgroundColor: getProjectColor(project.id) }"
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
        <div class="flex items-center mb-4">
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
import Plus from '@/assets/icons/add.svg'

// Refs
const showForm = ref(false)
const editEventData = ref(null)
const viewType = ref('Day')
const currentDate = ref(new Date())

// Computed
const currentMonthYear = computed(() => format(currentDate.value, 'MMMM yyyy'))

// Stores
const projectStore = useProjectStore()
const eventStore = useEventStore()

// Fetch projects on mount
onMounted(() => projectStore.fetchProjects())

// Project selection
function selectProject(project) {
  projectStore.setCurrent(project)
}

// Form fields
const eventFields = computed(() => [
  { model: 'title', label: 'Title', type: 'text', required: true },
  { model: 'startDate', label: 'Start Date & Time', type: 'datetime-local', required: true },
  { model: 'endDate', label: 'End Date & Time', type: 'datetime-local', required: true },
  { model: 'location', label: 'Location', type: 'text' },
  {
    model: 'project',
    label: 'Project',
    type: 'select',
    options: projectStore.projects,
    required: true,
  },
  { model: 'description', label: 'Description', type: 'textarea' },
])

// Colors
const colors = ['#FFE578', '#FFD5DB', '#D9CBFB']
function getProjectColor(projectId) {
  return colors[projectId % colors.length]
}

// Form functions
function openForm() {
  editEventData.value = null
  showForm.value = true
}

async function handleSubmit(formData) {
  try {
    if (editEventData.value?.id) {
      await eventStore.updateEvent({ id: editEventData.value.id, ...formData })
    }
    await eventStore.fetchEvents()
  } catch (err) {
    console.error('Error saving event:', err)
  } finally {
    showForm.value = false
    editEventData.value = null
  }
}
</script>
