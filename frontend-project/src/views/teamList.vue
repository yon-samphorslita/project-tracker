<template>            
  <TeamLayout>
    <div class="flex flex-col">

      <!-- Header (New team button , search, filter + Table header) -->
      <div class="flex flex-col gap-4 sticky top-[91px] pt-5 bg-white">
        <div class="flex justify-between items-center">
            <Button
            label="+ New Team"
            btn-color="#C6E7FF"
            btntext="black"
            @click="showTeamForm = true"
            />
            <teamform 
                v-model:modelValue="showTeamForm"
                @created="onTeamCreated"
            />

            <div class="flex gap-4 items-center">
              <Search @update="searchQuery = $event" />
              <Filter class="min-w-fit" title="Sort by" :options="sortOptions" @select="applySort" />
            </div>
        </div>

        <div class="flex justify-between border rounded-t-2xl border-b-2 pb-2 p-4 bg-white text-lg font-semibold">
            <div class="pl-2">Team Name</div>
            <div class="w-1/12 flex items-center justify-center mb-2 ">Action</div>
        </div>
      </div>

      <div class="flex flex-col gap-3 border rounded-b-2xl p-4 bg-white h-full">
        <teamCard :teams="filteredSortedTeams"/>
      </div>

    </div>
  </TeamLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TeamLayout from './pageLayout.vue'
import teamCard from '@/components/teamCard.vue'
import teamform from '@/components/teamform.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import Button from '@/components/button.vue'
import { useTeamStore } from '@/stores/team'
import { storeToRefs } from 'pinia'

// Stores
const teamStore = useTeamStore()
const { teams } = storeToRefs(teamStore)

// State
const showTeamForm = ref(false)
const searchQuery = ref('')
const selectedSort = ref('')
const sortOptions = [
  { value: 'alphabetical-asc', label: 'Alphabetical Order (A → Z)' },
  { value: 'alphabetical-desc', label: 'Alphabetical Order (Z → A)' },
]


// Computed filtered & sorted Teams
const filteredSortedTeams = computed(() => {
  let list = [...teams.value]
  console.log('Teams:', list)

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(team => team.name.toLowerCase().includes(q))
  }

  if (selectedSort.value === 'alphabetical-asc') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  } else if (selectedSort.value === 'alphabetical-desc') {
    list.sort((a, b) => b.name.localeCompare(a.name))
  }    

  return list
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
