<template>
  <TeamLayout>
    <div class="flex flex-col gap-4 mt-6">
      <h1 class="text-2xl font-bold">Editing Team Information</h1>

      <div v-if="team">
        <!-- Team name  -->
        <label for="name" class="block text-sm font-medium text-gray-700 mt-4">Team Name</label>
        <input
          v-model="team.name"
          :placeholder="team.name"
          class="text-lg font-semibold w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <!-- Project Manager Dropdown -->
        <label for="pm" class="block text-sm font-medium text-gray-700 mt-4">Project Manager</label>
        <Multiselect
          v-model="team.pmIds"
          :options="pmCandidates"
          :multiple="true"
          track-by="id"
          label="fullName"
          placeholder="Select Project Manager(s)"
          :close-on-select="false"
        />

        <!-- Team Members Dropdown -->
        <label for="members" class="block text-sm font-medium text-gray-700 mt-4"
          >Team Members</label
        >
        <Multiselect
          v-model="team.memberIds"
          :options="memberCandidates"
          :multiple="true"
          track-by="id"
          label="fullName"
          placeholder="Select team members"
          :close-on-select="false"
        />
      </div>

      <div class="flex gap-16 mt-10">
        <button class="px-4 py-2 bg-blue-500 text-white rounded" @click="saveChanges">Save</button>
        <button class="px-4 py-2 bg-gray-400 text-white rounded" @click="goBack">Cancel</button>
      </div>
    </div>
  </TeamLayout>
</template>

<script setup>
import TeamLayout from './pageLayout.vue'
import { onMounted, ref } from 'vue'
import { useTeamStore } from '@/stores/team'
import { useRoute, useRouter } from 'vue-router'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()
// const teams = teamStore.teams

const team = ref({
  id: 0,
  name: '',
  pmIds: [],
  memberIds: [],
})
const pmCandidates = ref([])
const memberCandidates = ref([])

const existingPms = ref([])
const existingMembers = ref([])

// Fetch candidates for PMs and members
async function fetchCandidates() {
  try {
    const res = await axios.get('http://localhost:3000/users')

    pmCandidates.value = res.data
      .filter((u) => u.role === 'project_manager')
      .map((u) => ({ ...u, fullName: `${u.first_name} ${u.last_name}` }))

    memberCandidates.value = res.data
      .filter((u) => u.role === 'member' && (!u.team || u.team.id === team.value.id))
      .map((u) => ({ ...u, fullName: `${u.first_name} ${u.last_name}` }))
  } catch (err) {
    console.error('Error fetching candidates:', err)
  }
}

async function saveChanges() {
  const currentPms = team.value.pmIds.map((pm) => pm.id)
  const currentMembers = team.value.memberIds.map((m) => m.id)

  // calculate diffs
  const addedPms = currentPms.filter((id) => !existingPms.value.includes(id))
  const removedPms = existingPms.value.filter((id) => !currentPms.includes(id))

  const addedMembers = currentMembers.filter((id) => !existingMembers.value.includes(id))
  const removedMembers = existingMembers.value.filter((id) => !currentMembers.includes(id))

  await teamStore.updateTeam(team.value.id, {
    name: team.value.name,
    addPms: addedPms,
    removePms: removedPms,
    addMembers: addedMembers,
    removeMembers: removedMembers,
  })
  router.push('/teams') // go back to team list
}

function goBack() {
  router.push('/teams')
}

onMounted(async () => {
  const data = await teamStore.fetchTeam(route.params.id)

  team.value.id = data.id
  team.value.name = data.name

  existingPms.value = data.pms?.map((p) => p.id) || []
  existingMembers.value = data.members?.map((m) => m.id) || []

  await fetchCandidates()

  team.value.pmIds = pmCandidates.value.filter((pm) => existingPms.value.includes(pm.id))
  // .map(pm => ({ ...pm }))

  team.value.memberIds = memberCandidates.value.filter((m) => existingMembers.value.includes(m.id))
  // .map(m => ({ ...m }))

  console.log('Fetched team:', team.value)
})
</script>

<style scoped></style>
