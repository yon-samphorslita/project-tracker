<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="team in props.teams"
      :key="team.id"
      class="flex justify-between border rounded-lg p-4 shadow-sm bg-white hover:bg-[#C6E7FF]"
      @click="goToTeamDetail(team.id)"
    >
      <h2 class="text-lg font-semibold mb-2">{{ team.name }}</h2>

      <div class="flex items-center gap-8">
        <!-- Edit button -->
        <button
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          @click.stop="editTeam(team.id)"
        >
          Edit
        </button>

        <!-- Delete icon -->
        <button
          class="text-red-500 hover:text-red-700 transition"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted } from 'vue'
import { useTeamStore } from '@/stores/team'
import { storeToRefs } from 'pinia'
import router from '@/router'
import axios from 'axios'

const teamStore = useTeamStore()
// const { teams } = storeToRefs(teamStore)
const props = defineProps<{
  teams: { id: number; name: string }[]
}>()

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
onMounted(() => {
  teamStore.fetchTeams()
})
</script>
