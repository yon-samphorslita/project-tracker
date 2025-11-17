<template>
  <TaskLayout>
    <div class="flex flex-col gap-4">
      <!-- Header  -->
      <div v-if="userRole === 'admin' || userRole === 'project_manager'" class="w-full">
        <div class="text-xl font-semibold">Task Overview</div>
        <div class="flex gap-4 w-full">
          <OverviewCard title="Total Tasks" :value="totalTasks" class="w-72" />
          <OverviewCard title="Overdue Tasks" :value="overdueTasks" class="w-72" />
          <OverviewCard title="Completed Tasks" :value="completedTasks" class="w-72"/>
        </div>
      </div>

      <div class="flex flex-col gap-4 bg-main-bg">

        <div class="flex justify-between items-center">
          <!-- Filter Project  -->    
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
        
      <!-- Task Display  -->
      <div v-if="userRole === 'admin' || userRole === 'project_manager'" class="flex flex-col gap-3 border rounded-2xl bg-main-bg h-full">
        <Table class="w-full border-collapse table-fixed"
          :data="mappedFilteredSortedProjects"
          :columns="tableColumns"
          :format-date="formatDate"
        >
          <template #actions="{ row }">
            <div class="flex gap-2">
              <View class="icon-theme w-6 h-6" @click="viewTask(row)" />
              <Edit class="icon-theme w-6 h-6" @click="editTask(row)" />
              <Delete class="icon-theme w-6 h-6" @click="deleteTask(row)" />
            </div>
          </template>
        </Table>
      </div>
      <div v-else-if="userRole === 'member'" class="flex flex-col gap-3 border rounded-2xl p-4 bg-main-bg h-full">
        <TaskCard :tasks="filteredTasks" :highlighted-id="highlightedId" @edit-task="handleEdit" @delete-task="handleDelete" />
      </div>
    </div>
  </TaskLayout>
</template>

<script setup lang="ts">
import TaskCard from '@/components/detail-cards/taskCard.vue'
import TaskLayout from '@/views/pageLayout.vue'
import Search from '@/components/common-used/search.vue'
import Filter from '@/components/common-used/filter.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import Table from '@/components/charts/table.vue'
import View from '@/assets/icons/view.svg'
import Edit from '@/assets/icons/edit.svg'
import Delete from '@/assets/icons/delete.svg'
import { computed, onMounted, ref, watch } from 'vue'
import { useProjectStore } from '@/stores/project'
import axios from 'axios'
import { useTaskStore } from '@/stores/task'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'
import router from '@/router'

// state
const showTaskForm = ref(false)
const searchQuery = ref('')
const selectedSort = ref('')
const isProjectDropdownOpen = ref(false)
const selectedProject = ref('all')

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const teamStore = useTeamStore()

const userRole = computed(() => authStore.user?.role || 'user')
const userId = computed(() => authStore.user?.id)

const tableColumns = [
  { key: 'task', label: 'Task Name' },
  { key: 'project', label: 'Project' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'icon', label: 'Assignee' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]

const totalTasks = computed(() => taskStore.tasks.length)

const overdueTasks = computed(() => {
  const today = new Date()
  return taskStore.tasks.filter(
    (t) => new Date(t.due_date) < today && t.t_status?.toLowerCase() !== 'completed',
  ).length
})

const completedTasks = computed(() =>
  taskStore.tasks.filter((t) => t.t_status?.toLowerCase() === 'completed').length
)

const pmTeams = computed(() => {
  if (userRole.value !== 'project_manager') return []
  return teamStore.teams.filter(team => team.pms?.some(pm => pm.id === userId.value))
})

const teamProjects = computed(() => {
  return pmTeams.value.flatMap(team => team.projects || [])
})  

const projectOptions = computed(() => {
  if (userRole.value === 'admin') {
    // Admin: show all projects 
    return [
      { value: 'all', label: 'All Projects' },
      ...projectStore.projects.map(p => ({ value: String(p.id), label: p.p_name })),
    ]
  } 
  else if (userRole.value === 'project_manager') {
    // PM: show only projects they manage
    const pmProjectMap = new Map(teamProjects.value.map(p => [p.id, p.p_name]))
    return [
      { value: 'all', label: 'All Projects' },
      ...Array.from(pmProjectMap, ([id, name]) => ({ value: String(id), label: name }))
    ]
  } else {
    // Member: show only projects they have assigned tasks in
    const userProjects = new Map()
    taskStore.tasks.forEach((task) => {
      if (task.project) {
        userProjects.set(task.project.id, task.project.p_name)
      }
    })

    return [
      { value: 'all', label: 'All Projects' },
      ...Array.from(userProjects, ([id, name]) => ({
        value: String(id),
        label: name,
      })),
    ]
  }
})

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

const pmProjectIds = computed(() => {
  if (userRole.value !== 'project_manager') return []
  return teamStore.teams
    .filter(team => team.pms?.some(pm => pm.id === userId.value))
    .flatMap(team => team.projects?.map(p => p.id) || [])
})

// Filter tasks by selected project
const filteredTasks = computed(() => {
  let list = [...taskStore.tasks]
  console.log('Initial task list:', list)

  let pmlist = pmProjectIds.value
  console.log('PM Project IDs:', pmlist)
  
  // Role-based filtering
  if (userRole.value === 'admin') {
    // Admin sees all tasks, no filtering needed
  }
  else if (userRole.value === 'project_manager') {
    list = list.filter(t => pmProjectIds.value.includes(t.project?.id))
  } else if (userRole.value === 'member') {
    list = list.filter((t) => t.user?.id === userId.value)
  }


  // Filter by selected project
  if (selectedProject.value !== 'all') {
    list = list.filter((t) => String(t.project?.id) === selectedProject.value)
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

// Sorting
const applySort = (option) => {
  selectedSort.value = option
}

const formatDate = (dateStr) =>
  !dateStr
    ? 'TBD'
    : new Date(dateStr).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })

// Actions 
const viewTask = (row) => router.push(`/task/${row.id}`)
const editTaskInfo = ref(null)
const showEditTaskForm = ref(false)

const editTask = (row) => {
  const task = taskStore.tasks.find((p) => p.id === row.id)
  if (!task) return
  editTaskInfo.value = {
    id: task.id,
    name: task.t_name,
    description: task.t_description,
    startDate: task.start_date,
    dueDate: task.due_date,
    priority: task.t_priority,
    status: task.t_status,
    assignee: task.user?.id || null,
  }
  showEditTaskForm.value = true
}


const deleteTask = async (row) => {
  const task = taskStore.tasks.find((t) => t.id === row.id)
  if (!task) return
  if (confirm(`Are you sure you want to delete task "${row.name}"?`)) {
    await taskStore.deleteTask(task.id)
  }
}

// Computed properties for subtask stats
const getTotalSubtasks = (task) => task.subtasks?.length || 0
const getCompletedSubtasks = (task) =>
  task.subtasks?.filter((t) => t.status?.toLowerCase() === 'completed').length || 0

const mappedFilteredSortedProjects = computed(() =>
  filteredTasks.value.map((t) => ({
    id: t.id,
    task: t.t_name,
    project: t.project?.p_name ,
    priority: t.t_priority,
    status: t.t_status,
    start_date: t.start_date,
    due_date: t.due_date,
    icon: t.user?.img_url || null,
    completed: getCompletedSubtasks(t),
    total: getTotalSubtasks(t),
  })),
)

onMounted(async () => {
  await teamStore.fetchTeams()
  await projectStore.fetchProjects()
  
  if (userRole.value === 'admin') {
    await taskStore.fetchTasks() 
  }
  else if (userRole.value === 'project_manager') {
    await taskStore.fetchTasksForPM()
  } else {
    await taskStore.fetchTasks()
  }
})

const route = useRoute()
const highlightedId = ref<string | null>(null)

watch(
  () => route.query.highlight,
  (val) => {
    if (val) {
      highlightedId.value = String(val)
      // remove after a short delay (optional)
      setTimeout(() => {
        highlightedId.value = null
      }, 800)
    }
  },
  { immediate: true }
)
</script>
