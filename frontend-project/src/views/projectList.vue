<template>
  <ProjectLayout>
    <div class="container flex flex-col gap-4">
      <div class="flex font-semibold text-2xl">All Projects</div>

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
          <search @update="searchQuery = $event" />
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
      <div v-if="!isReady" class="text-center py-4 text-gray-500">Loading projects...</div>

      <!-- Admin Table View -->
      <Table
        v-if="isReady && userRole === 'admin'"
        :data="mappedFilteredSortedProjects"
        :columns="tableColumns"
        :format-date="formatDate"
      />

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
const showForm = ref(false)
const searchQuery = ref('')
const isReady = ref(false)
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
])

// Sorting state
const selectedSort = ref('')
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

// Search and Sort
const filteredSortedProjects = computed(() => {
  let list = [...projectStore.projects]

  // Apply search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.p_name.toLowerCase().includes(q) ||
        (p.p_description && p.p_description.toLowerCase().includes(q)),
    )
  }

  // Apply sorting
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

// For admin table
const mappedFilteredSortedProjects = computed(() =>
  filteredSortedProjects.value.map((p) => ({
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

function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Fetch data
onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()
  await projectStore.fetchProjects()
  isReady.value = true
})

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
  { type: 'select', label: 'Assignee', options: Teams, model: 'assignee' }, // ✅ restored
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

// When a new project is created
function onProjectCreated(project) {
  projectStore.projects.push(project)
}
</script>
