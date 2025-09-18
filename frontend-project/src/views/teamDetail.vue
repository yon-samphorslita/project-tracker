<template>
    <TeamLayout>
        <div class="flex flex-col gap-6">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">Team Details</h1>
            <button
            @click="goBack"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
            Back to Teams
            </button>
        </div>
    
        <div class="border rounded-lg p-6 bg-white shadow-sm">
            <h2 class="text-xl font-semibold mb-4">{{ team.name }}</h2>
    
            <div class="mb-4">
                <h3 class="font-semibold">Project Managers:</h3>

                <div class="flex flex-col gap-2">
                    <div
                        v-for="pm in team.pms"
                        :key="pm.id"
                        class="flex items-center gap-3 border rounded-lg px-3 py-2 shadow-sm bg-gray-50 hover:bg-gray-100"
                        @click="gotoProfile(pm.id)"
                    >
                        <img
                            :src="pm.img_url"
                            alt="profile"
                            class="w-10 h-10 rounded-full object-cover mr-4"
                        />
                        <span class="font-medium">{{ pm.first_name }} {{ pm.last_name }}</span>
                        <span class="font-medium">{{ pm.email }}</span> 
                    </div>
                </div>
            </div>
                    <!-- <div
          class="flex items-center bg-[#C6E7FF] rounded-full px-3 py-1.5 w-[130px] max-w-[150px] truncate cursor-pointer"
          @click="gotoProfile"
        >
          <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
            <img :src="user?.img_url" alt="Profile Image" />
          </div>
          <div class="flex flex-col truncate">
            <span class="text-sm font-medium truncate">
              {{ user ? `${user.first_name} ${user.last_name}` : '' }}
            </span>
            <span class="text-xs text-gray-500 truncate">{{ user?.role }}</span>
          </div>
        </div> -->
    <!-- <div
              v-for="pm in team.pms"
              :key="pm.id"
              class="flex items-center gap-3 border rounded-lg px-3 py-2 shadow-sm bg-gray-50 hover:bg-gray-100"
            >
              <img
                :src="pm.profileImg || defaultAvatar"
                alt="profile"
                class="w-10 h-10 rounded-full object-cover"
              />
              <span class="font-medium">{{ pm.first_name }} {{ pm.last_name }}</span>
            </div> -->
            <div>
                <h3 class="font-semibold">Members:</h3>

                <div class="flex flex-col gap-2">
                  <div
                      v-for="member in team.members"
                      :key="member.id"
                      class="flex items-center gap-3 border rounded-lg px-3 py-2 shadow-sm bg-gray-50 hover:bg-gray-100"
                      @click="gotoProfile(member.id)"
                  >
                      <img
                          :src="member.img_url"
                          alt="profile"
                          class="w-10 h-10 rounded-full object-cover mr-4"
                      />
                      <span class="font-medium">{{ member.first_name }} {{ member.last_name }}</span>
                      <span class="font-medium">{{ member.email }}</span> 
                  </div>
                </div>
            </div>
        </div>
        </div>
    </TeamLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TeamLayout from './teamLayout.vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const teamId = route.params.id as string
const team = ref({ 
    name: '', 
    pms: [] as any[], 
    members: [] as any[]
})

function gotoProfile(userId: number) {
  router.push(`/user/profile/${userId}`)}

function goBack() {
  router.push({ path: '/teams' })
}

onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/teams/${teamId}`)
    team.value = response.data
    console.log('Fetched team details:', team.value)
  } catch (error) {
    console.error('Error fetching team details:', error)
  }
})
</script>