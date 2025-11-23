<template>
  <DashboardLayout>
    <div class="flex flex-col">
      <div class="flex gap-6">
        <!-- left side: project overview, charts, recent projects -->
        <div class="w-2/3 flex flex-col items-start gap-6">
          <div class="flex flex-col gap-4 mb-2 w-full">
            <div class="text-xl font-semibold">Project Overview</div>
            <div class="grid grid-cols-3 gap-6 w-full">
              <OverviewCard title="Total Projects" :value="totalProjects" />
              <OverviewCard title="Overdue Projects" :value="overdueProjects" />
              <OverviewCard title="Completed Projects" :value="completedProjects" />
            </div>
          </div>

          <!-- project and task status charts -->
          <div class="flex w-full gap-10 my-2">
            <PieChart :data="projectStatus" :height="280" :title="'Total Projects'" />
            <PieChart :data="taskStatus" :height="280" :title="'Total Tasks'" />
          </div>

          <!-- showcase recent project's status -->
          <div class="w-full my-2">
            <div class="text-xl font-semibold mb-2">Top 3 Priority Projects</div>
            <div>
              <ProjectOverview
                v-if="projectStore.projects.length && taskStore.tasks.length"
                :projects="projectStore.projects"
                :tasks="taskStore.tasks"
              />
              <div v-else>Loading projects...</div>
            </div>
          </div>
        </div>

        <!-- right side: date & time, calendar -->
        <div class="w-1/3 flex flex-col gap-4">
          <div
            class="flex flex-col justify-end items-center gap-4 p-4 bg-blue-bg rounded-xl shadow-md"
          >
            <!-- Date Information -->
            <div
              class="flex flex-col items-center justify-center gap-2 w-64 h-24 bg-[var(--gray50-bg)] rounded-xl shadow-md border border-gray-200"
            >
              <div class="text-gray-800 text-3xl font-bold tracking-wide">{{ weekday }}</div>
              <div class="text-sub-text text-lg font-medium">{{ formattedDate }}</div>
            </div>

            <!-- Digital Clock with Flip Animation -->
            <div
              class="flex items-center justify-center gap-4 p-6 bg-[var(--gray50-bg)] rounded-xl shadow-md"
            >
              <!-- Hours -->
              <div class="flex gap-1">
                <FlipDigit :digit="hours[0]" />
                <FlipDigit :digit="hours[1]" />
              </div>
              <div class="text-3xl font-bold text-gray-text">:</div>

              <!-- Minutes -->
              <div class="flex gap-1">
                <FlipDigit :digit="minutes[0]" />
                <FlipDigit :digit="minutes[1]" />
              </div>

              <!-- AM/PM -->
              <div class="text-2xl font-bold text-gray-text">{{ ampm }}</div>
            </div>
          </div>

          <div class="flex justify-end">
            <Calendar class="w-[700px]" />
          </div>
        </div>
      </div>

      <div class="py-6">
        <div class="text-xl font-semibold mb-3">Project Timeline</div>
        <GanttChart title="Projects" :rows="ganttRows" :format-date="formatDate" />
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DashboardLayout from '@/views/pageLayout.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import PieChart from '@/components/charts/pieChart.vue'
import Calendar from '@/components/calendars/calendar.vue'
import FlipDigit from '@/components/flipDigit.vue'
import ProjectOverview from '@/components/detail-cards/projectOverview.vue'
import GanttChart from '@/components/charts/gantt.vue'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const currentTime = ref(new Date())
let timer: ReturnType<typeof setInterval>

const totalProjects = computed(() => projectStore.projects.length)

const overdueProjects = computed(() => {
  const today = new Date()
  return projectStore.projects.filter(
    (p) => new Date(p.due_date) < today && p.status?.toLowerCase() !== 'completed',
  ).length
})

const completedProjects = computed(
  () => projectStore.projects.filter((p) => p.status?.toLowerCase() === 'completed').length,
)

const projectStatus = computed(() => {
  const summary = { 'Not Started': 0, 'In Progress': 0, Completed: 0 }
  projectStore.projects.forEach((p) => {
    switch (p.status?.toLowerCase()) {
      case 'not started':
        summary['Not Started']++
        break
      case 'in progress':
        summary['In Progress']++
        break
      case 'completed':
        summary['Completed']++
        break
      default:
        summary['Not Started']++
    }
  })
  console.log('Computed projectStatus:', summary)
  return Object.entries(summary).map(([type, value]) => ({ type, value }))
})

const taskStatus = computed(() => {
  const summary = { 'Not Started': 0, 'In Progress': 0, Completed: 0 }
  taskStore.tasks.forEach((t) => {
    switch (t.t_status?.toLowerCase()) {
      case 'not started':
        summary['Not Started']++
        break
      case 'in progress':
        summary['In Progress']++
        break
      case 'completed':
        summary['Completed']++
        break
      default:
        summary['Not Started']++
    }
  })
  console.log('Computed taskStatus:', summary)
  return Object.entries(summary).map(([type, value]) => ({ type, value }))
})

const ganttRows = computed(() =>
  projectStore.projects.map((project) => ({
    label: project.p_name,
    tasks:
      project.tasks?.map((t) => ({
        id: t.id,
        name: t.t_name,
        start: t.start_date ? new Date(t.start_date) : new Date(),
        end: t.due_date ? new Date(t.due_date) : new Date(),
        icon: t.user?.img_url || null,
      })) || [],
  })),
)

function getStatusColor(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'not started':
      return '#FFD5DB'
    case 'in progress':
      return '#FFD966'
    case 'completed':
      return '#8BD3B7'
    default:
      return '#D3D3D3'
  }
}

// for gantt chart date formatting
function formatDate(dateStr: string) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// for date & time display
const formattedDate = computed(() =>
  currentTime.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

const weekday = computed(() => currentTime.value.toLocaleString('en-US', { weekday: 'long' }))

// const hours = computed(() => currentTime.value.getHours().toString().padStart(2, '0'))
const hours = computed(() => {
  let h = currentTime.value.getHours()
  h = h % 12 || 12 // convert 0 -> 12, 13 -> 1, etc.
  return h.toString().padStart(2, '0')
})
const minutes = computed(() => currentTime.value.getMinutes().toString().padStart(2, '0'))
const seconds = computed(() => currentTime.value.getSeconds().toString().padStart(2, '0'))
const ampm = computed(() => (currentTime.value.getHours() >= 12 ? 'PM' : 'AM'))

const formattedTime = computed(() =>
  currentTime.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
  }),
)

onMounted(() => {
  projectStore.fetchProjects()
  taskStore.fetchTasks()

  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => clearInterval(timer))
</script>
