<template>
  <div
    v-if="modelValue"
    class="fixed top-0 left-[250px] w-[calc(100vw-250px)] h-full bg-[rgba(153,153,153,0.2)] backdrop-blur-sm flex items-center justify-center "
  >
    <div class="bg-white p-10 rounded-lg w-[600px] h-[450px] max-w-[90%] shadow-xl">
      <div class="text-2xl mb-5 text-[#2c3e50] font-semibold">Create New Team</div>

      <div class="flex flex-col justify-between items-center h-[90%]">
        <!-- Team Name -->
        <div class="w-full">
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

        <!-- Team Description -->
        <div class="w-full">
          <label for="description" class="block text-sm font-medium text-gray-700">Team Description</label>
          <textarea
            id="description"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Enter Team Description"
            v-model="team.description"
          ></textarea>
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
import {  reactive, ref } from 'vue'
import axios from 'axios'

const isSubmitting = ref(false)
const props = defineProps<{ modelValue: boolean }>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', newTeam: any): void
}>()

const team = reactive({
  name: '',
  description: '',
})

// Submit form
async function submitForm() {
  // if (!team.name.trim()) {
  //   alert('Please enter a team name.')
  //   return
  // }

  // isSubmitting.value = true
  try {
    const payload = { 
      name: team.name ,
      description: team.description,
    }
    
    const response = await axios.post('http://localhost:3000/teams', payload)
    emits('created', response.data) // emit created event to parent
    emits('update:modelValue', false)
    // console.log('Team created:', response.data)
   
    team.name = ''   
    team.description = ''

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
