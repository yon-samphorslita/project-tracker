<template>
  <CalendarLayout>
    <div class="flex flex-col gap-8 w-full">
      <!-- Admin Dashboard (cards + charts) -->
      <div v-if="userRole === 'admin'">
        <!-- Top Overview Section -->
        <div class="grid grid-cols-2 gap-8">
          <div class="grid grid-cols-2 gap-8">
            <OverviewCard title="Total Projects" :value="projectStore.projects.length" />
            <OverviewCard title="Total Events" :value="eventStore.events.length" />
            <OverviewCard title="Active Teams" :value="teamStore.teams.length" />
            <OverviewCard title="Upcoming Events" :value="upcomingEventsCount" />
          </div>

          <!-- Pie Chart -->
          <PieChart :data="pieChartData" :height="260" :title="'Event Distribution by Project'" />
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-2 gap-8 pt-6">
          <BarChart
            :title="'Event Count by User'"
            :labels="eventBarChart.labels"
            :datasets="eventBarChart.datasets"
          />
          <BarChart
            :title="'Team Workload Overview'"
            :labels="teamBarChart.labels"
            :datasets="teamBarChart.datasets"
          />
        </div>
      </div>

      <!-- Calendar & Sidebar (all users) -->
      <div class="flex gap-8 w-full">
        <!-- Left Sidebar -->
        <div class="container w-fit p-4 flex flex-col gap-4 border rounded-md">
          <Option v-model="viewType" />
          <Calendar />

          <!-- Add Schedule -->
          <div class="flex items-center">
            <div>Add Schedule</div>
            <button
              class="ml-auto btn text-main-text px-2 py-1 rounded transition"
              @click="openForm"
            >
              <Plus />
            </button>

            <Form
              v-model:modelValue="showForm"
              formTitle="Schedule Event"
              :fields="eventFields"
              :initialData="eventData"
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
                <div
                  class="w-2 h-2 rounded-full"
                  :style="{ backgroundColor: getProjectColor(project.id) }"
                ></div>
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

          <DayCalendar v-if="viewType === 'Day'" />
          <WeekCalendar v-else-if="viewType === 'Week'" />
          <MonthCalendar v-else-if="viewType === 'Month'" />
        </div>
      </div>
    </div>
  </CalendarLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'

import { useAuthStore } from '@/stores/auth'
import { useEventStore } from '@/stores/event'
import { useProjectStore } from '@/stores/project'
import { useTeamStore } from '@/stores/team'
import { useTaskStore } from '@/stores/task'
import { getRandomColors } from '@/utils/colors'

import Form from '@/components/forms/form.vue'
import CalendarLayout from '@/views/pageLayout.vue'
import MonthCalendar from '@/components/calendars/monthCalendar.vue'
import WeekCalendar from '@/components/calendars/weekCalendar.vue'
import DayCalendar from '@/components/calendars/dayCalendar.vue'
import Option from '@/components/option.vue'
import Calendar from '@/components/calendars/calendar.vue'
import Plus from '@/assets/icons/add.svg'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import PieChart from '@/components/charts/pieChart.vue'
import BarChart from '@/components/charts/barChart.vue'

// Stores
const authStore = useAuthStore()
const eventStore = useEventStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()
const taskStore = useTaskStore()

// Role
const userRole = computed(() => authStore.user?.role || 'user')

// Calendar & Form state
const showForm = ref(false)
const eventData = ref(null)
const viewType = ref('Month')
const currentDate = ref(new Date())
const currentMonthYear = computed(() => format(currentDate.value, 'MMMM yyyy'))

// Chart state
const teamBarChart = ref({ labels: [], datasets: [] })
const eventBarChart = ref({ labels: [], datasets: [] })

// Fetch Team Workload
const fetchTeamWorkload = async () => {
  const colors = getRandomColors()
  await teamStore.fetchTeams() // make sure teams are loaded

  const labels = []
  const totalData = []
  const completedData = []

  teamStore.teams.forEach((team) => {
    labels.push(team.name || `Team ${team.id}`)
    const members = [...(team.members || []), ...(team.mainMembers || [])]

    const tasks = taskStore.tasks.filter((t) =>
      members.some((m) => t.user?.id === m.id || t.assigned_to?.id === m.id),
    )

    totalData.push(tasks.length)
    completedData.push(
      tasks.filter((t) => ['completed'].includes((t.t_status || t.status || '').toLowerCase()))
        .length,
    )
  })

  teamBarChart.value = {
    labels,
    datasets: [
      { label: 'Completed Tasks', data: completedData },
      { label: 'Total Tasks', data: totalData },
    ],
  }
}

// Fetch Event Chart
const fetchEventChart = (eventData) => {
  const { labels = [], data = [] } = eventData || {}
  eventBarChart.value = {
    labels,
    datasets: [{ label: 'Event Count', data }],
  }
}

// Computed & Helpers
const adminBarChartData = computed(() => {
  if (!eventStore.adminEventSummary.length) return { labels: [], data: [] }
  return {
    labels: eventStore.adminEventSummary.map((e) => e.userName),
    data: eventStore.adminEventSummary.map((e) => e.eventCount),
  }
})

const pieChartData = computed(() => {
  const counts = {}
  eventStore.events.forEach((event) => {
    const projectName = event.project?.p_name || 'Unassigned'
    counts[projectName] = (counts[projectName] || 0) + 1
  })
  return Object.entries(counts).map(([type, value]) => ({ type, value }))
})

const upcomingEventsCount = computed(() => {
  const now = new Date()
  return eventStore.events.filter((event) => new Date(event.start_date) >= now).length
})

const eventFields = computed(() => [
  { model: 'title', label: 'Title', type: 'text', required: true },
  { model: 'startDate', label: 'Start Date & Time', type: 'datetime-local', required: true },
  { model: 'endDate', label: 'End Date & Time', type: 'datetime-local', required: true },
  {
    model: 'project',
    label: 'Project',
    type: 'select',
    options: projectStore.projects,
  },
  { model: 'location', label: 'Location', type: 'text' },
  { model: 'description', label: 'Description', type: 'textarea' },
])

function openForm() {
  eventData.value = null
  showForm.value = true
}

async function handleSubmit() {
  await eventStore.fetchEvents()
}

// Project colors
const colors = getRandomColors()
function getProjectColor(projectId) {
  return colors[projectId % colors.length]
}

// Watchers
watch(() => taskStore.tasks, fetchTeamWorkload, { deep: true })
watch(
  () => eventStore.adminEventSummary,
  () => fetchEventChart(adminBarChartData.value),
)

// Initial fetch
onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects(),
    eventStore.fetchEvents(),
    teamStore.fetchTeams(),
    taskStore.fetchTasks(),
  ])
  if (userRole.value === 'admin') {
    await eventStore.fetchAdminEventSummary()
  }
  fetchTeamWorkload()
  fetchEventChart(adminBarChartData.value)
})
</script>
