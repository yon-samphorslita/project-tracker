<template>
  <ProjectLayout>
    <div v-if="project" class="container flex flex-col gap-4">
      <!-- Project Header -->
      <div class="flex gap-4 items-center">
        <h1 class="text-2xl font-bold">{{ project.p_name }}</h1>
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

      <p class="text-gray-600">{{ project.p_description }}</p>

      <!-- Timeline & Status -->
      <div class="flex items-center justify-between mt-4 w-[60%]">
        <div class="flex text-[#1E1E1E] opacity-80 gap-2">
          <div class="flex items-center gap-2">
            <div class="text-lg">Timeline:</div>
            <DescriptionLabel :description="formatDate(project.start_date)" />
            <span>-</span>
            <DescriptionLabel :description="formatDate(project.due_date)" />
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex gap-2 items-center text-[#1E1E1E] opacity-80">
            <div class="text-lg">Status:</div>
            <Status :status="project.status" />
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
      </div>

      <!-- Type & Search -->
      <div class="flex justify-between items-center mt-4">
        <TypeList v-model:activeOption="activeOption" />
        <Search @update="searchQuery = $event" />
      </div>

      <!-- Task Views -->
      <div class="flex gap-4 mt-4">
        <template v-if="activeOption === 'Kanban'">
          <Kanban
            v-for="status in ['Not Started', 'In Progress', 'Completed']"
            :key="status"
            :kanbantasks="filteredTasksByStatus(status)"
            :kanbanTaskStatus="status"
            :kanbanTaskNum="filteredTasksByStatus(status).length"
          />
        </template>

        <template v-else-if="activeOption === 'Gantt'">
          <GanttChart :rows="ganttRows" :format-date="formatDate" />
        </template>

        <template v-else-if="activeOption === 'Table'">
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

          <Form
            v-model:modelValue="showEditTaskForm"
            formTitle="Edit Task"
            :fields="taskFields"
            :initialData="editTaskData"
            endpoint="tasks"
            @submitted="onTaskCreated"
          />
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
import Form from '@/components/form.vue'

// Stores
const route = useRoute()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

// Reactive state
const activeOption = ref('Kanban')
const tasksWithSubtasks = ref([])
const showTaskForm = ref(false)
const showEditProjectForm = ref(false)
const editProjectData = ref(null)
const showEditTaskForm = ref(false)
const editTaskData = ref(null)
const searchQuery = ref('')

// Table columns
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

// Form fields
const taskFields = [
  { type: 'text', label: 'Task Name', placeholder: 'Enter task name', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  { type: 'date', label: 'Start Date', model: 'startDate' },
  { type: 'date', label: 'Due Date', model: 'dueDate' },
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
]

// Project form fields
const Teams = [
  { id: 1, name: 'Team A' },
  { id: 2, name: 'Team B' },
  { id: 3, name: 'Team C' },
]
const projectFields = [
  { type: 'text', label: 'Project Title', placeholder: 'Enter project title', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  { type: 'select', label: 'Assignee', options: Teams, model: 'assignee' },
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
  { type: 'date', label: 'Start Date', model: 'startDate' },
  { type: 'date', label: 'Due Date', model: 'dueDate' },
]

// Computed
const project = computed(() => projectStore.current)

const filteredTasksWithSubtasks = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return tasksWithSubtasks.value
    .map((task) => ({
      ...task,
      subtasks: task.subtasks.filter((st) => st.name.toLowerCase().includes(q)),
    }))
    .filter(
      (task) =>
        task.taskname.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        task.subtasks.length > 0,
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
    icon: task.user,
  })),
)

const ganttRows = computed(() =>
  filteredTasksWithSubtasks.value.map((task) => ({
    label: task.taskname,
    tasks: task.subtasks,
  })),
)

function filteredTasksByStatus(status) {
  return filteredTasksWithSubtasks.value.filter(
    (t) => t.status.toLowerCase() === status.toLowerCase(),
  )
}

// Helpers
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

// Fetch subtasks
async function fetchSubtasks(taskId) {
  try {
    const res = await fetch(`http://localhost:3000/subtasks/task/${taskId}`)
    return await res.json()
  } catch {
    return []
  }
}

// Fetch tasks with subtasks
async function fetchProjectTasks(projectId) {
  taskStore.tasks = taskStore.tasks.filter((t) => String(t.project?.id) !== String(projectId))
  await taskStore.fetchTasksByProject(projectId)

  tasksWithSubtasks.value = await Promise.all(
    taskStore.tasks
      .filter((t) => String(t.project?.id) === String(projectId))
      .map(async (task) => {
        const subtasks = await fetchSubtasks(task.id)
        return {
          id: task.id,
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

// Project selection
async function setCurrentProject() {
  if (!projectStore.projects.length) await projectStore.fetchProjects()
  const selectedProject = projectStore.projects.find((p) => p.id === Number(route.params.id))
  projectStore.setCurrent(selectedProject)
  if (selectedProject) await fetchProjectTasks(selectedProject.id)
}

watch(
  () => route.params.id,
  () => setCurrentProject(),
)
onMounted(() => setCurrentProject())

// Edit project
function openEditProjectForm(project) {
  editProjectData.value = {
    id: project.id,
    title: project.p_name,
    description: project.p_description,
    startDate: project.start_date,
    dueDate: project.due_date,
    status: project.status,
    priority: project.priority,
  }
  showEditProjectForm.value = true
}

async function onProjectUpdated() {
  const latestProject = await projectStore.fetchProjectById(project.value.id)
  projectStore.setCurrent(latestProject)
  showEditProjectForm.value = false
}

// Edit & Delete tasks
function editTask(row) {
  const task = taskStore.tasks.find((t) => t.id === row.id)
  if (!task) return
  editTaskData.value = {
    id: task.id,
    title: task.t_name,
    description: task.t_description,
    startDate: task.start_date,
    dueDate: task.due_date,
    priority: task.t_priority,
    status: task.t_status,
    project_id: task.project?.id,
  }
  showEditTaskForm.value = true
}

async function deleteTask(row) {
  const task = taskStore.tasks.find((t) => t.id === row.id)
  if (!task) return
  if (confirm(`Are you sure you want to delete task "${row.name}"?`)) {
    await taskStore.deleteTask(task.id)
    fetchProjectTasks(projectStore.current.id)
  }
}

function onTaskCreated() {
  fetchProjectTasks(projectStore.current.id)
}
</script>
