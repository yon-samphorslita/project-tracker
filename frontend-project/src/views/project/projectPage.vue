<template>
  <ProjectLayout>
    <div v-if="project" class="container flex flex-col gap-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <Back
            class="mr-4 w-8 h-8 text-[var(--graysvg-text)] opacity-80 hover:opacity-100 cursor-pointer"
            @click="goBack"
          />
          <h1 class="text-2xl font-bold">{{ project.p_name }}</h1>
          <Edit
            v-if="userRole === 'admin' || userRole === 'project_manager'"
            class="icon-theme w-7 h-7"
            @click="openEditProjectForm(project)"
          />
          <EditForm
            v-model="showEditProjectForm"
            title="Edit Project"
            :fields="projectFields"
            :initialData="editProjectData"
            endpoint="projects"
            @submitted="onProjectUpdated"
          />
          <Status :status="projectStatus" />
        </div>

        <Button
          v-if="userRole === 'admin' || userRole === 'project_manager'"
          label="+ New Task"
          btn-color="var(--blue-bg)"
          btntext="var(--black-text)"
          @click="showTaskForm = true"
        />
        <Form
          v-model:modelValue="showTaskForm"
          formTitle="Create Task"
          :fields="taskFields"
          endpoint="tasks"
          :initialData="{ project_id: project.id }"
          @submitted="handleTaskCreated"
        />
      </div>

      <!-- Description -->
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

      <!-- Task Views -->
      <ProjectTaskViews
        :project="project"
        :tasks="tasksWithSubtasks"
        :TeamMembers="TeamMembers"
        :tableColumns="tableColumns"
        :taskFields="taskFields"
        @onTaskCreated="onTaskCreated"
        @onTaskUpdated="onTaskUpdated"
        @onTaskDeleted="deleteTask"
        @statusUpdated="fetchProjectTasks(project.id)"
      />
    </div>

    <div v-else class="container text-gray-600">No project selected.</div>
  </ProjectLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Components
import ProjectLayout from '@/views/pageLayout.vue'
import Edit from '@/assets/icons/edit.svg'
import Back from '@/assets/icons/back.svg'
import Status from '@/components/status.vue'
import Form from '@/components/forms/form.vue'
import EditForm from '@/components/forms/editForm.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import PieChart from '@/components/charts/pieChart.vue'
import BarChart from '@/components/charts/barChart.vue'
import ProjectTaskViews from '@/components/taskView.vue'
import Button from '@/components/common-used/button.vue'

// Stores
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useSubtaskStore } from '@/stores/subtask'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const subtaskStore = useSubtaskStore()
const authStore = useAuthStore()
const teamStore = useTeamStore()

// State
const project = computed(() => projectStore.current)
const tasksWithSubtasks = ref([])
const TeamMembers = ref([])
const editProjectData = ref(null)
const showEditProjectForm = ref(false)
const showTaskForm = ref(false)
const userRole = computed(() => authStore.user?.role || 'user')

const goBack = () => {
  router.push({ name: 'Projects' })
}

// Form Fields
const projectFields = computed(() => [
  { type: 'text', label: 'Project Title', model: 'title', placeholder: 'Enter project title' },
  {
    type: 'textarea',
    label: 'Description',
    model: 'description',
    placeholder: 'Enter description',
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
  { type: 'text', label: 'Task Name', model: 'title', placeholder: 'Enter task name' },
  {
    type: 'textarea',
    label: 'Description',
    model: 'description',
    placeholder: 'Enter description',
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
  {
    type: 'select',
    label: 'Assignee',
    options: TeamMembers.value,
    model: 'user',
    valueKey: 'id',
    labelKey: 'name',
  },
])

// Table Columns
const tableColumns = computed(() => {
  const baseColumns = [
    { key: 'title', label: 'Task Name' },
    { key: 'description', label: 'Description' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'icon', label: 'Assignee' },
  ]

  // Only admin or project_manager see actions column
  if (userRole.value === 'admin' || userRole.value === 'project_manager') {
    baseColumns.push({ key: 'actions', label: 'Actions', slot: 'actions' })
  }

  return baseColumns
})

// Admin Stats
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
  })
  return Object.entries(summary).map(([type, value]) => ({ type, value }))
})

const projectStatus = ref(project.value?.status || '')
watch(project, (newVal) => (projectStatus.value = newVal?.status || ''))

// Methods
async function onProjectUpdated() {
  const updated = await projectStore.fetchProjectById(project.value.id)
  projectStore.setCurrent(updated)
  projectStatus.value = updated.status
  showEditProjectForm.value = false
}

async function fetchProjectTasks(projectId) {
  tasksWithSubtasks.value = []
  await taskStore.fetchTasksByProject(projectId)

  const visibleTasks = taskStore.tasks.filter((t) => {
    if (userRole.value === 'admin') return true
    if (userRole.value === 'project_manager')
      return TeamMembers.value.some((m) => m.id === t.user?.id)
    return t.user?.id === authStore.user?.id
  })

  tasksWithSubtasks.value = await Promise.all(
    visibleTasks.map(async (task) => {
      const subtasksData = await subtaskStore.fetchByTask(task.id)
      const subtasks = Array.isArray(subtasksData)
        ? subtasksData
        : subtasksData
          ? Object.values(subtasksData)
          : []
      return {
        id: task.id,
        title: task.t_name,
        description: task.t_description,
        priority: task.t_priority || 'none',
        status: task.t_status || 'Not Started',
        start_date: task.start_date,
        due_date: task.due_date,
        icon: task.user?.img_url || null,
        user: task.user || authStore.user,
        subtasks: subtasks.map((st) => ({
          name: st.name,
          start: new Date(st.start_date || task.start_date),
          end: new Date(st.due_date || task.due_date),
          status: st.status,
          color: st.status === 'completed' ? '#8BD3B7' : '#FFD966',
          icon: st.user_avatar || null,
        })),
      }
    }),
  )
}

async function fetchProjectTeamMembers(teamId) {
  const team = teamStore.teams.find((t) => t.id === Number(teamId))
  if (!team) return
  TeamMembers.value = [
    ...(team.mainMembers || []).map((mm) => ({
      id: mm.id,
      name: `${mm.first_name} ${mm.last_name}`,
    })),
    ...(team.members || []).map((m) => ({ id: m.id, name: `${m.first_name} ${m.last_name}` })),
  ]
}

async function setCurrentProject() {
  if (!projectStore.projects.length) await projectStore.fetchProjects()
  const selected = projectStore.projects.find((p) => p.id === Number(route.params.id))
  projectStore.setCurrent(selected)
  if (!selected) return
  if (!teamStore.teams.length) await teamStore.fetchTeams()
  if (selected.team?.id) await fetchProjectTeamMembers(selected.team.id)
  await fetchProjectTasks(selected.id)
}

watch(() => route.params.id, setCurrentProject)
onMounted(setCurrentProject)

async function handleTaskCreated(taskData) {
  const payload = {
    t_name: taskData.title,
    t_description: taskData.description,
    t_priority: taskData.priority,
    t_status: taskData.status || 'Not Started',
    start_date: taskData.startDate,
    due_date: taskData.dueDate,
    projectId: project.value.id,
    userId: taskData.user?.id || null,
  }
  await taskStore.createTask(payload)
  await fetchProjectTasks(project.value.id)
  showTaskForm.value = false
}

async function openEditProjectForm(proj) {
  if (!teamStore.teams.length) await teamStore.fetchTeams()
  if (proj.team?.id) await fetchProjectTeamMembers(proj.team.id)
  editProjectData.value = {
    id: proj.id,
    title: proj.p_name,
    description: proj.p_description,
    startDate: proj.start_date,
    dueDate: proj.due_date,
    status: proj.status,
    priority: proj.priority,
    team_id: proj.team?.id || null,
  }
  showEditProjectForm.value = true
}

async function onTaskCreated(taskData) {
  await handleTaskCreated(taskData)
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
    userId: taskData.user?.id || null,
  }
  await taskStore.updateTask(taskData.id, payload)
  await fetchProjectTasks(project.value.id)
}
</script>
