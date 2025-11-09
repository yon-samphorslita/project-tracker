<template>
  <TeamLayout>
    <div class="mx-auto bg-main-bg shadow-md rounded-2xl p-8">
      <div class="flex items-center gap-4">
        <div class="relative w-24 h-24">
          <img
            :src="user.img_url || 'https://via.placeholder.com/150'"
            alt="Profile"
            class="w-24 h-24 rounded-full object-cover border"
          />
        </div>

        <div>
          <h2 class="text-xl font-semibold">{{ user.first_name }} {{ user.last_name }}</h2>
          <p class="text-sub-text">{{ user.email }}</p>
        </div>
      </div>

      <div class="grid gap-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-600 text-sm">First Name</label>
            <p class="px-4 py-2">{{ user.first_name }}</p>
          </div>
          <div>
            <label class="block text-gray-600 text-sm">Last Name</label>
            <p class="px-4 py-2">{{ user.last_name }}</p>
          </div>
        </div>

        <div>
          <label class="block text-gray-600 text-sm">Email</label>
          <p class="px-4 py-2">{{ user.email }}</p>
        </div>
      </div>
    </div>
  </TeamLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TeamLayout from '@/views/pageLayout.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const userId = Number(route.params.id)

const user = ref({
  first_name: '',
  last_name: '',
  email: '',
  img_url: '',
})

onMounted(async () => {
  const profile = await userStore.fetchUserById(userId)
  if (profile) {
    user.value = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      img_url: profile.img_url || '',
    }
  }
})
</script>
