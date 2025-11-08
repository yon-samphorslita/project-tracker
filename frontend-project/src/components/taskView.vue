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
        <GanttChart
          :rows="ganttRows.length ? ganttRows : []"
          :format-date="formatDate"
          title="Tasks"
        />
      </template>

      <template v-else-if="activeOption === 'Table'">
        <Table
          :data="filteredTasksWithSubtasks"
          :columns="tableColumns"
          :format-date="formatDate"
          @statusUpdated="handleStatusUpdate"
        >
          <template
            v-if="userRole === 'admin' || userRole === 'project_manager'"
            #actions="{ row }"
          >
            <div class="flex gap-2">
              <EditIcon class="w-6 h-6 cursor-pointer icon-theme" @click="editTask(row)" />
              <DeleteIcon
                class="w-6 h-6 cursor-pointer icon-theme"
                @click="$emit('onTaskDeleted', row)"
              />
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
import Table from '@/components/charts/table.vue'
import Kanban from '@/components/kanban.vue'
import GanttChart from '@/components/charts/gantt.vue'
import Search from '@/components/common-used/search.vue'
import Filter from '@/components/common-used/filter.vue'
import TypeList from '@/components/charts/typeList.vue'
import EditForm from '@/components/editForm.vue'
import EditIcon from '@/assets/icons/edit.svg'
import DeleteIcon from '@/assets/icons/delete.svg'
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
