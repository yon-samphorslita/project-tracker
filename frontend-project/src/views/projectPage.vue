<template>
  <ProjectLayout>
    <div v-if="project" class="container flex flex-col gap-4">
      <!-- Project Title & Description -->
<div class="flex gap-4">
        <h1 class="text-2xl font-bold">{{ project.p_name }}</h1>
<img src="../assets/icons/edit.svg
"></img>
</div>      <p class="text-gray-600">{{ project.p_description }}</p>

      <!-- Timeline & Status -->
      <div class="row flex items-center justify-between mt-4 w-3/4">
        <div class="flex text-[#1E1E1E] opacity-80 gap-2">
          <div class="flex items-center gap-2">
            <div class="text-lg">Timeline:</div>
            <DescriptionLabel :description="formatDate(project.start_date)" />
            <span>-</span>
            <DescriptionLabel :description="formatDate(project.due_date)" />
          </div>
        </div>

        <div class="flex gap-2 mt-4 items-center justify-center text-[#1E1E1E] opacity-80">
          <div class="text-lg">Status:</div>
          <Status :status="project.status" />
        </div>
      </div>

      <!-- TypeList & Search -->
      <div class="flex justify-between">
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
          <GanttChart :rows="rows" :format-date="formatDate" />
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
import ProjectLayout from './projectLayout.vue'
import DescriptionLabel from '@/components/descriptionLabel.vue'
import Status from '@/components/status.vue'
import TypeList from '@/components/typeList.vue'
import Search from '@/components/search.vue'
import Kanban from '@/components/kanban.vue'
import GanttChart from '@/components/gantt.vue'
import Table from '@/components/table.vue'
import axios from 'axios'

const route = useRoute()
const projectStore = useProjectStore()
const tasks = ref([]) // all tasks for the current project
const activeOption = ref('Kanban') // default active view
const API_BASE_URL = 'http://localhost:3000'

onMounted(async () => {
  if (!projectStore.projects.length) await projectStore.fetchProjects()
  await setCurrentProject()
})

// Watch route changes
watch(() => route.params.id, async () => setCurrentProject())

async function setCurrentProject() {
  const selectedProject = projectStore.projects.find(p => p.id === Number(route.params.id))
  projectStore.setCurrent(selectedProject)
  if (selectedProject) await fetchProjectTasks(selectedProject.id)
}

async function fetchProjectTasks(projectId) {
  try {
    // Fetch tasks for Kanban and Table views
    const taskResponse = await axios.get(`${API_BASE_URL}/tasks/project/${projectId}`)
    const fetchedTasks = taskResponse.data

    // Fetch subtasks for each task for Gantt view
    tasks.value = await Promise.all(
      fetchedTasks.map(async task => {
        const subtaskResponse = await axios.get(`${API_BASE_URL}/subtask/task/${task.id}`)
        return {
          taskname: task.t_name,
          description: task.t_description,
          taskpriority: task.t_priority || 'none',
          status: task.t_status || 'Not Started',
          user: task.user_avatar || null,
          start_date: task.start_date,
          due_date: task.due_date,
          subtasks: subtaskResponse.data.map(st => ({
            name: st.name,
            start: st.start_date ? new Date(st.start_date) : task.start_date ? new Date(task.start_date) : new Date(),
            end: st.due_date ? new Date(st.due_date) : task.due_date ? new Date(task.due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: st.status,
            color: getSubtaskColor(st.status),
            icon: st.user_avatar || null
          }))
        }
      })
    )
  } catch (error) {
    console.error('Failed to fetch project tasks or subtasks:', error)
  }
}

const notStartedTasks = computed(() =>
  tasks.value.filter(t => (t.status || '').toLowerCase() === 'not started')
)
const inProgressTasks = computed(() =>
  tasks.value.filter(t => (t.status || '').toLowerCase() === 'in progress')
)
const completedTasks = computed(() =>
  tasks.value.filter(t => (t.status || '').toLowerCase() === 'completed')
)

const rows = computed(() =>
  tasks.value.map(task => ({
    label: task.taskname,
    tasks: task.subtasks
  }))
)

const tableColumns = ref([
  { key: 'name', label: 'Task Name' },
  { key: 'description', label: 'Description' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'icon', label: 'Assignee' }
])

const mappedTasks = computed(() =>
  tasks.value.map(task => ({
    name: task.taskname,
    description: task.description,
    priority: task.taskpriority,
    status: task.status,
    start_date: task.start_date,
    due_date: task.due_date,
    icon: task.user
  }))
)

function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getSubtaskColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'not started':
    case 'not_started':
      return '#FFD5DB' // pink
    case 'in progress':
    case 'in_progress':
      return '#FFD966' // yellow
    case 'completed':
    case 'done':
      return '#8BD3B7' // green
    default:
      return '#D3D3D3' // fallback gray
  }
}

const project = computed(() => projectStore.current)
</script>