<template>
  <ProjectLayout>
    <div class="container flex flex-col gap-4">
      <!-- <div class="text-2xl font-semibold">All Projects</div> -->

      <!-- Admin Dashboard -->
      <div v-if="userRole === 'admin'" class="flex flex-col gap-4">
        <!-- Overview & PieChart -->
        <div class="flex w-full justify-between gap-4">
          <div class="grid grid-cols-2 gap-4 flex-1">
            <OverviewCard title="Total Projects" :value="totalProjects" />
            <OverviewCard title="Overdue Projects" :value="overdueProjects" />
            <OverviewCard title="Completed Projects" :value="completedProjects" />
          </div>
          <PieChart :data="statusData" :height="280" class="w-[600px]" />
        </div>

        <!-- Header: Create + Search + Filter -->
        <div class="flex justify-between items-center w-full gap-4">
          <Button label="+ New Project" @click="showForm = true" />
          <Form
            v-model:modelValue="showForm"
            formTitle="Create Project"
            :fields="projectFields"
            endpoint="projects"
            @submitted="onProjectCreated"
            :fullScreen="true"
          />
          <div class="flex gap-4 items-center">
            <Search v-model:query="searchQuery" />
            <Filter title="Sort by" :options="sortOptions" @select="applySort" class="min-w-fit" />
          </div>
        </div>

        <!-- Projects Table -->
        <Table
          :data="mappedFilteredSortedProjects"
          :columns="tableColumns"
          :format-date="formatDate"
        >
          <template #actions="{ row }">
            <div class="flex gap-2">
              <View class="icon-theme w-6 h-6" @click="viewProject(row)" />
              <Edit class="icon-theme w-6 h-6" @click="editProject(row)" />
              <Delete class="icon-theme w-6 h-6" @click="deleteProject(row)" />
            </div>
          </template>
        </Table>

        <!-- Edit Project Form -->
        <EditForm
          v-model="showEditProjectForm"
          title="Edit Project"
          :fields="projectFields"
          :initialData="editProjectData"
          endpoint="projects"
          @submitted="onEditProjectSubmitted"
        />
      </div>

      <!-- Non-Admin Project Cards -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <div class="flex gap-4 items-center w-full">
            <Search v-model:query="searchQuery" />
            <Filter title="Sort by" :options="sortOptions" @select="applySort" class="min-w-fit" />
          </div>
          <Button
            v-if="userRole === 'admin' || userRole === 'project_manager'"
            label="+ New Project"
            @click="showForm = true"
            class="w-[156px]"
          />
          <Form
            v-model:modelValue="showForm"
            formTitle="Create Project"
            :fields="projectFields"
            endpoint="projects"
            @submitted="onProjectCreated"
          />
        </div>

        <div class="h-[600px] overflow-y-auto flex flex-col gap-4">
          <ProjectCard
            v-for="project in filteredSortedProjects"
            :key="project.id"
            :project="project"
            :name="project.p_name"
            :detail="project.p_description"
            :startdate="project.start_date"
            :enddate="project.due_date"
            :status="project.status"
            :priority="project.priority"
            :members="project.assignee?.name || 'None'"
            :completedTasks="getCompletedTasks(project)"
            :totalTasks="getTotalTasks(project)"
          />
        </div>
      </div>
    </div>
  </ProjectLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Components
import ProjectLayout from '@/views/pageLayout.vue'
import ProjectCard from '@/components/detail-cards/projectCard.vue'
import Search from '@/components/common-used/search.vue'
import Filter from '@/components/common-used/filter.vue'
import Table from '@/components/charts/table.vue'
import Button from '@/components/common-used/button.vue'
import Form from '@/components/forms/form.vue'
import PieChart from '@/components/charts/pieChart.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import EditForm from '@/components/forms/editForm.vue'

// Icons
import View from '@/assets/icons/view.svg'
import Edit from '@/assets/icons/edit.svg'
import Delete from '@/assets/icons/delete.svg'

// Stores
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useTeamStore } from '@/stores/team'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const router = useRouter()

// State
const showForm = ref(false)
const showEditProjectForm = ref(false)
const editProjectData = ref(null)
const searchQuery = ref('')
const selectedSort = ref('')
const isReady = ref(false)
const userRole = computed(() => authStore.user?.role || 'user')

// Table Columns & Sort Options
const tableColumns = [
  { key: 'name', label: 'Project Name' },
  { key: 'description', label: 'Description' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'icon', label: 'PM' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]
const sortOptions = [
  { value: 'priority-High', label: 'Priority (High → Low)' },
  { value: 'priority-Low', label: 'Priority (Low → High)' },
  { value: 'due-soonest', label: 'Due (Soonest first)' },
  { value: 'due-latest', label: 'Due (Latest first)' },
]

// Form Fields
const projectFields = [
  { type: 'text', label: 'Project Title', placeholder: 'Enter project title', model: 'title', required: true },
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
    model: 'teamId',
    required: true
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
  { type: 'datetime-local', label: 'Start Date', model: 'startDate', required: true },
  { type: 'datetime-local', label: 'Due Date', model: 'dueDate', required: true },
]

// Helpers
const formatDate = (dateStr) =>
  !dateStr
    ? 'TBD'
    : new Date(dateStr).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
const priorityValue = (priority) => ({ high: 3, medium: 2, low: 1 })[priority?.toLowerCase()] || 0

const getTotalTasks = (project) => project.tasks?.length || 0

const getCompletedTasks = (project) =>
  project.tasks?.filter((t) => t.t_status?.toLowerCase() === 'completed').length || 0

// Computed: Filtered & Sorted Projects
const filteredSortedProjects = computed(() => {
  let list = [...projectStore.projects]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (p) => p.p_name.toLowerCase().includes(q) || p.p_description?.toLowerCase().includes(q),
    )
  }
  switch (selectedSort.value) {
    case 'priority-High':
      return list.sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority))
    case 'priority-Low':
      return list.sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority))
    case 'due-soonest':
      return list.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    case 'due-latest':
      return list.sort((a, b) => new Date(b.due_date) - new Date(a.due_date))
    default:
      return list
  }
})

const mappedFilteredSortedProjects = computed(() =>
  filteredSortedProjects.value.map((p) => ({
    id: p.id,
    name: p.p_name,
    description: p.p_description,
    priority: p.priority,
    status: p.status,
    start_date: p.start_date,
    due_date: p.due_date,
    icon: p.user?.img_url || null,
    completed: getCompletedTasks(p),
    total: getTotalTasks(p),
  })),
)

// Fetch Data
onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()
  await teamStore.fetchTeams()
  await projectStore.fetchProjects()

  taskStore.tasks = []

  // Fetch tasks
  await Promise.all(
    projectStore.projects.map(async (p) => {
      const tasks = (await taskStore.fetchTasksByProject(p.id)) || []
      taskStore.tasks.push(...tasks)
    }),
  )

  isReady.value = true
})

// Sorting
const applySort = (option) => (selectedSort.value = option)

// Project Actions
const onProjectCreated = (project) => projectStore.projects.push(project)

const editProject = (row) => {
  const project = projectStore.projects.find((p) => p.id === row.id)
  if (!project) return
  editProjectData.value = {
    id: project.id,
    title: project.p_name,
    description: project.p_description,
    startDate: project.start_date,
    dueDate: project.due_date,
    priority: project.priority,
    status: project.status,
    teamId: project.team?.id || null,
  }
  showEditProjectForm.value = true
}

const deleteProject = async (row) => {
  const project = projectStore.projects.find((p) => p.id === row.id)
  if (!project) return
  if (confirm(`Are you sure you want to delete project "${row.name}"?`)) {
    await projectStore.deleteProject(project.id)
  }
}

const onEditProjectSubmitted = (updatedProject) => {
  projectStore.projects = projectStore.projects.map((p) =>
    p.id === updatedProject.id ? updatedProject : p,
  )
  showEditProjectForm.value = false
}

const viewProject = (row) => router.push(`/project/${row.id}`)

// Overview Computed
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
const statusData = computed(() => {
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
  return Object.entries(summary).map(([type, value]) => ({ type, value }))
})
</script>
