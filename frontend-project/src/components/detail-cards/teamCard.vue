<template>
  <!-- <div class="flex flex-col gap-4 "> -->
  <div
    class="flex flex-col justify-between border h-60 rounded-lg shadow-sm bg-main-bg transition transform hover:scale-[1.02] hover:shadow-md"
    :style="{ borderColor: getColorFromId(team.id) }"
    @click="goToTeamDetail(team.id)"
  >
    <h2
      class="text-lg font-semibold p-4 mb-2 rounded-t-lg"
      :style="{ background: getColorFromId(team.id) }"
    >
      {{ team.name }}
    </h2>

    <div class="px-4">
      <div class=" ">Description:</div>
      <p class="text-gray-600 mb-4 pl-4 line-clamp-3">
        {{ team.description || 'No description provided.' }}
      </p>
    </div>

    <div class="flex justify-end flex-grow items-end gap-8 p-4">
      <!-- Edit button -->
      <button
        class="text-blue-500 hover:text-blue-700 transition"
        v-if="user.role === 'admin' || user.role === 'project_manager'"
        @click.stop="editTeam(team.id)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M6.414 15.89L16.556 5.748l-1.414-1.414L5 14.476v1.414zm.829 2H3v-4.243L14.435 2.212a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414zM3 19.89h18v2H3z"
          />
        </svg>
      </button>

      <!-- Delete icon -->
      <button
        class="text-red-500 hover:text-red-700 transition"
        v-if="user.role === 'admin' || user.role === 'project_manager'"
        @click.stop="deleteTeam(team.id)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 
                7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
          />
        </svg>
      </button>
    </div>

    <div v-if="user.role === 'member'" class="flex items-center gap-4 px-4 mb-2 bg-pink-">
      <span class="font-medium text-gray-700">Project Manager:</span>

      <!-- If PMs are 2 or less, show name + profile -->
      <div v-if="team.pms.length <= 2" class="flex flex-wrap gap-2">
        <div
          v-for="pm in team.pms"
          :key="pm.id"
          class="flex items-center gap-3 bg-blue-50 px-3 py-1 rounded-full border border-blue-100"
        >
          <img
            :src="pm.img_url || defaultProfile"
            alt="profile"
            class="w-8 h-8 rounded-full object-cover"
          />
          <span class="text-blue-800 font-medium text-sm truncate max-w-[100px]">
            {{ pm.fullName }}
          </span>
        </div>
      </div>

      <!-- If PMs are more than 2, show only profile pics horizontally scrollable -->
      <div v-else class="flex gap-2 overflow-x-auto py-1">
        <img
          v-for="pm in team.pms"
          :key="pm.id"
          :src="pm.img_url || defaultProfile"
          :alt="pm.fullName"
          class="w-8 h-8 rounded-full object-cover border border-blue-100 cursor-pointer"
          :title="pm.fullName"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted } from 'vue'
import { useTeamStore } from '@/stores/team'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import router from '@/router'
import axios from 'axios'
import defaultProfile from '@/assets/profile_default.jpg'

const authStore = useAuthStore()
const teamStore = useTeamStore()
// const { teams } = storeToRefs(teamStore)
const props = defineProps<{
  team: {
    id: number
    name: string
    description: string
    pms?: { id: number; fullName: string; img_url?: string }[]
  }
}>()
const user = computed(() => authStore.user)

function goToTeamDetail(id: number) {
  router.push({ path: `/teams/${id}` })
  // console.log('Navigating to team detail:', id)
}

function editTeam(id: number) {
  router.push({ path: `/teams/${id}/edit` })
  // console.log('Editing team:', id)
}

async function deleteTeam(id: number) {
  try {
    const confirmDelete = window.confirm('Are you sure you want to delete this team?')
    if (!confirmDelete) return

    await axios.delete(`http://localhost:3000/teams/${id}`)
    alert('Team deleted successfully!')
    await teamStore.fetchTeams()
  } catch (err) {
    console.error('Error deleting team:', err)
    alert('Failed to delete the team.')
  }
}

function getColorFromId(id: number) {
  const colors = [
    '#ffe4ef',
    '#f2d9ff',
    '#fbf8cc',
    '#bde0fe',
    '#f85c6a',
    '#daffcc',
    '#ffe5ec',
    '#daffcc',
  ]
  return colors[id % colors.length]
}

onMounted(() => {
  teamStore.fetchTeams()
})
</script>
