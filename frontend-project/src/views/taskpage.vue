<template>
  <TaskLayout>
    <div class="flex flex-col gap-4">
      <!-- Header  -->
      <div class="flex flex-col gap-4 bg-main-bg">
        <!-- Filter Project  -->
        <div class="flex justify-between items-center">
          <div class="relative inline-block text-left">
            <button
              @click="toggleProjectDropdown"
              class="inline-flex justify-between items-center w-64 px-4 py-2 text-sm font-medium text-gray-text bg-main-bg border border-gray-300 rounded-lg shadow-sm hover:brightness-90"
            >
              {{ selectedProjectLabel }}
              <svg
                class="w-4 h-4 ml-2 text-sub-text"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              v-if="isProjectDropdownOpen"
              class="absolute z-10 mt-2 w-64 bg-main-bg border border-gray-200 rounded-lg shadow-lg"
            >
              <ul class="py-1">
                <li
                  v-for="option in projectOptions"
                  :key="option.value"
                  @click="selectProject(option)"
                  class="px-4 py-2 text-sm text-gray-text hover:bg-black/15 cursor-pointer"
                >
                  {{ option.label }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Search and Sort by funtion  -->
          <div class="flex gap-4 items-center">
            <Search v-model:query="searchQuery" />
            <Filter class="min-w-fit" title="Sort by" :options="sortOptions" @select="applySort" />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 border rounded-2xl p-4 bg-main-bg h-full">
        <TaskCard :tasks="filteredTasks" @edit-task="handleEdit" @delete-task="handleDelete" />
      </div>
    </div>
  </TaskLayout>
</template>

<script setup lang="ts">
import TaskCard from '@/components/detail-cards/taskCard.vue'
import TaskLayout from './pageLayout.vue'
import Search from '@/components/common-used/search.vue'
import Filter from '@/components/common-used/filter.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useProjectStore } from '@/stores/project'
import axios from 'axios'
import { useTaskStore } from '@/stores/task'

// state
const showTaskForm = ref(false)
const searchQuery = ref('')
const selectedSort = ref('')
const isProjectDropdownOpen = ref(false)
const selectedProject = ref('all')

const projectStore = useProjectStore()
const taskStore = useTaskStore()

const projectOptions = computed(() => [
  { value: 'all', label: 'All Projects' },
  ...projectStore.projects.map((p) => ({
    value: p.id,
    label: p.p_name,
  })),
])

const sortOptions = [
  { value: 'priority-asc', label: 'Priority (Low → High)' },
  { value: 'priority-desc', label: 'Priority (High → Low)' },
  { value: 'due-asc', label: 'Due Date (Earliest First)' },
  { value: 'due-desc', label: 'Due Date (Latest First)' },
]

function handleEdit(id: number) {
  console.log('Edit task ID:', id)
}

function handleDelete(id: number) {
  console.log('Delete task ID:', id)
}

function toggleProjectDropdown() {
  isProjectDropdownOpen.value = !isProjectDropdownOpen.value
}

function selectProject(option: { value: string; label: string }) {
  selectedProject.value = option.value
  isProjectDropdownOpen.value = false
}

const selectedProjectLabel = computed(() => {
  return (
    projectOptions.value.find((opt) => opt.value === selectedProject.value)?.label ||
    'Select Project'
  )
})

// Filter tasks by selected project
const filteredTasks = computed(() => {
  let list = [...taskStore.tasks]

  // Filter by selected project
  if (selectedProject.value !== 'all') {
    // const selected = projectOptions.value.find(p => p.value === selectedProject.value)
    list = list.filter((t) => t.project?.id === selectedProject.value)
  }

  // Filter by search query (task name or project name)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (t) => t.t_name.toLowerCase().includes(q) || t.project?.p_name.toLowerCase().includes(q),
    )
  }

  // Sort
  if (selectedSort.value) {
    if (selectedSort.value === 'priority-asc') {
      const priorityOrder = { low: 1, medium: 2, high: 3 }
      list.sort((a, b) => (priorityOrder[a.t_priority] || 0) - (priorityOrder[b.t_priority] || 0))
    } else if (selectedSort.value === 'priority-desc') {
      const priorityOrder = { low: 1, medium: 2, high: 3 }
      list.sort((a, b) => (priorityOrder[b.t_priority] || 0) - (priorityOrder[a.t_priority] || 0))
    } else if (selectedSort.value === 'due-asc') {
      list.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    } else if (selectedSort.value === 'due-desc') {
      list.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
    }
  }

  // console.log(
  //   'Filtering tasks:',
  //   'Selected project:', selectedProject.value,
  //   'Task projects:', list.map(t => t.project?.id)
  // )

  return list
})

// watch(filteredTasks, (newVal) => {
//   console.log('Filtered tasks:', newVal.map(t => t.t_name))
// })

// Sorting
const applySort = (option) => {
  selectedSort.value = option
}

onMounted(async () => {
  await projectStore.fetchProjects()
  await taskStore.fetchTasks()
})
</script>
