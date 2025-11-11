<template>
  <TeamLayout>
    <div class="flex flex-col">
      <!-- Header (New team button , search, filter + Table header) -->
      <div class="flex flex-col gap-4 sticky top-[91px] bg-main-bg">
        <div class="flex justify-between items-center">
          <div>
            <Button
              v-if="userRole === 'admin' || userRole === 'project_manager'"
              label="+ New Team"
              @click="showTeamForm = true"
            />
            <div v-else class="w-[120px]"></div>
          </div>

          <div class="flex gap-4 items-center justify-end">
            <Search v-model:query="searchQuery" />
            <Filter class="min-w-fit" title="Sort by" :options="sortOptions" @select="applySort" />
          </div>
        </div>
      </div>

      <!-- Team Cards Grid -->
      <div
        v-if="userRole === 'admin' || userRole === 'project_manager'"
        class="grid grid-cols-3 gap-3 p-6 mt-4 bg-main-bg w-full h-full"
      >
        <teamCard v-for="team in filteredSortedTeams" :key="team.id" :team="team" />
      </div>

      <div v-if="userRole === 'member'" class="flex flex-col">
        <span class="text-xl font-semibold">Main Team: </span>
        <div class="grid grid-cols-3 gap-3 p-6 mt-4 bg-main-bg w-full h-full">
          <teamCard
            v-for="team in filteredSortedTeams.filter((team) =>
              team.mainMembers?.some((m) => m.id === authStore.user.id),
            )"
            :key="team.id"
            :team="team"
          />
        </div>
        <br />

        <span class="text-xl font-semibold">Participating Team: </span>
        <div class="grid grid-cols-3 gap-3 p-6 mt-4 bg-main-bg w-full h-full">
          <teamCard
            v-for="team in filteredSortedTeams.filter((team) =>
              team.members?.some((m) => m.id === authStore.user.id),
            )"
            :key="team.id"
            :team="team"
          />
        </div>
      </div>

      <!-- Team Creation Form -->
      <teamform v-model:modelValue="showTeamForm" @created="onTeamCreated" />
    </div>
  </TeamLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TeamLayout from '@/views/pageLayout.vue'
import teamCard from '@/components/detail-cards/teamCard.vue'
import teamform from '@/components/forms/teamform.vue'
import Search from '@/components/common-used/search.vue'
import Filter from '@/components/common-used/filter.vue'
import Button from '@/components/common-used/button.vue'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'
import { storeToRefs } from 'pinia'

// Stores
const teamStore = useTeamStore()
const authStore = useAuthStore()
const { teams } = storeToRefs(teamStore)

// State
const showTeamForm = ref(false)
const searchQuery = ref('')
const selectedSort = ref('')
const sortOptions = [
  { value: 'alphabetical-asc', label: 'Alphabetical Order (A → Z)' },
  { value: 'alphabetical-desc', label: 'Alphabetical Order (Z → A)' },
]

const userRole = computed(() => authStore.user?.role || 'user')

// Computed filtered & sorted Teams
const filteredSortedTeams = computed(() => {
  let list = [...teams.value]

  // Restrict members to their own teams only
  if (userRole.value === 'member' && authStore.user) {
    const userId = authStore.user.id
    list = list.filter((team) => {
      const isMain = team.mainMembers?.some((m) => m.id === userId)
      const isSecondary = team.members?.some((m) => m.id === userId)
      return isMain || isSecondary
    })
  }

  // Apply search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((team) => team.name.toLowerCase().includes(q))
  }

  // Apply sorting
  if (selectedSort.value === 'alphabetical-asc') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  } else if (selectedSort.value === 'alphabetical-desc') {
    list.sort((a, b) => b.name.localeCompare(a.name))
  }

  // return list
  return list.map((team) => ({
    ...team,
    pms:
      team.pms?.map((pm) => ({
        id: pm.id,
        fullName: `${pm.first_name} ${pm.last_name}`,
        img_url: pm.img_url,
      })) || [],
  }))
})

// Fetch data
onMounted(async () => {
  await teamStore.fetchTeams()
})

// Sorting
const applySort = (option) => {
  selectedSort.value = option
}

const onTeamCreated = async (newTeam) => {
  teamStore.addTeam(newTeam) // add newly created team on top
  // await teamStore.fetchTeams() // refetch to sync with backend
}
</script>
