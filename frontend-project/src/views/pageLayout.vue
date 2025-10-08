<template>
  <sidebar />

  <div class="flex flex-col fixed left-[250px] w-[calc(100vw-250px)] h-full overflow-y-auto">
    <Header />

    <div class="flex-grow pt-24 pb-10 px-20">
      <slot/>
    </div>

    <Footer />
  </div>

</template>

<script setup>
import sidebar from '@/components/sidebar.vue'
import Header from '@/components/header.vue'
import Footer from '@/components/footer.vue'

</script>

<style scoped></style>