<template>
  <div class="border border-gray-700/80 rounded-md">
    <div class="p-6 flex flex-col gap-6">
      <!-- Header Row -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <div class="text-lg font-semibold text-gray-900">
            {{ name || 'Project Name' }}
            <span class="ml-2">
              <Status :status="status || 'not started'" />
            </span>
          </div>
        </div>
        <Status :priority="priority || 'not started'" />
      </div>

      <div class="border-t border-dashed border-gray-700/80"></div>

      <!-- Info Row -->
      <div class="flex justify-between items-center px-2">
        <DescriptionLabel label="Start Date" :description="formatDate(startdate)" />
        <DescriptionLabel label="End Date" :description="formatDate(enddate)" />
        <DescriptionLabel label="Progress">
          <ProgressBar :completed="completedTasks" :total="totalTasks" />
        </DescriptionLabel>
<DescriptionLabel label="Members">
          <div class="flex -space-x-2">
            <template v-if="allMembers.length">
              <img
                v-for="member in allMembers"
                :key="member.id"
                :src="member.img_url || '/default-avatar.png'"
                :alt="`${member.first_name} ${member.last_name}`"
                class="w-8 h-8 rounded-full border-2 border-white"
                :title="`${member.first_name} ${member.last_name}`"
              />
            </template>
            <span v-else class="text-gray-400">None</span>
          </div>
        </DescriptionLabel>
      </div>

      <div class="border-t border-dashed border-gray-700/80"></div>

      <!-- Description -->
      <div class="px-2 text-gray-700">
        {{ detail || 'No description provided.' }}
      </div>
    </div>

    <!-- View Button -->
    <button
      @click="goToProjectPage"
      class="w-full border-t border-gray-700/80 py-2 text-gray-700 hover:bg-gray-100 transition"
    >
      View details
    </button>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { storeToRefs } from 'pinia'

import Status from './status.vue'
import DescriptionLabel from './descriptionLabel.vue'
import ProgressBar from './progressBar.vue'

const props = defineProps({
  name: String,
  detail: String,
  startdate: String,
  enddate: String,
  status: String,
  priority: String,
  project: Object,
})

const router = useRouter()
const taskStore = useTaskStore()
const { tasks } = storeToRefs(taskStore)

// Fetch tasks whenever project changes
watch(
  () => props.project,
  async (newProject) => {
    if (!newProject?.id) return
    taskStore.tasks = [] // reset previous tasks
    await taskStore.fetchTasksByProject(newProject.id)
  },
  { immediate: true },
)
const allMembers = computed(() => {
  const team = props.project?.team
  if (!team) return []

  const combined = [
    ...(team.mainMembers || []),
    ...(team.members || []),
    // ...(team.pms || []),
  ]

  // Remove duplicates by ID
  const unique = new Map(combined.map((m) => [m.id, m]))
  return Array.from(unique.values())
})
const projectTasks = computed(() => tasks.value.filter((t) => t.project?.id === props.project?.id))

const totalTasks = computed(() => projectTasks.value.length)

const completedTasks = computed(
  () => projectTasks.value.filter((t) => t.t_status?.toLowerCase() === 'completed').length,
)

function goToProjectPage() {
  if (props.project?.id) router.push(`/project/${props.project.id}`)
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
