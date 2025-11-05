<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">Theme Settings</h1>
    <p class="text-sub-text">Choose your preferred theme for the app.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div
        v-for="option in themes"
        :key="option.value"
        @click="setTheme(option.value)"
        role="button"
        :aria-pressed="option.value === theme"
        class="cursor-pointer rounded-2xl shadow-md p-6 flex flex-col items-center justify-center transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2"
        :class="[
          option.bgClass,
          option.textClass,
          option.value === theme ? 'ring-4 ring-offset-2 ring-[#C6E7FF]' : '',
        ]"
      >
        <div class="text-lg font-semibold mb-2">{{ option.name }}</div>
        <div class="text-sm text-center">{{ option.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const theme = computed(() => themeStore.theme)

const themes = [
  {
    name: 'Light',
    value: 'light',
    description: 'Bright mode with light background.',
    bgClass: 'bg-white text-black',
  },
  {
    name: 'Dark',
    value: 'dark',
    description: 'Dark mode for night reading.',
    bgClass: 'bg-gray-900 text-white',
  },
  {
    name: 'Blue',
    value: 'blue',
    description: 'Blue accent theme for a colorful look.',
    bgClass: 'bg-blue-600 text-white',
  },
  {
    name: 'Spring',
    value: 'spring',
    description: 'Fresh spring green theme.',
    bgClass: 'bg-green-100 text-green-800',
  },
  {
    name: 'Sunset',
    value: 'sunset',
    description: 'Warm sunset tones.',
    bgClass: 'bg-orange-100 text-orange-800',
  },
  {
    name: 'Ocean',
    value: 'ocean',
    description: 'Cool ocean blue theme.',
    bgClass: 'bg-sky-100 text-blue-900',
  },
]

const setTheme = (val) => {
  themeStore.setTheme(val)
}
</script>
