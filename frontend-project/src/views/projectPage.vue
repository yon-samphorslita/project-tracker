<template>
  <ProjectLayout>
    <div v-if="project" class="container flex flex-col gap-4">
      <h1 class="text-2xl font-bold">{{ project.p_name }}</h1>
      <p class="text-gray-600">{{ project.p_description }}</p>

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

      <div class="flex justify-between">
        <TypeList />
        <Search />
      </div>

      <div class="flex gap-4 mt-4">
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
      </div>
    </div>

    <div v-else class="container text-gray-600">No project selected.</div>
  </ProjectLayout>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import ProjectLayout from './projectLayout.vue'
import DescriptionLabel from '@/components/descriptionLabel.vue'
import Status from '@/components/status.vue'
import TypeList from '@/components/typeList.vue'
import Search from '@/components/search.vue'
import Kanban from '@/components/kanban.vue'
import axios from 'axios'

const route = useRoute()
const projectStore = useProjectStore()
const tasks = ref([]) // all tasks for the current project

const API_BASE_URL = 'http://localhost:3000'

// Fetch projects if not already loaded
onMounted(async () => {
  if (!projectStore.projects.length) {
    await projectStore.fetchProjects()
  }
  setCurrentProject()
})

// Watch route changes to load new project
watch(
  () => route.params.id,
  () => {
    setCurrentProject()
  },
)

async function setCurrentProject() {
  const selectedProject = projectStore.projects.find((p) => p.id === Number(route.params.id))
  projectStore.setCurrent(selectedProject)

  if (selectedProject) {
    await fetchProjectTasks(selectedProject.id)
  }
}

// Fetch tasks from backend
async function fetchProjectTasks(projectId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/project/${projectId}`)
    tasks.value = response.data.map((t) => ({
      taskname: t.t_name,
      description: t.t_description,
      taskstatus: t.t_status,
      taskpriority: t.t_priority,
      start_date: t.start_date,
      due_date: t.due_date,
      user: t.img_src, 
    }))
  } catch (error) {
    console.error('Failed to fetch project tasks:', error)
  }
}

// Computed for selected project
const project = computed(() => projectStore.current)

// Filter tasks by status
const notStartedTasks = computed(() =>
  tasks.value.filter((t) => t.taskstatus && t.taskstatus.toLowerCase() === 'not started'),
)
const inProgressTasks = computed(() =>
  tasks.value.filter((t) => t.taskstatus && t.taskstatus.toLowerCase() === 'in progress'),
)
const completedTasks = computed(() =>
  tasks.value.filter((t) => t.taskstatus && t.taskstatus.toLowerCase() === 'completed'),
)

// Format date
function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
