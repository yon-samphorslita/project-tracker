<template>
  <ProjectLayout>
    <div class="container flex flex-col gap-4 pt-6">
      <div class="flex font-semibold text-2xl">All Projects</div>

      <!-- Loading -->
      <div v-if="!isReady" class="text-center py-4 text-gray-500">Loading projects...</div>

      <!-- Admin Dashboard -->
      <div v-if="isReady && userRole === 'admin'" class="flex flex-col gap-4">
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
          <Button
            label="+ New Project"
            btn-color="#C6E7FF"
            btntext="black"
            @click="showForm = true"
          />
          <Form
            v-model:modelValue="showForm"
            formTitle="Create Project"
            :fields="projectFields"
            endpoint="projects"
            @submitted="onProjectCreated"
          />
          <div class="flex gap-4 items-center">
            <Search @update="searchQuery = $event" />
            <Filter class="min-w-fit" title="Sort by" :options="sortOptions" @select="applySort" />
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
              <img
                src="../assets/icons/view.svg"
                alt="View"
                class="cursor-pointer"
                @click="viewProject(row)"
              />
              <img
                src="../assets/icons/edit.svg"
                alt="Edit"
                class="cursor-pointer"
                @click="editProject(row)"
              />
              <img
                src="../assets/icons/delete.svg"
                alt="Delete"
                class="cursor-pointer"
                @click="deleteProject(row)"
              />
            </div>
          </template>
        </Table>

        <!-- Edit Project Form -->
        <Form
          v-model:modelValue="showEditProjectForm"
          formTitle="Edit Project"
          :fields="projectFields"
          :initialData="editProjectData"
          endpoint="projects"
          @submitted="onEditProjectSubmitted"
        />
      </div>

      <!-- Non-Admin Project Cards -->
      <div v-else-if="isReady" class="flex flex-col gap-4">
        <!-- Header -->
        <div class="flex justify-between items-center w-full gap-4">
          <Button
            label="+ New Project"
            btn-color="#C6E7FF"
            btntext="black"
            @click="showForm = true"
          />
          <Form
            v-model:modelValue="showForm"
            formTitle="Create Project"
            :fields="projectFields"
            endpoint="projects"
            @submitted="onProjectCreated"
          />
          <div class="flex gap-4 items-center">
            <Search @update="searchQuery = $event" />
            <Filter class="min-w-fit" title="Sort by" :options="sortOptions" @select="applySort" />
          </div>
        </div>

        <!-- Project Cards -->
        <div class="h-[600px] overflow-y-auto gap-4 flex flex-col">
          <ProjectCard
            v-for="project in filteredSortedProjects"
            :key="project.id"
            :project="project"
            :name="project.p_name"
            :detail="project.p_description"
            :startdate="project.start_date"
            :enddate="project.due_date"
            :status="project.status"
            :members="project.assignee?.name || 'None'"
            :completedTasks="getCompletedTasks(project.id)"
            :totalTasks="getTotalTasks(project.id)"
          />
        </div>
      </div>
    </div>
  </ProjectLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProjectLayout from './pageLayout.vue'
import ProjectCard from '@/components/projectCard.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import Table from '@/components/table.vue'
import Button from '@/components/button.vue'
import Form from '@/components/form.vue'
import PieChart from '@/components/pieChart.vue'
import OverviewCard from '@/components/overviewCard.vue'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'

// Stores
const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()

// State
const showForm = ref(false)
const showEditProjectForm = ref(false)
const editProjectData = ref(null)
const searchQuery = ref('')
const selectedSort = ref('')
const isReady = ref(false)
const userRole = computed(() => authStore.user?.role || 'user')
import { useRouter } from 'vue-router'
const router = useRouter()

const viewProject = (row) => {
  router.push(`/project/${row.id}`)
}

// Table & Sort Options
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

// Teams & Form Fields
const Teams = [
  // { id: 1, name: 'Team A' },
  // { id: 2, name: 'Team B' },
  // { id: 3, name: 'Team C' },
]
const projectFields = [
  { type: 'text', label: 'Project Title', placeholder: 'Enter project title', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  {
    type: 'select',
    label: 'Assignee',
    options: teamStore.teams.map((team) => ({
      id: team.id,
      name: team.name,
    })),
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
    icon: p.assignee?.avatar || null,
    completed: getCompletedTasks(p.id),
    total: getTotalTasks(p.id),
  })),
)

// Task helpers
const getTotalTasks = (projectId) =>
  taskStore.tasks.filter((t) => String(t.project?.id) === String(projectId)).length
const getCompletedTasks = (projectId) =>
  taskStore.tasks.filter(
    (t) => String(t.project?.id) === String(projectId) && t.t_status?.toLowerCase() === 'completed',
  ).length

// Fetch data on mount
onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()
  await teamStore.fetchTeams()
  await projectStore.fetchProjects()
  taskStore.tasks = []
  for (const p of projectStore.projects) await taskStore.fetchTasksByProject(p.id)
  isReady.value = true
})

// Sorting handler
const applySort = (option) => {
  selectedSort.value = option
}

// Project actions
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
    // assignee: project.assignee?.id || null,
    team_id: project.team?.id || null,
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
