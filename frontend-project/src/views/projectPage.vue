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

      <!-- ADMIN DASHBOARD -->
      <template v-if="userRole === 'admin'">
        <div class="grid grid-cols-4 gap-4 mt-4">
          <OverviewCard title="Total Tasks" :value="totalTasks" />
          <OverviewCard title="Completed Tasks" :value="completedTasks" />
          <OverviewCard title="Overdue Tasks" :value="overdueTasks" />
          <OverviewCard title="Progress" :value="progressPercent + '%'" />
        </div>

        <div class="flex gap-6 mt-6">
          <PieChart :data="statusData" :height="250" class="flex-1" />
          <!-- <BarChart  :data="teamWorkloadData" :height="250" class="flex-1" /> -->
          <BarChart :projectId="project.id" :teamId="project.team?.id" />
        </div>

        <!-- Tasks Table -->
        <div class="mt-4 flex flex-col gap-3">
          <div class="flex justify-between items-center">
            <Button
              label="+ New Task"
              btn-color="#C6E7FF"
              btntext="black"
              @click="showTaskForm = true"
            />
            <Form
              v-model:modelValue="showTaskForm"
              formTitle="Create Task"
              :fields="taskFields"
              endpoint="tasks"
              :initialData="{ project_id: project.id }"
              @submitted="onTaskCreated"
            />
            <Search @update="searchQuery = $event" />
          </div>

          <Table :data="mappedTasks" :columns="tableColumns" :format-date="formatDate">
            <template #actions="{ row }">
              <div class="flex gap-2">
                <img
                  src="../assets/icons/edit.svg"
                  alt="Edit"
                  class="cursor-pointer"
                  @click="editTask(row)"
                />
                <img
                  src="../assets/icons/delete.svg"
                  alt="Delete"
                  class="cursor-pointer"
                  @click="deleteTask(row)"
                />
              </div>
            </template>
          </Table>
        </div>

        <!-- Edit Task Form -->
        <Form
          v-model:modelValue="showEditTaskForm"
          formTitle="Edit Task"
          :fields="taskFields"
          :initialData="editTaskData"
          endpoint="tasks"
          @submitted="onTaskUpdated"
        />
      </template>

      <!-- NORMAL USER VIEW -->
      <template v-else>
        <div class="flex justify-between items-center mt-4 w-full">
          <div class="flex text-[#1E1E1E] opacity-80 gap-2">
            <span class="font-semibold">Timeline:</span>
            <DescriptionLabel :description="formatDate(project.start_date)" />
            <span>-</span>
            <DescriptionLabel :description="formatDate(project.due_date)" />
          </div>

          <Button
            label="+ New Task"
            btn-color="#C6E7FF"
            btntext="black"
            @click="showTaskForm = true"
          />
          <Form
            v-model:modelValue="showTaskForm"
            formTitle="Create Task"
            :fields="taskFields"
            endpoint="tasks"
            :initialData="{ project_id: project.id }"
            @submitted="onTaskCreated"
          />
        </div>
      </template>
    </div>

    <div v-else class="container text-gray-600">No project selected.</div>
  </ProjectLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import ProjectLayout from './pageLayout.vue'
import DescriptionLabel from '@/components/descriptionLabel.vue'
import Status from '@/components/status.vue'
import Search from '@/components/search.vue'
import Table from '@/components/table.vue'
import Button from '@/components/button.vue'
import Form from '@/components/form.vue'
import PieChart from '@/components/pieChart.vue'
import OverviewCard from '@/components/overviewCard.vue'
import BarChart from '@/components/barChart.vue'

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
const showTaskForm = ref(false)
const showEditProjectForm = ref(false)
const showEditTaskForm = ref(false)
const editProjectData = ref(null)
const editTaskData = ref(null)
const searchQuery = ref('')
const TeamMembers = ref([])

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
  { type: 'select', label: 'Assignee', options: TeamMembers.value, model: 'userId' },
])

// --- Table Columns ---
const tableColumns = ref([
  { key: 'name', label: 'Task Name' },
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

const teamWorkloadData = computed(() => {
  const workload = {}
  tasksWithSubtasks.value.forEach((task) => {
    const assignee = task.assignee_name || 'Unassigned'
    workload[assignee] = (workload[assignee] || 0) + 1
  })
  return Object.entries(workload).map(([assignee, count]) => ({ assignee, count }))
})

// --- Filtered & Mapped Tasks ---
const filteredTasksWithSubtasks = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return tasksWithSubtasks.value.filter(
    (task) =>
      task.taskname.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q)),
  )
})

const mappedTasks = computed(() =>
  filteredTasksWithSubtasks.value.map((task) => ({
    id: task.id,
    name: task.taskname,
    description: task.description,
    priority: task.taskpriority,
    status: task.status,
    start_date: task.start_date,
    due_date: task.due_date,
    icon: task.user ? `${task.user.first_name} ${task.user.last_name}` : 'Unassigned', // <-- use task.user
  })),
)

// --- Helpers ---
function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getSubtaskColor(status) {
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

// --- Fetch / Map Tasks ---
async function fetchProjectTasks(projectId) {
  taskStore.tasks = taskStore.tasks.filter((t) => String(t.project?.id) !== String(projectId))
  await taskStore.fetchTasksByProject(projectId)
  tasksWithSubtasks.value = await Promise.all(
    taskStore.tasks
      .filter((t) => String(t.project?.id) === String(projectId))
      .map(async (task) => {
        let subtasks = await subtaskStore.fetchByTask(task.id)
        subtasks = Array.isArray(subtasks) ? subtasks : []
        return {
          id: task.id,
          taskname: task.t_name,
          description: task.t_description,
          taskpriority: task.t_priority || 'none',
          status: task.t_status || 'Not Started',
          assignee_id: task.assigned_to?.id || null,
          assignee_name: task.assigned_to?.first_name
            ? `${task.assigned_to.first_name} ${task.assigned_to.last_name}`
            : null,
          start_date: task.start_date,
          due_date: task.due_date,
          subtasks: subtasks.map((st) => ({
            name: st.name,
            start: st.start_date ? new Date(st.start_date) : task.start_date,
            end: st.due_date ? new Date(st.due_date) : task.due_date,
            status: st.status,
            color: getSubtaskColor(st.status),
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

// --- Task Create / Edit / Delete ---
async function editTask(row) {
  const task = taskStore.tasks.find((t) => t.id === row.id)
  if (!task) return
  if (task.project?.team?.id) await fetchProjectTeamMembers(task.project.team.id)

  editTaskData.value = {
    id: task.id,
    title: task.t_name,
    description: task.t_description,
    startDate: task.start_date,
    dueDate: task.due_date,
    priority: task.t_priority,
    status: task.t_status,
    project_id: task.project?.id,
    assigned_to: task.assigned_to?.id || null,
  }

  showEditTaskForm.value = true
}

async function onTaskCreated(taskData) {
  const payload = {
    t_name: taskData.title,
    t_description: taskData.description,
    t_priority: taskData.priority,
    t_status: taskData.status || 'Not Started',
    start_date: taskData.startDate,
    due_date: taskData.dueDate,
    projectId: projectStore.current.id,
    userId: taskData.userId, // <-- send as userId
  }
  await taskStore.createTask(payload)
  await fetchProjectTasks(projectStore.current.id)
  showTaskForm.value = false
}

async function onTaskUpdated(updatedTask) {
  if (!updatedTask?.id) return
  const payload = {
    t_name: updatedTask.title,
    t_description: updatedTask.description,
    t_priority: updatedTask.priority,
    t_status: updatedTask.status,
    start_date: updatedTask.startDate,
    due_date: updatedTask.dueDate,
    userId: updatedTask.userId, // <-- send as userId
  }
  const savedTask = await taskStore.updateTask(updatedTask.id, payload)
  if (!savedTask) return alert('Failed to save task.')
  await fetchProjectTasks(projectStore.current.id)
  showEditTaskForm.value = false
}

async function deleteTask(row) {
  const task = taskStore.tasks.find((t) => t.id === row.id)
  if (!task) return
  if (confirm(`Delete task "${row.name}"?`)) {
    await taskStore.deleteTask(task.id)
    await fetchProjectTasks(projectStore.current.id)
  }
}
</script>
