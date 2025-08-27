<template>
  <div class="container">
    <!-- Role Selection -->
    <div class="role-selection flex gap-4 mb-4">
      <button @click="selectRole('project_manager')" class="btn btn-green">
        Join as Project Manager
      </button>
      <button @click="selectRole('member')" class="btn btn-blue">Join as Team Member</button>
    </div>

    <!-- Filters -->
    <Filter
      title="Sort by"
      :options="[
        { value: 'priority-High', label: 'Priority (High → Low)' },
        { value: 'priority-Low', label: 'Priority (Low → High)' },
        { value: 'due-soonest', label: 'Due (Soonest first)' },
        { value: 'due-latest', label: 'Due (Latest first)' },
      ]"
      @select="applySort"
    />
    <Filter
      title="Filter Tasks"
      :fields="[
        {
          key: 'priority',
          label: 'Priority',
          type: 'select',
          options: [
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
          ],
        },
        { key: 'dueDate', label: 'Due Date', type: 'date' },
      ]"
      @update="applyTaskFilters"
    />

    <!-- Task Table -->
    <Table :data="mappedTasks" :columns="tableColumns" :format-date="formatDate" />

    <!-- Calendar -->
    <Calendar
      v-model="calendarDate"
      :events="rows.flatMap((r) => r.tasks.map((t) => ({ date: t.start, title: t.name })))"
      :start-week-on-monday="true"
      locale="en-US"
      show-header
      show-footer
      max-event-dots="3"
    />

    <!-- Gantt Chart -->
    <GanttChart :rows="rows" :format-date="formatDate" />

    <ProjectCard />
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

import GanttChart from './components/gantt.vue'
import Filter from './components/filter.vue'
import Footer from './components/footer.vue'
import Calendar from './components/calendar.vue'
import Table from './components/table.vue'
import ProjectCard from './components/projectCard.vue'

// Router
const router = useRouter()

// Role selection
const currentRole = ref(localStorage.getItem('role') || 'none')
function selectRole(role) {
  localStorage.setItem('role', role)
  currentRole.value = role
  router.push('/signup')
}

// Tasks
const projectId = ref(1)
const tasks = ref([])
const projectName = ref('Project Tasks')

async function fetchTasks() {
  try {
    const res = await fetch(`http://localhost:3000/tasks/project/${projectId.value}`)
    const data = await res.json()
    tasks.value = data || []
    if (tasks.value.length && tasks.value[0].project) {
      projectName.value = tasks.value[0].project.p_name || 'Project Tasks'
    }
  } catch (e) {
    console.warn('API unavailable, using empty tasks')
    tasks.value = []
  }
}
onMounted(fetchTasks)
watch(projectId, fetchTasks)

// Helpers
function toLocalISO(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const todayISO = new Date().toISOString().split('T')[0]

// Computed
const mappedTasks = computed(() =>
  tasks.value.map((task) => ({
    id: task.id,
    name: task.t_name,
    status: task.t_status,
    priority: task.t_priority,
    start_date: toLocalISO(task.start_date) || todayISO,
    due_date: toLocalISO(task.due_date) || todayISO,
    icon: '/icons/user1.png',
  })),
)

const tableColumns = [
  { key: 'name', label: 'Task Name' },
  { key: 'icon', label: 'Assignee' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
]

const rows = computed(() => [
  {
    label: projectName.value,
    tasks: mappedTasks.value.map((t) => ({
      name: t.name,
      start: t.start_date,
      end: t.due_date,
      icon: t.icon,
    })),
  },
])

const calendarDate = ref(todayISO)
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
}

// Dummy filters
const applySort = (o) => console.log('sort', o)
const applyTaskFilters = (f) => console.log('filters', f)
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
}
.btn-blue {
  background-color: #3b82f6;
}
.btn-green {
  background-color: #10b981;
}
</style>
