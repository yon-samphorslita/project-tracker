<template>
  <div :class="appClasses" class="min-h-screen transition-colors duration-200">
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const theme = computed(() => themeStore.theme)

const appClasses = computed(() => {
  switch (theme.value) {
    case 'light':
      return 'bg-theme-light-bg text-theme-light-text'
    case 'dark':
      return 'bg-theme-dark-bg text-theme-dark-text'
    case 'blue':
      return 'bg-theme-blue-bg text-theme-blue-text'
  }
})
</script>
