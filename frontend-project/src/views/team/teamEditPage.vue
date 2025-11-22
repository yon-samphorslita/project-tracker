<template>
  <TeamLayout>
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">{{ isEditMode ? "Editing Team Information" : "Create New Team"  }}</h1>

      <div v-if="team">
        <!-- Team name  -->
        <label for="name" class="block text-sm font-medium text-gray-text mt-4">
          Team Name
          <span class="ml-1 text-red-500">*</span>
        </label>
        
        <input
          v-model="team.name"
            :placeholder="isEditMode ? team.name : 'Enter team name'"
            class="text-lg font-semibold w-full px-2 py-1 border bg-main-bg rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p v-if="errors.name" class="text-red-500 text-sm">{{ errors.name }}</p>

        <!-- Team Description -->
        <label for="description" class="block text-sm font-medium text-gray-text mt-4"
          >Team Description</label
        >
        <input
          v-model="team.description"
          :placeholder="team.description"
          class="text-lg w-full px-2 py-1 bg-main-bg border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p v-if="errors.description" class="text-red-500 text-sm">{{ errors.description }}</p>

        <!-- Project Manager Dropdown -->
        <label for="pm" class="block text-sm font-medium text-gray-text mt-4">
          Project Manager
          <span class="ml-1 text-red-500">*</span>
          </label
        >
        <Multiselect
          v-model="team.pmIds"
          :options="pmCandidates"
          :multiple="true"
          track-by="id"
          label="fullName"
          placeholder="Select Project Manager(s)"
          :close-on-select="false"
        />
        <p v-if="errors.pms" class="text-red-500 text-sm">{{ errors.pms }}</p>


        <!-- Main Members Dropdown -->
        <label for="members" class="block text-sm font-medium text-gray-text mt-4">
          Main Members
          <span class="ml-1 text-red-500">*</span>
        </label>
        <Multiselect
          v-model="team.memberIds"
          :options="memberCandidates"
          :multiple="true"
          track-by="id"
          :custom-label="
            (user) => `${user.fullName}${user.team ? ' (' + user.team.name + ')' : ''}`
          "
          placeholder="Select team members"
          :close-on-select="false"
          :option-disabled="(option) => option.hasMainTeam && !option.isOnThisTeam"
          @select="onSelectMainMember"
        />
        <p v-if="errors.main" class="text-red-500 text-sm">{{ errors.main }}</p>

        <!-- Secondary Members -->
        <label for="secondary" class="block text-sm font-medium text-gray-text mt-4"
          >Secondary Members</label
        >
        <Multiselect
          v-model="team.secondaryMemberIds"
          :options="memberCandidates.filter((m) => !team.memberIds.some((mm) => mm.id === m.id))"
          :multiple="true"
          track-by="id"
          :custom-label="
            (user) => `${user.fullName}${user.team ? ' (' + user.team.name + ')' : ''}`
          "
          placeholder="Select secondary members"
          :close-on-select="false"
        />
      </div>

      <div class="flex gap-16 mt-10">
        <button class="px-4 py-2 btn-red rounded" @click="goBack">Cancel</button>
        <button class="px-4 py-2 btn rounded" @click="saveChanges">Save</button>
      </div>
    </div>
  </TeamLayout>
</template>

<script setup>
import TeamLayout from '@/views/pageLayout.vue'
import { onMounted, ref, watch } from 'vue'
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
  memberIds: [], // main members
  secondaryMemberIds: [], // secondary members
})
const pmCandidates = ref([])
const memberCandidates = ref([])

const isEditMode = ref(false)
const existingPms = ref([])
const existingMembers = ref([])
const existingSecondaryMembers = ref([])

const teams = ref([])
const errors = ref({
  name: '',
  pms: '',
  main: '',
})


// Fetch candidates for PMs and members
async function fetchCandidates() {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://localhost:3000/users/members', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    pmCandidates.value = res.data
      .filter((u) => u.role === 'project_manager')
      .map((u) => ({ ...u, fullName: `${u.first_name} ${u.last_name}` }))
    memberCandidates.value = res.data
      .filter((u) => u.role === 'member')
      .map((u) => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name}`,
        hasMainTeam: !!u.team,
        isOnThisTeam: u.team && u.team.id === team.value.id,
      }))

    console.log('Main members:', team.value.memberIds)
    console.log(
      'Show membercandidate: ',
      memberCandidates.value.map((u) => u.id),
    )
  } catch (err) {
    console.error('Error fetching candidates:', err)
  }
}

function onSelectMainMember(selected) {
  // `selected` is the user object the user just clicked
  if (selected.hasMainTeam && !selected.isOnThisTeam) {
    alert(
      `${selected.fullName} is already assigned as a main member in another team. Please choose a different member.`,
    )
    // Remove it from selection immediately
    team.value.memberIds = team.value.memberIds.filter((m) => m.id !== selected.id)
  }
}

// const validateForm = () => {
//   let valid = true

//   // Team name
//   if (!team.value.name.trim()) {
//     errors.value.name = 'Team name is required'
//     valid = false
//   } else {
//     errors.value.name = ''
//   }

//   // PMs
//   if (!team.value.pmIds.length) {
//     errors.value.pms = 'At least one project manager is required'
//     valid = false
//   } else {
//     errors.value.pms = ''
//   }

//   // Main Members
//   if (!team.value.memberIds.length) {
//     errors.value.main = 'At least one main member is required'
//     valid = false
//   } else {
//     errors.value.main = ''
//   }

//   return valid
// }
const validateForm = () => {
  let valid = true;

  // Reset
  errors.value.name = "";
  errors.value.pms = "";
  errors.value.main = "";

  // Team name required
  if (!team.value.name.trim()) {
    errors.value.name = "Team name is required";
    valid = false;
  }

  // UNIQUE NAME CHECK (frontend)
  const allTeams = teamStore.teams;

  const sameNameTeam = allTeams.find(
    (t) => t.name.toLowerCase() === team.value.name.trim().toLowerCase()
  );

  if (!isEditMode.value) {
    // CREATE MODE: any match means duplicate
    if (sameNameTeam) {
      errors.value.name = "Team name must be unique";
      valid = false;
    }
  } else {
    // EDIT MODE: match must not be the same team
    if (sameNameTeam && sameNameTeam.id !== team.value.id) {
      errors.value.name = "Team name must be unique";
      valid = false;
    }
  }

  // PMs
  if (!team.value.pmIds.length) {
    errors.value.pms = "At least one project manager is required";
    valid = false;
  }

  // Main Members
  if (!team.value.memberIds.length) {
    errors.value.main = "At least one main member is required";
    valid = false;
  }

  return valid;
};

async function saveChanges() {
  try {
    const currentPms = team.value.pmIds.map((pm) => pm.id)
    const currentMembers = team.value.memberIds.map((m) => m.id)
    const currentSecondary = team.value.secondaryMemberIds.map((m) => m.id)

      if (!isEditMode.value) {
      // CREATE MODE
      if (!validateForm()) return;
      const payload = {
        name: team.value.name,
        description: team.value.description,
        pms: currentPms,
        members: currentMembers,
        secondaryMembers: currentSecondary,
      }

      // if (!validateForm()) return;

      await teamStore.createTeam(payload)
      router.push('/teams')
      return
    }

    // EDIT MODE
    if (!validateForm()) return;
    const payload = {
      name: team.value.name,
      description: team.value.description,
      addPms: currentPms.filter((id) => !existingPms.value.includes(id)),
      removePms: existingPms.value.filter((id) => !currentPms.includes(id)),
      addMembers: currentMembers.filter((id) => !existingMembers.value.includes(id)),
      removeMembers: existingMembers.value.filter((id) => !currentMembers.includes(id)),
      addSecondaryMembers: currentSecondary.filter(
        (id) => !existingSecondaryMembers.value.includes(id),
      ),
      removeSecondaryMembers: existingSecondaryMembers.value.filter(
        (id) => !currentSecondary.includes(id),
      ),
    }

    console.log('Update payload:', payload)

    console.log('team id to update:', team.value.id)
    await teamStore.updateTeam(team.value.id, payload)
    router.push('/teams')
    }catch (err) {
    console.error("Update failed:", err.response?.data || err.message);
  }

  // } catch (err) {
  //   console.log('Error response:', err.response)
  //   if (err.response?.status === 400){
  //     const msg = err.response.data.message
  //     if (msg.includes('unique')) {
  //       console.log('Setting team name error message')
  //       errors.value.name = msg  // show the error under Team Name field
  //       return
  //     }
  //   }
  //   console.error('Update failed:', err.response?.data || err.message)
  //   retur
  // }
}

function goBack() {
  router.push('/teams')
}

onMounted(async () => {
  await teamStore.fetchTeams()

  if (route.params.id) {
    // EDIT MODE
    isEditMode.value = true
    const data = await teamStore.fetchTeam(route.params.id)

    team.value.id = data.id
    console.log('Editing team data:', data)
    console.log('Team id: ', data.id)
    team.value.name = data.name
    team.value.description = data.description

    existingPms.value = data.pms?.map((p) => p.id) || []
    existingMembers.value = data.mainMembers?.map((m) => m.id) || []
    existingSecondaryMembers.value =
      data.members?.filter((m) => !data.mainMembers.some((mm) => mm.id === m.id)).map((m) => m.id) ||
      []
  } else {
    // CREATE MODE
    isEditMode.value = false

    existingPms.value = []
    existingMembers.value = []
    existingSecondaryMembers.value = []
  }

  await fetchCandidates()

  if (isEditMode.value) {
    team.value.pmIds = pmCandidates.value.filter((pm) => existingPms.value.includes(pm.id))
    team.value.memberIds = memberCandidates.value.filter((m) =>
      existingMembers.value.includes(m.id),
    )
    team.value.secondaryMemberIds = memberCandidates.value.filter((m) =>
      existingSecondaryMembers.value.includes(m.id),
    )
  }

  console.log('Fetched team:', team.value)
})

watch(
  () => team.value.memberIds,
  (newMain) => {
    const mainIds = newMain.map((m) => (typeof m === 'object' ? m.id : m))
    team.value.secondaryMemberIds = team.value.secondaryMemberIds.filter(
      (s) => !mainIds.includes(typeof s === 'object' ? s.id : s),
    )
  },
  { deep: true },
)
</script>

<style scoped></style>
