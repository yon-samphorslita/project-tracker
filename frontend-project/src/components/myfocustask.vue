<template>
  <div class="w-full p-4 bg-yellow-100 rounded-xl shadow-md hover:shadow-lg transition">
    <div class="flex flex-col">
      <!-- Header -->
      <div class="flex justify-between mb-3 gap-2">
        <div class="text-lg font-semibold text-gray-800" @click="goToTaskPage">
          {{ focusTask.t_name }}
        </div>
        <div class="text-sm text-gray-500">
          {{ daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue' }}
        </div>
      </div>

      <!-- Status Badge -->
      <!-- <div
        class="text-sm font-medium mb-3 w-max inline-block px-2 py-1 rounded-md"
        :class="statusColorClass(focusTask.t_status)"
      >
        {{ focusTask.t_status }}       
      </div> -->
      <div class="flex flex-grow items-center">
        <ProgressBar :completed="completedSubtasks" :total="totalSubtasks" />
      </div>

      <!-- Subtask Checklist -->
      <div v-if="subtasks.length" class="flex flex-col gap-2">
        <div v-for="sub in subtasks" :key="sub.id" class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            class="w-4 h-4 accent-blue-500 cursor-pointer"
            :checked="sub.status === 'completed'"
            @change="toggleSubtask(sub)"
          />
          <span
            :class="[
              'text-sm',
              sub.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700',
            ]"
          >
            {{ sub.name }}
          </span>
        </div>
      </div>

      <div v-else class="text-sm text-gray-500 italic mt-2">No subtasks yet</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import ProgressBar from '@/components/progressBar.vue'
import { useSubtaskStore } from '@/stores/subtask'
import { useRouter } from 'vue-router'

const props = defineProps({
  focusTask: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const subtaskStore = useSubtaskStore()
const subtasks = ref<any[]>([])

// Load subtasks related to this focus task
onMounted(async () => {
  subtasks.value = await subtaskStore.fetchByTask(props.focusTask.id)
})

// Computed properties for subtask stats
const totalSubtasks = computed(() => subtasks.value.length)
const completedSubtasks = computed(
  () => subtasks.value.filter((s) => s.status === 'completed').length,
)

// Calculate days remaining
const daysRemaining = computed(() => {
  if (!props.focusTask.due_date) return 0
  const today = new Date()
  const due = new Date(props.focusTask.due_date)
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
})

// Update subtask status in real-time
async function toggleSubtask(sub: any) {
  const newStatus = sub.status === 'completed' ? 'not started' : 'completed'
  const updated = await subtaskStore.updateSubtask(sub.id, { status: newStatus })
  if (updated) {
    const target = subtasks.value.find((s) => s.id === sub.id)
    if (target) target.status = updated.status
  }
}

// Style for task status
function statusColorClass(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'not started':
      return 'bg-gray-200 text-gray-700'
    case 'in progress':
      return 'bg-yellow-200 text-yellow-800'
    case 'completed':
      return 'bg-green-200 text-green-800'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}

// Navigation to task page
// function goToTaskPage() {
//   if (props.focusTask?.id) router.push(`/task/${props.focusTask.id}`)

// }
function goToTaskPage() {
  if (props.focusTask?.id) {
    router.push({
      path: `/task`,
      query: { highlight: props.focusTask.id }, // <-- add this
    })
  }
}
</script>
