<template>
  <div class="flex flex-col gap-6 mt-2">
    <!-- Header Controls -->
    <div class="flex justify-between gap-2 items-center">
      <TypeList v-model:activeOption="activeOption" />
      <div class="flex gap-2 items-center">
        <Search @update="searchQuery = $event" />
        <Filter
          class="min-w-fit"
          title="Filter Tasks"
          :fields="filterFields"
          @update="applyFilters"
        />
      </div>
    </div>

    <!-- Task Views -->
    <div class="flex gap-4 mt-4">
      <template v-if="activeOption === 'Kanban'">
        <Kanban
          v-for="status in ['Not Started', 'In Progress', 'Completed']"
          :key="status"
          :kanbantasks="filteredTasksByStatus(status)"
          :kanbanTaskStatus="status"
          :kanbanTaskNum="filteredTasksByStatus(status).length"
          :format-date="formatDate"
          @editTask="editTask"
          @deleteTask="$emit('onTaskDeleted', $event)"
        />
      </template>

      <template v-else-if="activeOption === 'Gantt'">
        <GanttChart :rows="ganttRows.length ? ganttRows : []" :format-date="formatDate" />
      </template>

      <template v-else-if="activeOption === 'Table'">
        <Table
          :data="filteredTasksWithSubtasks"
          :columns="tableColumns"
          :format-date="formatDate"
          @statusUpdated="handleStatusUpdate"
        >
          <template #actions="{ row }">
            <div class="flex gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                :style="{ fill: 'var(--graysvg-text)' }"
                class="cursor-pointer"
                @click="editTask(row)"
              >
                <path
                  d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C20.8027 6.94749 20.8762 6.8376 20.9264 6.71663C20.9766 6.59565 21.0024 6.46597 21.0024 6.335C21.0024 6.20403 20.9766 6.07435 20.9264 5.95338C20.8762 5.83241 20.8027 5.72252 20.71 5.63L18.37 3.29C18.2775 3.1973 18.1676 3.12375 18.0466 3.07357C17.9257 3.02339 17.796 2.99756 17.665 2.99756C17.534 2.99756 17.4043 3.02339 17.2834 3.07357C17.1624 3.12375 17.0525 3.1973 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                class="cursor-pointer"
                :style="{ fill: 'var(--graysvg-text)' }"
                @click="$emit('onTaskDeleted', row)"
              >
                <path
                  fill-rule="evenodd"
                  d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"
                />
              </svg>
            </div>
          </template>
        </Table>
      </template>
    </div>
    <!-- Edit Task Form -->
    <EditForm
      v-model="showEditTaskForm"
      title="Edit Task"
      :fields="taskFields"
      :initialData="editTaskData"
      endpoint="tasks"
      @submitted="handleTaskUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import Table from '@/components/table.vue'
import Kanban from '@/components/kanban.vue'
import GanttChart from '@/components/gantt.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import TypeList from '@/components/typeList.vue'
import EditForm from '@/components/editForm.vue'
import { useTaskStore } from '@/stores/task'
const props = defineProps({
  project: Object,
  tasks: Array,
  TeamMembers: Array,
  tableColumns: Array,
  taskFields: Array,
})
const taskStore = useTaskStore()
const emit = defineEmits(['onTaskCreated', 'onTaskUpdated', 'onTaskDeleted', 'onStatusUpdated'])

const activeOption = ref('Table')
const showEditTaskForm = ref(false)
const editTaskData = ref({})
const searchQuery = ref('')
// reactive filter state
const activeFilters = reactive({
  priority: '',
  user: '',
})

const filteredTasksByStatus = (status) =>
  filteredTasksWithSubtasks.value.filter((t) => t.status?.toLowerCase() === status.toLowerCase())
const filterFields = computed(() => [
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: '', label: 'All' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
  },
  {
    key: 'user',
    label: 'Assigned To',
    type: 'select',
    options: [
      { value: '', label: 'All' },
      ...(props.TeamMembers || []).map((u) => ({ value: u.id, label: u.name })),
    ],
  },
])
//search and filter tasks
const filteredTasksWithSubtasks = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return props.tasks.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    const matchesPriority = activeFilters.priority
      ? t.priority?.toLowerCase() === activeFilters.priority.toLowerCase()
      : true
    const matchesUser = activeFilters.user ? t.user?.id === activeFilters.user : true
    return matchesSearch && matchesPriority && matchesUser
  })
})
function applyFilters(filters) {
  Object.assign(activeFilters, filters)
}

// gantt rows
const ganttRows = computed(() =>
  filteredTasksWithSubtasks.value.map((task) => ({
    label: task.title,
    tasks:
      task.subtasks?.map((st) => ({
        name: st.name,
        start: st.start ? new Date(st.start) : new Date(task.start_date),
        end: st.end ? new Date(st.end) : new Date(task.due_date),
        color:
          st.status === 'completed'
            ? '#BBDFCE'
            : '' || st.status === 'not started'
              ? '#FFD5DB'
              : '' || st.status === 'in progress'
                ? '#D9CBFB'
                : '',
        icon: task.user?.img_url || null,
      })) || [],
  })),
)

function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
async function handleStatusUpdate({ id, status }) {
  await taskStore.updateTask(id, { t_status: status })
  emit('statusUpdated', { id, status })
}

//edit task
function editTask(row) {
  editTaskData.value = {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    dueDate: row.due_date,
    priority: row.priority,
    user: row.user?.id || null,
  }
  showEditTaskForm.value = true
}

function handleTaskUpdated(taskData) {
  emit('onTaskUpdated', taskData)
  showEditTaskForm.value = false
}
</script>
