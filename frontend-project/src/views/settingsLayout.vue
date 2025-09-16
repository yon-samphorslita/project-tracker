<template>
  <div v-if="auth.user" class="w-full min-h-screen flex flex-col">
    <Sidebar :items="menuItems" />
    <Header
      menu_item="Settings"
      :username="`${auth.user.first_name} ${auth.user.last_name}`"
      :role="auth.user.role"
      :profile="auth.user.img_url || profileFallback"
    />
    <div class="container mt-32 ml-[320px] w-3/4 px-1">
      <router-view />
    </div>
    <Footer class="mt-24" />
  </div>

  <div v-else class="flex justify-center items-center min-h-screen">Loading...</div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/sidebar.vue'
import Header from '@/components/header.vue'
import Footer from '@/components/footer.vue'
import profileFallback from '@/assets/profile.jpg'
import { onMounted } from 'vue'
const auth = useAuthStore()

onMounted(async () => {
  if (!auth.user) {
    try {
      await auth.fetchProfile()
    } catch (err) {
      console.error('Failed to fetch profile', err)
    }
  }
})

const menuItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm0 8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1zm1-17a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/></svg>`,
  },
  {
    name: 'projects',
    label: 'Projects',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M104 128v8a12 12 0 0 1-24 0v-8a12 12 0 0 1 24 0m24-16a12 12 0 0 0-12 12v12a12 12 0 0 0 24 0v-12a12 12 0 0 0-12-12m36-4a12 12 0 0 0-12 12v16a12 12 0 0 0 24 0v-16a12 12 0 0 0-12-12m56-16.4V164h4a12 12 0 0 1 0 24h-84v23.22a24 24 0 1 1-24 0V188H32a12 12 0 0 1 0-24h4V91.6A20 20 0 0 1 20 72V48a20 20 0 0 1 20-20h176a20 20 0 0 1 20 20v24a20 20 0 0 1-16 19.6M44 68h168V52H44Zm152 96V92H60v72Z"/></svg>`,
  },
]
</script>
