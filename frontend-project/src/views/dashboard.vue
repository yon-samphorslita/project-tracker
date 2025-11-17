<template>
  <DashboardLayout>
    <div class="flex flex-col">
      <div class="flex gap-6">
        <!-- left side: project overview, charts, recent projects -->
        <div class="w-2/3 flex flex-col items-start gap-6">
          <div class="flex flex-col gap-4 mb-2">
            <div v-if="userRole === 'admin' || userRole === 'project_manager' ">
              <div class="text-xl font-semibold">Project Overview</div>
              <div class="flex gap-4 w-full">
                <OverviewCard title="Total Projects" :value="totalProjects" class="w-72" />
                <OverviewCard title="Overdue Projects" :value="overdueProjects" class="w-72" />
                <OverviewCard title="Completed Projects" :value="completedProjects" class="w-72" />
              </div>
            </div>

            <div v-else class="w-full">
              <div class="text-xl font-semibold">Task Overview</div>
              <div class="flex gap-4 w-full">
                <OverviewCard title="Total Tasks" :value="totalTasks" class="w-72" />
                <OverviewCard title="Overdue Tasks" :value="overdueTasks" class="w-72" />
                <OverviewCard title="Completed Tasks" :value="completedTasks" class="w-72"/>
              </div>
            </div>
            
          </div>

          <!-- project and task status charts -->
          <div class="flex w-full gap-10">
            <div v-if="userRole === 'admin' || userRole === 'project_manager' " class="flex w-full justify-between pr-20">
              <div>
                <div class="text-xl font-semibold">Total Project</div>
                <PieChart :data="projectStatus" :height="280" class="w-[350px]" />
              </div>

              <div>
                <div class="text-xl font-semibold">Total Tasks</div>
                <PieChart :data="taskStatus" :height="280" class="w-[350px]" />
              </div>
            </div>

            <div v-else-if="userRole === 'member'" class="flex justify-between w-full">
              <div>
                <div class="text-xl font-semibold">My Task Status</div>
                <PieChart :data="memberTaskStatus" :height="280" class="w-[350px]" />
              </div>
              <div v-if="participatingProjects.length" class="w-1/2 bg-pink-100 flex flex-col px-4 rounded-lg pt-4">
                <p class="text-xl font-semibold">Participating Project</p>
                <ul class="flex flex-col gap-3 m-2 overflow-y-auto max-h-48 scrollable">
                  <div v-for="p in participatingProjects" :key="p.id" class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="text-red-900" viewBox="0 0 16 16"><path fill="currentColor" d="m13.637 2.363l1.676.335c.09.018.164.084.19.173a.25.25 0 0 1-.062.249l-1.373 1.374a.88.88 0 0 1-.619.256H12.31L9.45 7.611A1.5 1.5 0 1 1 6.5 8a1.5 1.5 0 0 1 1.889-1.449l2.861-2.862V2.552c0-.232.092-.455.256-.619L12.88.559a.25.25 0 0 1 .249-.062c.089.026.155.1.173.19Z"/><path fill="currentColor" d="M2 8a6 6 0 1 0 11.769-1.656a.751.751 0 1 1 1.442-.413a7.502 7.502 0 0 1-12.513 7.371A7.501 7.501 0 0 1 10.069.789a.75.75 0 0 1-.413 1.442A6 6 0 0 0 2 8"/><path fill="currentColor" d="M5 8a3.002 3.002 0 0 0 4.699 2.476a3 3 0 0 0 1.28-2.827a.748.748 0 0 1 1.045-.782a.75.75 0 0 1 .445.61A4.5 4.5 0 1 1 8.516 3.53a.75.75 0 1 1-.17 1.49A3 3 0 0 0 5 8"/></svg>
                    {{ p.p_name }}
                  </div>
                </ul>
              </div>
            </div>

          </div>

          <!-- showcase recent project's status -->
          <div v-if="userRole === 'project_manager'" class="w-full my-2">
            <div class="text-xl font-semibold mb-2">Top 3 Priority Projects</div>
            <div>
              <ProjectOverview
                v-if="projectStore.projects.length && !taskStore.loading"
                :projects="projectStore.projects"
                :tasks="taskStore.tasks"
              />
              <div v-else>Loading projects...</div>
            </div>
          </div>

          <div v-if="userRole === 'member'" >
            <div>
              <div class="text-xl font-semibold mb-3">My Focus Tasks</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Focustask
                  v-for="task in focusTasks"
                  :key="task.id"
                  :focus-task="task"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- right side: date & time, calendar -->
        <div class="w-1/3 flex flex-col gap-4 bg-[#C6E7FF] rounded-xl shadow-md ">
          <div
            class="flex flex-col justify-end items-center gap-4 p-4 bg-[#C6E7FF] rounded-t-xl"
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

          <div class="flex justify-center p-4 ">
            <Calendar class="w-[700px] bg-white" />
          </div>
        </div>
      </div>

      <div class="py-6">
        <div class="text-xl font-semibold mb-3">
          {{ userRole === 'admin' || userRole === 'project_manager' ? 'Project Timeline' : 'My Task Timeline' }}
        </div>
        <GanttChart
          :rows="userRole === 'admin' || userRole === 'project_manager' ? ganttRows : memberGanttRows"
          :format-date="formatDate"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import DashboardLayout from '@/views/pageLayout.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import PieChart from '@/components/charts/pieChart.vue'
import Calendar from '@/components/calendars/calendar.vue'
import FlipDigit from '@/components/flipDigit.vue'
import ProjectOverview from '@/components/detail-cards/projectOverview.vue'
import GanttChart from '@/components/charts/gantt.vue'
import Focustask from '@/components/myfocustask.vue'

import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const userRole = computed(() => authStore.user?.role || 'user')

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

const participatingProjects = projectStore.projects.filter((p) => p.status?.toLowerCase() !== 'completed')

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

// Member Tasks Computation 
const totalTasks = computed(() => taskStore.tasks.length)

const overdueTasks = computed(() => {
  const today = new Date()
  return taskStore.tasks.filter(
    (t) => new Date(t.due_date) < today && t.t_status?.toLowerCase() !== 'completed',
  ).length
})

const completedTasks = computed(() =>
  taskStore.tasks.filter((t) => t.t_status?.toLowerCase() === 'completed').length
)

const memberTaskStatus = computed(() => {
  const summary = { 'Not Started': 0, 'In Progress': 0, 'Completed': 0 }
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
  console.log(memberTaskStatus)
  return Object.entries(summary).map(([type, value]) => ({ type, value }))
})

const memberGanttRows = computed(() =>
  taskStore.tasks.map((t) => ({
    label: t.t_name,
    tasks: [
      {
        name: t.t_name,
        start: new Date(t.start_date),
        end: new Date(t.due_date),
        status: t.t_status,
        color: getStatusColor(t.t_status),
      },
    ],
  })),
)

const focusTasks = computed(() => {
  const today = new Date()
  const endOfWeek = new Date()
  endOfWeek.setDate(today.getDate() + 7) // tasks due within a week

  return taskStore.tasks
    .filter(t => 
      t.user?.id === authStore.user?.id && 
      t.t_status.toLowerCase() !== 'completed'
    )
    .sort((a, b) => {
      // First, tasks due sooner come first
      const aDue = new Date(a.due_date).getTime()
      const bDue = new Date(b.due_date).getTime()

      // If due dates are equal, prioritize by task priority
      if (aDue === bDue) {
        const priorityOrder = { high: 1, medium: 2, low: 3 }
        return (priorityOrder[a.priority?.toLowerCase()] || 4) - (priorityOrder[b.priority?.toLowerCase()] || 4)
      }
      return aDue - bDue
    })
    .slice(0, 2) // pick top 2 urgent tasks
})


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
watch(focusTasks, (val) => {
  console.log('Focus tasks:', val)
}, { immediate: true })

onMounted(async () => {
  if (!authStore.user) return

  if (userRole.value === 'admin') {
    await projectStore.fetchProjects()
    await taskStore.fetchTasks() 
  }
  else if (userRole.value === 'project_manager') {
    await projectStore.fetchProjectsByPM(authStore.user?.id )
    await taskStore.fetchTasksForPM()
  } else {
    await projectStore.fetchProjects()
    await taskStore.fetchTasks()
  }

  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => clearInterval(timer))
</script>
