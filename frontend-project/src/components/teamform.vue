<template>
  <div
    v-if="modelValue"
    class="fixed top-0 left-[250px] w-[calc(100vw-250px)] h-full bg-[rgba(153,153,153,0.2)] backdrop-blur-sm flex items-center justify-center z-[1000]"
  >
    <div class="bg-white p-10 rounded-lg w-[600px] h-[450px] max-w-[90%] shadow-xl">
      <div class="text-2xl mb-5 text-[#2c3e50] font-semibold">Create New Team</div>

      <div class="flex flex-col justify-between items-center h-[90%]">
        <div class="w-full">
          <!-- Team Name -->
          <label for="name" class="block text-sm font-medium text-gray-700">Team Name</label>
          <input
            id="name"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Enter Team Name"
            v-model="team.name"
            required
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
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import axios from 'axios'

const props = defineProps<{ modelValue: boolean }>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', newTeam: any): void
}>()

const team = reactive({
  name: '',
})

// Submit form
async function submitForm() {
  try {
    const payload = { name: team.name }

    const response = await axios.post('http://localhost:3000/teams', payload)
    emits('created', response.data) // emit created event to parent
    emits('update:modelValue', false)
    // console.log('Team created:', response.data)

    team.name = ''
  } catch (error) {
    console.error('Error creating team:', error)
  }
}

// Cancel form
function cancel() {
  team.name = ''
  emits('update:modelValue', false)
  console.log('Form cancelled')
}
</script>
