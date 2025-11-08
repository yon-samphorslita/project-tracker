<template>
  <TeamLayout>
    <div class="flex flex-col gap-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Team Details</h1>
        <Button @click="goBack" label="Back to Teams" />
      </div>

      <div class="border rounded-lg p-6 bg-main-bg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">{{ team.name }}</h2>

        <div>
          <div class="text-lg font-semibold mt-5 mb-2">Description</div>
          <div class="pl-4 mb-6 text-lg text-gray-text">
            {{ team.description || 'No description provided.' }}
          </div>
        </div>

        <!-- Project Manager  -->
        <div class="border rounded mb-3">
          <button
            @click="toggleAccordion('pms')"
            class="w-full text-left px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
            :style="{ backgroundColor: getColorFromId(team.id) }"
          >
            Project Managers ({{ team.pms.length }})
            <span>
              <svg
                v-if="openSections.includes('pms')"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M8.2 14q-.225 0-.362-.15T7.7 13.5q0-.05.15-.35l3.625-3.625q.125-.125.25-.175T12 9.3t.275.05t.25.175l3.625 3.625q.075.075.113.163t.037.187q0 .2-.137.35T15.8 14z"
                />
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11.475 14.475L7.85 10.85q-.075-.075-.112-.162T7.7 10.5q0-.2.138-.35T8.2 10h7.6q.225 0 .363.15t.137.35q0 .05-.15.35l-3.625 3.625q-.125.125-.25.175T12 14.7t-.275-.05t-.25-.175"
                />
              </svg>
            </span>
          </button>
          <div v-show="openSections.includes('pms')" class="p-4 overflow-x-auto">
            <div class="flex flex-col gap-2">
              <div
                v-for="pm in team.pms"
                :key="pm.id"
                class="flex items-center gap-3 border rounded-lg px-3 py-2 shadow-sm bg-gray50-bg hover:bg-gray-100"
                @click="gotoProfile(pm.id)"
              >
                <img
                  :src="pm.img_url"
                  alt="profile"
                  class="w-10 h-10 rounded-full object-cover mr-4"
                />
                <span class="font-medium">{{ pm.first_name }} {{ pm.last_name }}</span>
                <span class="font-medium">{{ pm.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Members  -->
        <div class="border rounded mb-3">
          <button
            @click="toggleAccordion('members')"
            class="w-full text-left px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
            :style="{ backgroundColor: getColorFromId(team.id) }"
          >
            Team Member ({{ allMembers.length }})
            <span>
              <svg
                v-if="openSections.includes('members')"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M8.2 14q-.225 0-.362-.15T7.7 13.5q0-.05.15-.35l3.625-3.625q.125-.125.25-.175T12 9.3t.275.05t.25.175l3.625 3.625q.075.075.113.163t.037.187q0 .2-.137.35T15.8 14z"
                />
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11.475 14.475L7.85 10.85q-.075-.075-.112-.162T7.7 10.5q0-.2.138-.35T8.2 10h7.6q.225 0 .363.15t.137.35q0 .05-.15.35l-3.625 3.625q-.125.125-.25.175T12 14.7t-.275-.05t-.25-.175"
                />
              </svg>
            </span>
          </button>
          <div v-show="openSections.includes('members')" class="p-4 overflow-x-auto">
            <div class="flex flex-col gap-2">
              <div
                v-for="member in allMembers"
                :key="member.id"
                class="flex items-center gap-3 border rounded-lg px-3 py-2 shadow-sm bg-gray50-bg hover:bg-gray-100"
                @click="gotoProfile(member.id)"
              >
                <img
                  :src="member.img_url"
                  alt="profile"
                  class="w-10 h-10 rounded-full object-cover mr-4"
                />
                <span class="font-medium">{{ member.first_name }} {{ member.last_name }}</span>
                <span class="font-medium">{{ member.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Assigned Project  -->
        <div class="border rounded mb-3">
          <button
            @click="toggleAccordion('projects')"
            :style="{ backgroundColor: getColorFromId(team.id) }"
            class="w-full text-left px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
          >
            Assigned Project ({{ team.projects.length }})
            <span>
              <svg
                v-if="openSections.includes('projects')"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M8.2 14q-.225 0-.362-.15T7.7 13.5q0-.05.15-.35l3.625-3.625q.125-.125.25-.175T12 9.3t.275.05t.25.175l3.625 3.625q.075.075.113.163t.037.187q0 .2-.137.35T15.8 14z"
                />
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11.475 14.475L7.85 10.85q-.075-.075-.112-.162T7.7 10.5q0-.2.138-.35T8.2 10h7.6q.225 0 .363.15t.137.35q0 .05-.15.35l-3.625 3.625q-.125.125-.25.175T12 14.7t-.275-.05t-.25-.175"
                />
              </svg>
            </span>
          </button>
          <div v-show="openSections.includes('projects')" class="p-4 overflow-x-auto">
            <div class="flex flex-col gap-4 h-[600px] overflow-y-auto">
              <ProjectCard
                v-for="project in team.projects"
                :key="project.id"
                :project="project"
                :name="project.p_name"
                :detail="project.p_description"
                :startdate="project.start_date"
                :enddate="project.due_date"
                :status="project.status"
                :priority="project.priority"
                :members="project.assignee?.name || 'None'"
                :completedTasks="getCompletedTasks(project.id)"
                :totalTasks="getTotalTasks(project.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </TeamLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TeamLayout from '@/views/pageLayout.vue'
import ProjectCard from '@/components/detail-cards/projectCard.vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useTeamStore } from '@/stores/team'
import Button from '@/components/common-used/button.vue'

// initialize store
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()

// define state
const teamId = route.params.id as string
const team = ref({
  id: 0,
  name: '',
  description: '',
  pms: [] as any[],
  mainMembers: [] as any[],
  members: [] as any[],
  projects: [] as any[],
})
const isReady = ref(false)
// const openSections = ref<string[]>([])
const openSections = ref<string[]>(['pms', 'members', 'projects'])

const allMembers = computed(() => {
  const map = new Map<number, any>()

  for (const m of team.value.mainMembers || []) map.set(m.id, m)
  for (const m of team.value.members || []) map.set(m.id, m)

  return Array.from(map.values())
})

function toggleAccordion(section: string) {
  if (openSections.value.includes(section)) {
    // Close the section if it's already open
    openSections.value = openSections.value.filter((s) => s !== section)
  } else {
    // Open the section
    openSections.value.push(section)
  }
}

function gotoProfile(userId: number) {
  router.push(`/user/profile/${userId}`)
}

function goBack() {
  router.push({ path: '/teams' })
}

function getCompletedTasks(projectId: number) {
  return taskStore.tasks.filter((t) => t.project?.id === projectId && t.t_status === 'completed')
    .length
}

function getTotalTasks(projectId: number) {
  return taskStore.tasks.filter((t) => t.project?.id === projectId).length
}

function getColorFromId(id: number) {
  const colors = ['#ffe4ef', '#f2d9ff', '#fbf8cc', '#bde0fe', '#f85c6a', '#daffcc', '#ffe5ec']
  return colors[id % colors.length]
}

onMounted(async () => {
  try {
    const response = await teamStore.fetchTeam(teamId)
    if (!response) throw new Error('Team not found')
    team.value = response
    console.log('Fetched team details:', team.value)

    taskStore.tasks = []
    await Promise.all(
      team.value.projects.map((project: any) => taskStore.fetchTasksByProject(project.id)),
    )

    isReady.value = true
  } catch (error) {
    console.error('Error fetching team details:', error)
  }
})
</script>
