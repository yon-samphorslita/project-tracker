<template>
  <TeamLayout>

    <div class="flex flex-col gap-4 mt-6 ">
      <h1 class="text-2xl font-bold">Editing Team Information</h1>

      <div v-if="team">
        <!-- Team name  -->
        <label for="name" class="block text-sm font-medium text-gray-700 mt-4">Team Name</label>
        <input
          v-model="team.name"
          :placeholder="team.name"
          class="text-lg font-semibold w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <!-- Team Description -->
        <label for="description" class="block text-sm font-medium text-gray-700 mt-4">Team Description</label>
        <input
          v-model="team.description"
          :placeholder="team.description"
          class="text-lg w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
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

        <!-- Main Members Dropdown -->
        <label for="members" class="block text-sm font-medium text-gray-700 mt-4"
          >Main Members</label
        >
        <Multiselect
          v-model="team.memberIds"
          :options="memberCandidates"
          :multiple="true"
          track-by="id"
          :custom-label="user => `${user.fullName}${user.team ? ' (' + user.team.name + ')' : ''}`"
          placeholder="Select team members"
          :close-on-select="false"
          :option-disabled="option => option.hasMainTeam && !option.isOnThisTeam"
        />

        <!-- Secondary Members -->
        <label for="secondary" class="block text-sm font-medium text-gray-700 mt-4">Secondary Members</label>
        <Multiselect
          v-model="team.secondaryMemberIds"
          :options="memberCandidates"
          :multiple="true"
          track-by="id"
          :custom-label="user => `${user.fullName}${user.team ? ' (' + user.team.name + ')' : ''}`"
          placeholder="Select secondary members"
          :close-on-select="false"
        />

      </div>

      <div class="flex gap-16 mt-10 ">
        <button 
          class="px-4 py-2 bg-blue-500 text-white rounded"
          @click="saveChanges"
        >
          Save
        </button>
        <button 
          class="px-4 py-2 bg-gray-400 text-white rounded"
          @click="goBack"
        >
          Cancel
        </button>
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
  description: '',
  pmIds: [],
  memberIds: [],  // main members
  secondaryMemberIds: [], // secondary members
})
const pmCandidates = ref([])
const memberCandidates = ref([])

const existingPms = ref([])
const existingMembers = ref([])
const existingSecondaryMembers = ref([])

// Fetch candidates for PMs and members
async function fetchCandidates() {
  try {
    const res = await axios.get('http://localhost:3000/users')

    pmCandidates.value = res.data
      .filter(u => u.role === 'project_manager')
      .map(u => ({ ...u, fullName: `${u.first_name} ${u.last_name}` }))

    // memberCandidates.value = res.data
    //   .filter(
    //     u => u.role === 'member' && 
    //     (!u.team || u.team.id === team.value.id)
    //   )
    //   .map(u => ({ ...u, fullName: `${u.first_name} ${u.last_name}` }))
      memberCandidates.value = res.data
      .filter(u => u.role === 'member')
      .map(u => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name}`,
        hasMainTeam: !!u.team,
        isOnThisTeam: u.team && u.team.id === team.value.id,
      }))

  } catch (err) {
    console.error('Error fetching candidates:', err)
  }
}

async function saveChanges() {
  team.value.memberIds = team.value.memberIds.filter(
    m => !m.hasMainTeam || m.isOnThisTeam
  )

  const currentPms = team.value.pmIds.map(pm => pm.id)
  const currentMembers = team.value.memberIds.map(m => m.id)
  const currentSecondary = team.value.secondaryMemberIds.map(m => m.id)

  const payload = {
    name: team.value.name,
    description: team.value.description,
    addPms: currentPms.filter(id => !existingPms.value.includes(id)),
    removePms: existingPms.value.filter(id => !currentPms.includes(id)),
    addMembers: currentMembers.filter(id => !existingMembers.value.includes(id)),
    removeMembers: existingMembers.value.filter(id => !currentMembers.includes(id)),
    addSecondaryMembers: currentSecondary.filter(id => !existingSecondaryMembers.value.includes(id)),
    removeSecondaryMembers: existingSecondaryMembers.value.filter(id => !currentSecondary.includes(id)),
  }

  await teamStore.updateTeam(team.value.id, payload)
  router.push('/teams') // go back to team list
}

function goBack() {
  router.push('/teams')
}

onMounted(async () => {
  const data = await teamStore.fetchTeam(route.params.id)

  team.value.id = data.id
  team.value.name = data.name
  team.value.description = data.description

  existingPms.value = data.pms?.map(p => p.id) || []
  existingMembers.value = data.mainMembers?.map(m => m.id) || []
  existingSecondaryMembers.value = data.members?.map(m => m.id) || []

  await fetchCandidates()

  team.value.pmIds = pmCandidates.value
    .filter(pm => existingPms.value.includes(pm.id))
    // .map(pm => ({ ...pm }))

  team.value.memberIds = memberCandidates.value
    .filter(m => existingMembers.value.includes(m.id))
    // .map(m => ({ ...m }))

  team.value.secondaryMemberIds = memberCandidates.value.filter(m => existingSecondaryMembers.value.includes(m.id))

  console.log('Fetched team:', team.value)
})
</script>

<style scoped></style>
