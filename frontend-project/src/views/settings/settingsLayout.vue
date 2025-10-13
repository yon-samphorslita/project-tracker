<template>
  <div v-if="auth.user" class="w-full min-h-screen flex flex-col">
    <Sidebar />
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
</script>
