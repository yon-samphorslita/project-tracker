<template>
  <ProjectLayout>
    <div class="container flex flex-col gap-4">
      <div class="flex font-semibold text-2xl">All Projects</div>

      <!-- Header -->
      <div class="flex justify-between items-center w-full">
        <Button
          label="+ New Project"
          btn-color="#C6E7FF"
          btntext="black"
          @click="showForm = true"
        />
        <Form
          formTitle="Create Project"
          :fields="projectFields"
          endpoint="projects"
          v-model:modelValue="showForm"
          @submitted="onProjectCreated"
        />
        <div class="flex gap-4 items-center">
          <Search @update="searchQuery = $event" />
          <Filter
            class="min-w-fit"
            title="Sort by"
            :options="[
              { value: 'priority-High', label: 'Priority (High → Low)' },
              { value: 'priority-Low', label: 'Priority (Low → High)' },
              { value: 'due-soonest', label: 'Due (Soonest first)' },
              { value: 'due-latest', label: 'Due (Latest first)' },
            ]"
            @select="applySort"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="!isReady" class="text-center py-4 text-gray-500">Loading projects...</div>

      <!-- Admin Table -->
      <div v-if="isReady && userRole === 'admin'">
        <Table
          :data="mappedFilteredSortedProjects"
          :columns="tableColumns"
          :format-date="formatDate"
        >
          <template #actions="{ row }">
            <div class="flex gap-2">
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

      <!-- Project Cards for other users -->
      <div v-else-if="isReady" class="flex flex-col gap-4">
        <ProjectCard
          v-for="project in filteredSortedProjects"
          :key="project.id"
          :name="project.p_name"
          :detail="project.p_description"
          :startdate="formatDate(project.start_date)"
          :enddate="formatDate(project.due_date)"
          :status="project.status"
          :project="project"
        />
      </div>
    </div>
  </ProjectLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ProjectLayout from './projectLayout.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import ProjectCard from '@/components/projectCard.vue'
import Table from '@/components/table.vue'
import Button from '@/components/button.vue'
import Form from '@/components/form.vue'
import { useProjectStore } from '@/stores/project'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const projectStore = useProjectStore()

// State
const showForm = ref(false)
const searchQuery = ref('')
const isReady = ref(false)
const showEditProjectForm = ref(false)
const editProjectData = ref(null)
const selectedSort = ref('')

// User role
const userRole = computed(() => authStore.user?.role || 'user')

// Table columns for admin
const tableColumns = ref([
  { key: 'name', label: 'Project Name' },
  { key: 'description', label: 'Description' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'icon', label: 'Assignee' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
])

// Teams for form
const Teams = [
  { id: 1, name: 'Team A' },
  { id: 2, name: 'Team B' },
  { id: 3, name: 'Team C' },
]

// Form fields
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

// Fetch data
onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()
  await projectStore.fetchProjects()
  isReady.value = true
})

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
function priorityValue(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'high':
      return 3
    case 'medium':
      return 2
    case 'low':
      return 1
    default:
      return 0
  }
}

// Search & sort
const filteredSortedProjects = computed(() => {
  let list = [...projectStore.projects]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.p_name.toLowerCase().includes(q) ||
        (p.p_description && p.p_description.toLowerCase().includes(q)),
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
  })),
)
function applySort(option) {
  selectedSort.value = option
}

// Project actions
function onProjectCreated(project) {
  projectStore.projects.push(project)
}

function editProject(row) {
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
    assignee: project.assignee?.id || null,
  }
  showEditProjectForm.value = true
}

async function deleteProject(row) {
  const project = projectStore.projects.find((p) => p.id === row.id)
  if (!project) return
  if (confirm(`Are you sure you want to delete project "${row.name}"?`)) {
    await projectStore.deleteProject(project.id)
  }
}

function onEditProjectSubmitted(updatedProject) {
  const index = projectStore.projects.findIndex((p) => p.id === updatedProject.id)
  if (index !== -1) projectStore.projects[index] = updatedProject
  showEditProjectForm.value = false
}
</script>
