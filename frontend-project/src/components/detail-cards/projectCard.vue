<template>
  <div class="border border-[var(--darkgray-bg)] rounded-md">
    <div class="p-6 flex flex-col gap-6">
      <!-- Header Row -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <div class="text-lg font-semibold text-gray-text">
            {{ name || 'Project Name' }}
            <span class="ml-2">
              <Status :status="status || 'not started'" />
            </span>
          </div>
        </div>
        <Status :priority="priority || 'not started'" />
      </div>

      <div class="border-t border-dashed border-[var(--darkgray-bg)]"></div>

      <!-- Info Row -->
      <div class="flex justify-between items-center px-2">
        <DescriptionLabel label="Start Date" :description="formatDate(startdate)" />
        <DescriptionLabel label="End Date" :description="formatDate(enddate)" />
        <DescriptionLabel label="Progress">
          <ProgressBar :completed="getCompletedTasks(project)" :total="getTotalTasks(project)" />
        </DescriptionLabel>
        <DescriptionLabel label="Members">
          <div class="flex -space-x-2 items-center">
            <template v-if="displayMembers.length">
              <!-- First 3 member icons -->
              <img
                v-for="member in displayMembers"
                :key="member.id"
                :src="member.img_url || '/default-avatar.png'"
                :alt="`${member.first_name} ${member.last_name}`"
                class="w-8 h-8 rounded-full border-2 border-white object-cover"
                :title="`${member.first_name} ${member.last_name}`"
              />

              <!-- +N more -->
              <div
                v-if="extraCount > 0"
                class="w-8 h-8 rounded-full border-2 border-white bg-gray-300 text-xs flex items-center justify-center text-gray-700"
              >
                +{{ extraCount }}
              </div>
            </template>

            <span v-else class="text-sub-text">None</span>
          </div>
        </DescriptionLabel>
      </div>

      <div class="border-t border-dashed border-[var(--darkgray-bg)]"></div>

      <!-- Description -->
      <div class="px-2 text-gray-text">
        {{ detail || 'No description provided.' }}
      </div>
    </div>

    <!-- View Button -->
    <button
      @click="goToProjectPage"
      class="w-full border-t border-[var(--darkgray-bg)] py-2 text-gray-text hover:bg-black/15 transition"
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

import Status from '@/components/status.vue'
import DescriptionLabel from '@/components/descriptionLabel.vue'
import ProgressBar from '@/components/progressBar.vue'

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
    taskStore.tasks = [] // reset
    const projectTasks = await taskStore.fetchTasksByProject(newProject.id)
    taskStore.tasks.push(...projectTasks)
  },
  { immediate: true },
)

const allMembers = computed(() => {
  const team = props.project?.team
  if (!team) return []
  const combined = [...(team.mainMembers || []), ...(team.members || [])]
  return Array.from(new Map(combined.map((m) => [m.id, m])).values()) // remove duplicates
})

const displayMembers = computed(() => {
  const members = allMembers.value || []
  return members.slice(0, 3)
})

const extraCount = computed(() => {
  const members = allMembers.value || []
  return members.length > 3 ? members.length - 3 : 0
})

const getTotalTasks = (project) => project.tasks?.length || 0

// Only consider task's own status
const getCompletedTasks = (project) =>
  project.tasks?.filter((t) => t.t_status?.toLowerCase() === 'completed').length || 0

function goToProjectPage() {
  if (props.project?.id) router.push(`/project/${props.project.id}`)
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
