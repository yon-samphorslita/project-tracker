<template>
  <ProjectLayout>
    <div class="container flex flex-col gap-4">
      <!-- ADMIN DASHBOARD -->
      <div v-if="userRole === 'admin'" class="flex flex-col gap-8">
        <!-- Overview & PieCharts -->
        <div class="flex flex-col w-full justify-between gap-8">
          <div class="grid grid-cols-4 gap-8">
            <OverviewCard title="Total Projects" :value="totalProjects" />
            <OverviewCard title="Overdue Projects" :value="overdueProjects" />
            <OverviewCard title="Completed Projects" :value="completedProjects" />
            <OverviewCard title="Teams Involved" :value="teamsInvolved" />
          </div>

          <div class="flex gap-8 justify-between">
            <PieChart :data="statusData" :height="280" title="Project Status" />
            <PieChart :data="projectsPerTeam" :height="280" title="Project Count per Team" />
          </div>
        </div>

        <!-- Header: Create + Search + Sort -->
        <div class="flex justify-between items-center w-full gap-4">
          <Button label="+ Create New Project" @click="showForm = true" />

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
            <Filter title="Sort by" :options="sortOptions" @select="applySort" />
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

        <EditForm
          v-model="showEditProjectForm"
          title="Edit Project"
          :fields="projectFields"
          :initialData="editProjectData"
          endpoint="projects"
          @submitted="onEditProjectSubmitted"
        />
      </div>

      <!-- NON-ADMIN PROJECT CARDS -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex justify-between items-center w-full">
          <div class="flex gap-4 w-full">
            <Search v-model:query="searchQuery" />
            <Filter title="Sort by" :options="sortOptions" @select="applySort" />
          </div>

          <Button
            v-if="userRole === 'admin' || userRole === 'project_manager'"
            label="+ Create New Project"
            @click="showForm = true"
          />
        </div>

        <Form
          v-model:modelValue="showForm"
          formTitle="Create Project"
          :fields="projectFields"
          endpoint="projects"
          @submitted="onProjectCreated"
        />

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// COMPONENTS
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

// ICONS
import View from '@/assets/icons/view.svg'
import Edit from '@/assets/icons/edit.svg'
import Delete from '@/assets/icons/delete.svg'

// STORES
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useTeamStore } from '@/stores/team'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()

// STATE
const showForm = ref(false)
const showEditProjectForm = ref(false)
const editProjectData = ref(null)
const searchQuery = ref('')
const selectedSort = ref('')

const userRole = computed(() => authStore.user?.role || 'user')
import { computed, watchEffect, reactive } from 'vue'

const teamOptions = computed(() => {
  if (!authStore.user) return []

  if (userRole.value === 'admin') {
    return teamStore.teams.map((t) => ({ id: t.id, name: t.name }))
  }

  // For project manager: only their own teams
  return authStore.user.pmTeams?.map((t) => ({ id: t.id, name: t.name })) || []
})

// TABLE COLUMNS
const tableColumns = [
  { key: 'name', label: 'Project Name' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'icon', label: 'Team' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]

const sortOptions = [
  { value: 'priorityHigh', label: 'Priority (High → Low)' },
  { value: 'priorityLow', label: 'Priority (Low → High)' },
  { value: 'dueSoon', label: 'Due (Soonest)' },
  { value: 'dueLate', label: 'Due (Latest)' },
]

// FORM FIELDS
const projectFields = reactive([
  { type: 'text', label: 'Project Title', model: 'title', required: true },
  { type: 'datetime-local', label: 'Start Date', model: 'startDate' },
  { type: 'datetime-local', label: 'Due Date', model: 'dueDate', required: true },
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
    label: 'Assign Team',
    options: [],
    model: 'teamId',
    required: true,
  },
  { type: 'textarea', label: 'Description', model: 'description' },
])
watchEffect(() => {
  const teamField = projectFields.find((f) => f.model === 'teamId')
  if (teamField) teamField.options = teamOptions.value
})
// HELPERS
const formatDate = (dateStr) => {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const priorityValue = (p) => ({ high: 3, medium: 2, low: 1 })[p?.toLowerCase()] || 0
const getTotalTasks = (project) => project.tasks?.length || 0
const getCompletedTasks = (project) =>
  project.tasks?.filter((t) => t.t_status?.toLowerCase() === 'completed').length || 0

// FILTER + SORT
const filteredSortedProjects = computed(() => {
  let list = [...projectStore.projects]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (p) => p.p_name.toLowerCase().includes(q) || p.p_description?.toLowerCase().includes(q),
    )
  }

  switch (selectedSort.value) {
    case 'priorityHigh':
      list.sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority))
      break
    case 'priorityLow':
      list.sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority))
      break
    case 'dueSoon':
      list.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      break
    case 'dueLate':
      list.sort((a, b) => new Date(b.due_date) - new Date(a.due_date))
      break
    default:
      list.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  }

  // completed last
  list.sort((a, b) => (a.status === 'completed') - (b.status === 'completed'))

  return list
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
    icon: p.team?.pms?.[0]?.img_url || null,
    completed: getCompletedTasks(p),
    total: getTotalTasks(p),
  })),
)

// SORT ACTION
const applySort = (option) => {
  selectedSort.value = option
}

// ACTIONS
const onProjectCreated = async (project) => {
  const updated = await applyOverdueStatus(project)
  projectStore.projects.push(updated)
}

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
  if (!confirm(`Delete project "${row.name}"?`)) return
  await projectStore.deleteProject(row.id)
}

const onEditProjectSubmitted = async (updated) => {
  const fixed = await applyOverdueStatus(updated)
  const index = projectStore.projects.findIndex((p) => p.id === fixed.id)
  if (index !== -1) projectStore.projects[index] = fixed
}

const viewProject = (row) => router.push(`/project/${row.id}`)

// OVERVIEW DATA
const totalProjects = computed(() => projectStore.projects.length)
const overdueProjects = computed(
  () =>
    projectStore.projects.filter((p) => isPastDue(p.due_date) && p.status !== 'completed').length,
)
const completedProjects = computed(
  () => projectStore.projects.filter((p) => p.status === 'completed').length,
)

const teamsInvolved = computed(() => {
  const teamIds = new Set()
  projectStore.projects.forEach((p) => p.team?.id && teamIds.add(p.team.id))
  return teamIds.size
})

const projectsPerTeam = computed(() => {
  const count = {}
  teamStore.teams.forEach((t) => (count[t.name] = 0))
  projectStore.projects.forEach((p) => p.team?.name && count[p.team.name]++)
  return Object.entries(count).map(([type, value]) => ({ type, value }))
})

const statusData = computed(() => {
  const map = { 'Not Started': 0, 'In Progress': 0, Completed: 0, Overdue: 0 }
  projectStore.projects.forEach((p) => {
    const s = p.status?.toLowerCase() || ''
    if (s === 'not started') map['Not Started']++
    else if (s === 'in progress') map['In Progress']++
    else if (s === 'completed') map['Completed']++
    else if (s === 'overdue') map['Overdue']++
    else map['Not Started']++
  })
  return Object.entries(map).map(([type, value]) => ({ type, value }))
})

// HELPER
function isPastDue(dueDate) {
  if (!dueDate) return false
  const now = new Date()
  const due = new Date(dueDate)
  return due.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)
}

// APPLY OVERDUE
async function applyOverdueStatus(project) {
  if (project.status === 'completed' || project.status === 'overdue') return project

  if (isPastDue(project.due_date)) {
    const updated = { ...project, status: 'overdue', priority: 'high' }
    await projectStore.updateProjectStatus(project.id, 'overdue', 'high')

    const index = projectStore.projects.findIndex((p) => p.id === project.id)
    if (index !== -1) projectStore.projects[index] = updated
    return updated
  }

  return project
}

// FETCH DATA ON MOUNT
onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()

  await teamStore.fetchTeams()
  await projectStore.fetchProjects()

  // APPLY OVERDUE REACTIVELY
  for (let i = 0; i < projectStore.projects.length; i++) {
    await applyOverdueStatus(projectStore.projects[i])
  }

  // FETCH TASKS
  taskStore.tasks = []
  for (const project of projectStore.projects) {
    const tasks = await taskStore.fetchTasksByProject(project.id)
    if (tasks) taskStore.tasks.push(...tasks)
  }
})
</script>
