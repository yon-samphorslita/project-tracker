<template>
  <ProjectLayout>
    <div class="container flex flex-col gap-4">
      <div class="flex font-semibold text-2xl">All Projects</div>

      <!-- Header with search & filter -->
      <div class="flex justify-between items-center w-full">
        <Button
          label="+ Create New Project"
          btn-color="#C6E7FF"
          btntext="black"
          @click="openForm"
        />
        <Form formTitle="Create Project" :fields="projectFields" endpoint="projects" />
        <div class="flex gap-4 items-center">
          <search />
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

      <!-- Admin Table View -->
      <Table
        v-if="isReady && userRole === 'admin'"
        :data="mappedProjects"
        :columns="tableColumns"
        :format-date="formatDate"
      />

      <!-- Project Cards for normal users -->
      <div v-else-if="isReady" class="flex flex-col gap-4">
        <ProjectCard
          v-for="project in projectStore.projects"
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
import search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import ProjectCard from '@/components/projectCard.vue'
import Table from '@/components/table.vue'
import { useProjectStore } from '@/stores/project'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/button.vue'
import Form from '@/components/form.vue'

const authStore = useAuthStore()
const projectStore = useProjectStore()

// Loading state
const isReady = ref(false)

// Computed user role
const userRole = computed(() => authStore.user?.role || 'user')

// Form visibility
const showForm = ref(false)
function openForm() {
  showForm.value = true
}

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

// Table columns for admin
const tableColumns = ref([
  { key: 'name', label: 'Project Name' },
  { key: 'description', label: 'Description' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'icon', label: 'Assignee' },
])

// Map projects for table display
const mappedProjects = computed(() =>
  projectStore.projects.map((p) => ({
    name: p.p_name,
    description: p.p_description,
    priority: p.priority,
    status: p.status,
    start_date: p.start_date,
    due_date: p.due_date,
    icon: p.assignee?.avatar || null,
  })),
)

// Fetch profile and projects
onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchProfile()
  }
  await projectStore.fetchProjects()
  isReady.value = true
})

// Sorting function
function applySort(option) {
  console.log('Selected sort option:', option)
  // implement sorting logic here if needed
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
