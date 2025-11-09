<template>
  <div class="relative flex flex-col min-h-screen">
    <div class="flex flex-col ml-[250px]">
      <Header />
      <sidebar />
      <div class="flex-grow pt-36 pb-10 px-20 min-h-[600px]">
        <slot />
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import sidebar from '@/components/common-used/sidebar.vue'
import Header from '@/components/common-used/header.vue'
import Footer from '@/components/common-used/footer.vue'
</script>
