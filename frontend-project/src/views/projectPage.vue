<template>
  <ProjectLayout>
    <div v-if="project" class="container flex flex-col gap-6 pt-6">
      <!-- Project Header -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold">{{ project.p_name }}</h1>
          <Status :status="project.status" />
        </div>

        <div class="flex gap-3">
          <img
            src="../assets/icons/edit.svg"
            alt="Edit"
            class="cursor-pointer"
            @click="openEditProjectForm(project)"
          />
          <Form
            v-model:modelValue="showEditProjectForm"
            formTitle="Edit Project"
            :fields="projectFields"
            :initialData="editProjectData"
            endpoint="projects"
            @submitted="onProjectUpdated"
          />
        </div>
      </div>

      <p class="text-gray-600">{{ project.p_description }}</p>

      <!-- Admin Dashboard -->
      <template v-if="userRole === 'admin'">
        <div class="grid grid-cols-4 gap-4 mt-4">
          <OverviewCard title="Total Tasks" :value="totalTasks" />
          <OverviewCard title="Completed Tasks" :value="completedTasks" />
          <OverviewCard title="Overdue Tasks" :value="overdueTasks" />
          <OverviewCard title="Progress" :value="progressPercent + '%'" />
        </div>

        <div class="flex gap-6 mt-6">
          <PieChart :data="statusData" :height="250" class="flex-1" />
          <BarChart :projectId="project.id" :teamId="project.team?.id" class="flex-1" />
        </div>
      </template>

      <!-- Shared Task View -->
      <ProjectTaskViews
        :project="project"
        :tasks="tasksWithSubtasks"
        :TeamMembers="TeamMembers"
        :tableColumns="tableColumns"
        :taskFields="taskFields"
        @onTaskCreated="onTaskCreated"
        @onTaskUpdated="onTaskUpdated"
        @onTaskDeleted="deleteTask"
      />
    </div>

    <div v-else class="container text-gray-600">No project selected.</div>
  </ProjectLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import ProjectLayout from './pageLayout.vue'
import Status from '@/components/status.vue'
import Form from '@/components/form.vue'
import OverviewCard from '@/components/overviewCard.vue'
import PieChart from '@/components/pieChart.vue'
import BarChart from '@/components/barChart.vue'
import ProjectTaskViews from '@/components/taskView.vue'

import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useSubtaskStore } from '@/stores/subtask'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'

// --- Stores & Route ---
const route = useRoute()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const subtaskStore = useSubtaskStore()
const authStore = useAuthStore()
const teamStore = useTeamStore()

// --- Reactive state ---
const project = computed(() => projectStore.current)
const tasksWithSubtasks = ref([])
const editProjectData = ref(null)
const TeamMembers = ref([])
const showEditProjectForm = ref(false)

// --- User Role ---
const userRole = computed(() => authStore.user?.role || 'user')

// --- Form Fields ---
const projectFields = computed(() => [
  { type: 'text', label: 'Project Title', placeholder: 'Enter project title', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  {
    type: 'select',
    label: 'Team',
    options: teamStore.teams.map((t) => ({ id: t.id, name: t.name })),
    model: 'team_id',
  },
  {
    type: 'select',
    label: 'Priority',
    options: [
      { id: 'high', name: 'High' },
      { id: 'medium', name: 'Medium' },
      { id: 'low', name: 'Low' },
    ],
    model: 'priority',
  },
  { type: 'datetime-local', label: 'Start Date', model: 'startDate' },
  { type: 'datetime-local', label: 'Due Date', model: 'dueDate' },
])

const taskFields = computed(() => [
  { type: 'text', label: 'Task Name', placeholder: 'Enter task name', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  { type: 'datetime-local', label: 'Start Date', model: 'startDate' },
  { type: 'datetime-local', label: 'Due Date', model: 'dueDate' },
  {
    type: 'select',
    label: 'Priority',
    options: [
      { id: 'high', name: 'High' },
      { id: 'medium', name: 'Medium' },
      { id: 'low', name: 'Low' },
    ],
    model: 'priority',
  },
  { type: 'select', label: 'Assignee', options: TeamMembers.value, model: 'user' },
])

// --- Table Columns ---
const tableColumns = ref([
  { key: 'title', label: 'Task Name' },
  { key: 'description', label: 'Description' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'icon', label: 'Assignee' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
])

// --- Computed Summaries ---
const totalTasks = computed(() => tasksWithSubtasks.value.length)
const completedTasks = computed(
  () => tasksWithSubtasks.value.filter((t) => t.status?.toLowerCase() === 'completed').length,
)
const overdueTasks = computed(
  () =>
    tasksWithSubtasks.value.filter(
      (t) => new Date(t.due_date) < new Date() && t.status?.toLowerCase() !== 'completed',
    ).length,
)
const progressPercent = computed(() =>
  totalTasks.value ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0,
)

const statusData = computed(() => {
  const summary = { 'Not Started': 0, 'In Progress': 0, Completed: 0 }
  tasksWithSubtasks.value.forEach((t) => {
    const s = (t.status || '').toLowerCase()
    if (s === 'not started') summary['Not Started']++
    else if (s === 'in progress') summary['In Progress']++
    else if (s === 'completed') summary['Completed']++
    else summary['Not Started']++
  })
  return Object.entries(summary).map(([type, value]) => ({ type, value }))
})

// --- Helpers ---
function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// --- Fetch / Map Tasks ---
async function fetchProjectTasks(projectId) {
  await taskStore.fetchTasksByProject(projectId)

  // Determine visible tasks based on role
  const visibleTasks = taskStore.tasks.filter((t) => {
    if (userRole.value === 'admin') return true
    if (userRole.value === 'project_manager') {
      // PM sees tasks assigned to any team member
      return TeamMembers.value.some((m) => m.id === t.user?.id)
    }
    // Regular user sees only tasks assigned to them
    return t.user?.id === authStore.user?.id
  })

  tasksWithSubtasks.value = await Promise.all(
    visibleTasks.map(async (task) => {
      let subtasks = await subtaskStore.fetchByTask(task.id)
      subtasks = Array.isArray(subtasks) ? subtasks : []
      return {
        id: task.id,
        title: task.t_name,
        description: task.t_description,
        priority: task.t_priority || 'none',
        status: task.t_status || 'Not Started',
        start_date: task.start_date,
        due_date: task.due_date,
        icon: task.user?.img_url || null,
        user: task.user || authStore.user || null,
        subtasks: subtasks.map((st) => ({
          name: st.name,
          start: st.start_date ? new Date(st.start_date) : task.start_date,
          end: st.due_date ? new Date(st.due_date) : task.due_date,
          status: st.status,
          color: st.status === 'completed' ? '#8BD3B7' : '#FFD966',
          icon: st.user_avatar || null,
        })),
      }
    }),
  )
}

// --- Team Members ---
async function fetchProjectTeamMembers(teamId) {
  const team = teamStore.teams.find((t) => t.id === Number(teamId))
  if (!team) return
  TeamMembers.value = [
    ...(team.pms || []).map((pm) => ({ id: pm.id, name: pm.first_name + ' ' + pm.last_name })),
    ...(team.members || []).map((m) => ({ id: m.id, name: m.first_name + ' ' + m.last_name })),
  ]
}

// --- Initialize Project ---
async function setCurrentProject() {
  if (!projectStore.projects.length) await projectStore.fetchProjects()
  const selectedProject = projectStore.projects.find((p) => p.id === Number(route.params.id))
  projectStore.setCurrent(selectedProject)
  if (!selectedProject) return
  if (!teamStore.teams.length) await teamStore.fetchTeams()
  if (selectedProject.team?.id) await fetchProjectTeamMembers(selectedProject.team.id)
  await fetchProjectTasks(selectedProject.id)
}

watch(() => route.params.id, setCurrentProject)
onMounted(setCurrentProject)

// --- Project Edit ---
async function openEditProjectForm(project) {
  if (!teamStore.teams.length) await teamStore.fetchTeams()
  if (project.team?.id) await fetchProjectTeamMembers(project.team.id)
  else TeamMembers.value = []

  editProjectData.value = {
    id: project.id,
    title: project.p_name,
    description: project.p_description,
    startDate: project.start_date,
    dueDate: project.due_date,
    status: project.status,
    priority: project.priority,
    team_id: project.team?.id || null,
  }

  showEditProjectForm.value = true
}

async function onProjectUpdated() {
  const latestProject = await projectStore.fetchProjectById(project.value.id)
  projectStore.setCurrent(latestProject)
  showEditProjectForm.value = false
}

// --- Task CRUD (pass-through for ProjectTaskViews) ---
async function onTaskCreated(taskData) {
  const payload = {
    t_name: taskData.title,
    t_description: taskData.description,
    t_priority: taskData.priority,
    t_status: taskData.status || 'Not Started',
    start_date: taskData.startDate,
    due_date: taskData.dueDate,
    projectId: projectStore.current.id,
    userId: taskData.user ? Number(taskData.user) : undefined,
  }
  await taskStore.createTask(payload)
  await fetchProjectTasks(projectStore.current.id)
}

async function onTaskUpdated(taskData) {
  if (!taskData?.id) return
  const payload = {
    t_name: taskData.title,
    t_description: taskData.description,
    t_priority: taskData.priority,
    t_status: taskData.status,
    start_date: taskData.startDate,
    due_date: taskData.dueDate,
  }

  // Only include userId if it's valid
  if (taskData.user) payload.userId = taskData.user

  await taskStore.updateTask(taskData.id, payload)
  await fetchProjectTasks(projectStore.current.id)
}

async function deleteTask(row) {
  const task = taskStore.tasks.find((t) => t.id === row.id)
  if (!task) return
  if (confirm(`Delete task "${row.title}"?`)) {
    await taskStore.deleteTask(task.id)
    await fetchProjectTasks(projectStore.current.id)
  }
}
</script>
