<template>
  <div class="container">
    <!-- Filters (unchanged) -->
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

    <!-- Table -->
    <Table :data="mappedTasks" :columns="tableColumns" :format-date="formatDate" />

    <!-- Calendar -->
    <Calendar
      v-model="calendarDate"
      :events="rows.flatMap((r) => r.tasks.map((t) => ({ date: t.start, title: t.name })))"
      :start-week-on-monday="true"
      :locale="'en-US'"
      show-header
      show-footer
      max-event-dots="3"
    />

    <!-- Gantt -->
    <GanttChart :rows="rows" :format-date="formatDate" />
    <ProjectCard />
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import GanttChart from './components/gantt.vue'
import Filter from './components/filter.vue'
import Footer from './components/footer.vue'
import Calendar from './components/calendar.vue'
import Table from './components/table.vue'
import ProjectCard from './components/projectCard.vue'
const projectId = ref(1)
const tasks = ref([])
const projectName = ref('Project Tasks')

// Fetch tasks
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

// helpers
function toLocalISO(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const todayISO = new Date().toISOString().split('T')[0]

// Map backend tasks and normalize dates to YYYY-MM-DD (local)
const mappedTasks = computed(() =>
  tasks.value.map((task) => {
    const startIso = toLocalISO(task.start_date) || todayISO
    const dueIso = toLocalISO(task.due_date) || todayISO
    return {
      id: task.id,
      name: task.t_name,
      status: task.t_status,
      priority: task.t_priority,
      start_date: startIso,
      due_date: dueIso,
      icon: '/icons/user1.png',
    }
  }),
)

// Table columns
const tableColumns = [
  { key: 'name', label: 'Task Name' },
  { key: 'icon', label: 'Assignee' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
]

// rows to feed to Gantt (single project row)
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

// calendar date model (optional)
const calendarDate = ref(new Date().toISOString().split('T')[0])

// formatDate
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
}

// dummy filter handlers
const applySort = (o) => console.log('sort', o)
const applyTaskFilters = (f) => console.log('filters', f)
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
