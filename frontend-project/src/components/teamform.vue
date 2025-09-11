<template>
  <div
    v-if="showTeamForm"
    class="fixed top-0 left-[250px] w-[calc(100vw-250px)] h-full bg-[rgba(153,153,153,0.2)] backdrop-blur-sm flex items-center justify-center z-[1000]"
  >
    <div class="bg-white p-10 rounded-lg w-[400px] max-w-[90%] shadow-xl">
      <div class="text-2xl mb-5 text-[#2c3e50] font-semibold">Create New Team</div>

      <div class="mb-5 w-full">
        <!-- Team Name -->
        <label for="name" class="block text-sm font-medium text-gray-700">Team Name</label>
        <input
          id="name"
          type="text"
          class="w-[90%] px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder="Enter Team Name"
          v-model="team.name"
          required
        />

        <!-- Project Manager Dropdown -->
        <label for="pm" class="block text-sm font-medium text-gray-700 mt-4">Project Manager</label>
        <select
          id="pm"
          class="w-[90%] px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          v-model="team.pmId"
          required
        >
          <option disabled value="">Select a Project Manager</option>
          <option v-for="user in pmCandidates" :key="user.id" :value="user.id">
            {{ user.first_name }} {{ user.last_name }}
          </option>
        </select>

        <!-- Team Members Dropdown -->
        <label for="members" class="block text-sm font-medium text-gray-700 mt-4"
          >Team Members</label
        >
        <!-- <select id="members"
                class="w-[90%] px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                v-model="team.memberId" 
                multiple
                required>
          <option disabled value="">Select Team Members</option>
          <option v-for="user in memberCandidates" :key="user.id" :value="user.id">
            {{ user.first_name }} {{ user.last_name }}
          </option>
        </select> -->
        <Multiselect
          v-model="team.memberId"
          :options="memberCandidates"
          :multiple="true"
          track-by="id"
          label="fullName"
          placeholder="Select team members"
          :close-on-select="false"
          :taggable="true"
        />
      </div>

      <!-- Buttons -->
      <div class="flex justify-around w-full mt-5">
        <button
          class="px-5 py-3 rounded text-white text-base cursor-pointer transition-colors bg-red-500 hover:bg-red-600"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          class="px-5 py-3 rounded text-white text-base cursor-pointer transition-colors bg-blue-500 hover:bg-blue-600"
          @click="submitForm"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import axios from 'axios'

const team = reactive({
  name: '',
  pmId: null as User,
  memberId: [] as User[],
})
interface User {
  id: number
  first_name: string
  last_name: string
  fullName?: string
}
const showTeamForm = ref(true)
const pmCandidates = ref<User[]>([])
const memberCandidates = ref<User[]>([])

// Fetch available candidates
async function fetchCandidates() {
  try {
    const res = await axios.get('http://localhost:3000/users')

    pmCandidates.value = res.data.filter((u) => u.role === 'project_manager')
    memberCandidates.value = res.data
      .filter((u) => u.role === 'member')
      .map((u) => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name}`,
      }))
  } catch (err) {
    console.error('Error fetching candidates:', err)
  }
}

// Submit form
async function submitForm() {
  try {
    const payload = {
      name: team.name,
      pmId: team.pmId?.id,
      members: team.memberId.map((m) => m.id),
    }

    const response = await axios.post('http://localhost:3000/teams', payload)
    console.log('Team created:', response.data)

    // reset form + close popup
    team.name = ''
    team.pmId = null
    team.memberId = []
    showTeamForm.value = false
  } catch (error) {
    console.error('Error creating team:', error)
  }
}

// Cancel form
function cancel() {
  team.name = ''
  team.pmId = null
  team.memberId = []
  showTeamForm.value = false
  console.log('Form cancelled')
}

onMounted(fetchCandidates)
</script>
