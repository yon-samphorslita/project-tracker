<template>
  <div class="flex w-full gap-4 bg-main-bg">
    <div
      v-for="p in topProjects"
      :key="p.id"
      class="flex flex-col justify-between w-72 h-40 p-4 border rounded-xl shadow-md border-l-4"
      :class="{
        'border-red-500': p.priority === 'high',
        'border-yellow-500': p.priority === 'medium',
        'border-green-500': p.priority === 'low',
      }"
      @click="goToProjectPage(p.id)"
    >
      <div class="text-lg font-semibold text-gray-text w-full">{{ p.p_name }}</div>

      <div class="pt-2">
        <div>Progress</div>
        <ProgressBar :completed="p.completedTasks" :total="p.totalTasks" />
      </div>

      <div class="flex justify-between items-center">
        <div
          class="text-sm font-medium p-1 w-auto rounded-md"
          :class="{
            'bg-red-300 text-red-800': p.priority === 'high',
            'bg-yellow-300 text-yellow-800': p.priority === 'medium',
            'bg-green-300 text-green-800': p.priority === 'low',
          }"
        >
          {{ p.priority }}
        </div>
        <div class="text-sm -end text-sub-text">
          {{ p.daysRemaining > 0 ? `${p.daysRemaining} days left` : 'Overdue' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressBar from '@/components/progressBar.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
  tasks: {
    type: Array,
    default: () => [],
  },
})
const router = useRouter()
const topProjects = computed(() => {
  return props.projects
    .filter((p) => p.status !== 'completed')
    .map((p) => {
      const relatedTasks = props.tasks.filter((t) => t.project?.id === p.id)
      const totalTasks = relatedTasks.length
      const completedTasks = relatedTasks.filter((t) => t.t_status === 'completed').length

      return {
        ...p,
        totalTasks,
        completedTasks,
        progress: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        daysRemaining: Math.ceil((new Date(p.due_date) - new Date()) / (1000 * 60 * 60 * 24)),
      }
    })
    .sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(a.due_date) - new Date(b.due_date)
    })
    .slice(0, 3)
})

function goToProjectPage(projectId) {
  router.push(`/project/${projectId}`)
}
</script>
