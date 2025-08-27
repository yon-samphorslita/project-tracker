<template>
  <ProjectLayout>
    <div v-if="project" class="container flex flex-col gap-4">
      <!-- Project Title & Description -->
      <div class="flex gap-4 items-center">
        <h1 class="text-2xl font-bold">{{ project.p_name }}</h1>
        <img src="../assets/icons/edit.svg" alt="Edit" />
      </div>
      <p class="text-gray-600">{{ project.p_description }}</p>

      <!-- Timeline & Status -->
      <div class="flex items-center justify-between mt-4 w-3/4">
        <div class="flex text-[#1E1E1E] opacity-80 gap-2">
          <div class="flex items-center gap-2">
            <div class="text-lg">Timeline:</div>
            <DescriptionLabel :description="formatDate(project.start_date)" />
            <span>-</span>
            <DescriptionLabel :description="formatDate(project.due_date)" />
          </div>
        </div>

        <div class="flex gap-2 items-center text-[#1E1E1E] opacity-80">
          <div class="text-lg">Status:</div>
          <Status :status="project.status" />
        </div>

        <Button
          label="+ Create New Project"
          btn-color="#C6E7FF"
          btntext="black"
          @click="openForm"
        />
      </div>

      <!-- TypeList & Search -->
      <div class="flex justify-between mt-4">
        <TypeList v-model:activeOption="activeOption" />
        <Search />
      </div>

      <!-- Content: Kanban / Gantt / Table -->
      <div class="flex gap-4 mt-4">
        <!-- Kanban View -->
        <template v-if="activeOption === 'Kanban'">
          <Kanban
            :kanbantasks="notStartedTasks"
            kanbanTaskStatus="Not Started"
            :kanbanTaskNum="notStartedTasks.length"
          />
          <Kanban
            :kanbantasks="inProgressTasks"
            kanbanTaskStatus="In Progress"
            :kanbanTaskNum="inProgressTasks.length"
          />
          <Kanban
            :kanbantasks="completedTasks"
            kanbanTaskStatus="Completed"
            :kanbanTaskNum="completedTasks.length"
          />
        </template>

        <!-- Gantt View -->
        <template v-else-if="activeOption === 'Gantt'">
          <GanttChart :rows="ganttRows" :format-date="formatDate" />
        </template>

        <!-- Table View -->
        <template v-else-if="activeOption === 'Table'">
          <Table :data="mappedTasks" :columns="tableColumns" :format-date="formatDate" />
        </template>
      </div>
    </div>

    <div v-else class="container text-gray-600">No project selected.</div>
  </ProjectLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import ProjectLayout from './projectLayout.vue'
import DescriptionLabel from '@/components/descriptionLabel.vue'
import Status from '@/components/status.vue'
import TypeList from '@/components/typeList.vue'
import Search from '@/components/search.vue'
import Kanban from '@/components/kanban.vue'
import GanttChart from '@/components/gantt.vue'
import Table from '@/components/table.vue'
import Button from '@/components/button.vue'

const route = useRoute()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const activeOption = ref('Kanban') // default view
const tasksWithSubtasks = ref([]) // tasks with mapped subtasks

// Columns for table
const tableColumns = ref([
  { key: 'name', label: 'Task Name' },
  { key: 'description', label: 'Description' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'icon', label: 'Assignee' },
])

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Subtask color helper
function getSubtaskColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'not started':
    case 'not_started':
      return '#FFD5DB'
    case 'in progress':
    case 'in_progress':
      return '#FFD966'
    case 'completed':
    case 'done':
      return '#8BD3B7'
    default:
      return '#D3D3D3'
  }
}

// Fetch subtasks
async function fetchSubtasks(taskId) {
  try {
    const res = await fetch(`http://localhost:3000/subtask/task/${taskId}`)
    return await res.json()
  } catch (err) {
    console.error('Failed to fetch subtasks:', err)
    return []
  }
}

// Fetch tasks for selected project
async function fetchProjectTasks(projectId) {
  await taskStore.fetchTasksByProject(projectId)

  // Map tasks with subtasks
  tasksWithSubtasks.value = await Promise.all(
    taskStore.tasks.map(async (task) => {
      const subtasks = await fetchSubtasks(task.id)
      return {
        taskname: task.t_name,
        description: task.t_description,
        taskpriority: task.t_priority || 'none',
        status: task.t_status || 'Not Started',
        user: task.user_avatar || null,
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

// Computed lists for Kanban
const notStartedTasks = computed(() =>
  tasksWithSubtasks.value.filter((t) => (t.status || '').toLowerCase() === 'not started'),
)
const inProgressTasks = computed(() =>
  tasksWithSubtasks.value.filter((t) => (t.status || '').toLowerCase() === 'in progress'),
)
const completedTasks = computed(() =>
  tasksWithSubtasks.value.filter((t) => (t.status || '').toLowerCase() === 'completed'),
)

// Computed rows for Gantt
const ganttRows = computed(() =>
  tasksWithSubtasks.value.map((task) => ({
    label: task.taskname,
    tasks: task.subtasks,
  })),
)

// Computed tasks for Table view
const mappedTasks = computed(() =>
  tasksWithSubtasks.value.map((task) => ({
    name: task.taskname,
    description: task.description,
    priority: task.taskpriority,
    status: task.status,
    start_date: task.start_date,
    due_date: task.due_date,
    icon: task.user,
  })),
)

// Set current project based on route
async function setCurrentProject() {
  if (!projectStore.projects.length) await projectStore.fetchProjects()
  const selectedProject = projectStore.projects.find((p) => p.id === Number(route.params.id))
  projectStore.setCurrent(selectedProject)
  if (selectedProject) await fetchProjectTasks(selectedProject.id)
}

// Watch route changes
watch(
  () => route.params.id,
  async () => setCurrentProject(),
)

onMounted(async () => {
  await setCurrentProject()
})

const project = computed(() => projectStore.current)

// Placeholder function for opening form
function openForm() {
  console.log('Open project form')
}
</script>
