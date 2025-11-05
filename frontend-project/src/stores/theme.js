import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  const applyTheme = (value) => {
    document.documentElement.className = value // replace all classes
  }

  // Apply theme on init
  applyTheme(theme.value)

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  })

  const setTheme = (val) => {
    theme.value = val
  }

  return { theme, setTheme }
})
