// stores/theme.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  const applyTheme = (value) => {
    document.documentElement.classList.remove('light', 'dark', 'blue', 'spring', 'sunset', 'ocean')
    document.documentElement.classList.add(value)
  }

  // Apply on init
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
