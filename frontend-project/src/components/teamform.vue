<template>
  <div
    v-if="modelValue"
    class="fixed top-0 left-[250px] w-[calc(100vw-250px)] h-full bg-[rgba(153,153,153,0.2)] backdrop-blur-sm flex items-center justify-center"
  >
    <div class="bg-main-bg p-10 rounded-lg w-[600px] h-[450px] max-w-[90%] shadow-xl">
      <div class="text-2xl mb-5 text-gray-text font-semibold">Create New Team</div>

      <div class="flex flex-col justify-between items-center h-[90%]">
        <!-- Team Name -->
        <div class="w-full">
          <label for="name" class="block text-sm font-medium text-gray-text">Team Name</label>
          <input
            id="name"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-main-bg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Enter Team Name"
            v-model="team.name"
            required
          />
        </div>

        <!-- Team Description -->
        <div class="w-full">
          <label for="description" class="block text-sm font-medium text-gray-text"
            >Team Description</label
          >
          <textarea
            id="description"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 bg-main-bg rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Enter Team Description"
            v-model="team.description"
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="flex justify-around w-full mt-5">
          <button class="px-5 py-3 rounded text-base cursor-pointer btn-red" @click="cancel">
            Cancel
          </button>
          <button class="px-5 py-3 rounded text-base cursor-pointer btn" @click="submitForm">
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import axios from 'axios'
import { useTeamStore } from '@/stores/team';
const isSubmitting = ref(false)
const props = defineProps<{ modelValue: boolean }>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', newTeam: any): void
}>()
const teamStore = useTeamStore();
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
    isSubmitting.value = true
    const payload = await teamStore.createTeam({
      name: team.name,
      description: team.description,
    })

    emits('created', payload) // emit created event to parent
    emits('update:modelValue', false)
    // console.log('Team created:', response.data)

    team.name = ''
    team.description = ''
  } catch (error) {
    console.error('Error creating team:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Cancel form
function cancel() {
  team.name = ''
  emits('update:modelValue', false)
  console.log('Form cancelled')
}
</script>
