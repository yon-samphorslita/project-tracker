<template>
  <div v-if="auth.user" class="w-full min-h-screen flex flex-col">
    <div class="flex flex-col ml-[250px]">
      <Header />
      <Sidebar />
      <main class="flex-grow pt-32 pb-10 px-20 min-h-[600px]">
        <router-view />
      </main>
    </div>
    <Footer />
  </div>

  <div v-else class="flex justify-center items-center min-h-screen">Loading...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/common-used/sidebar.vue'
import Header from '@/components/common-used/header.vue'
import Footer from '@/components/common-used/footer.vue'

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
