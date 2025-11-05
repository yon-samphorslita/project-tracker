<template>
  <div
    class="h-screen top-0 left-0 bg-blue-bg bg-opacity-50 fixed overflow-hidden flex flex-col z-40"
  >
    <div class="flex justify-center items-center">
      <Logo class="text-graysvg-text w-[80%] h-[91px]" />
    </div>

    <hr class="mx-4 border-[var(--sub-text)]" />

    <div class="flex flex-col gap-2 ml-2 mt-8">
      <router-link
        v-for="item in displayedMainItems"
        :key="item.name"
        :to="item.route"
        class="flex items-center align-center gap-3 p-2 text-lg w-full rounded-md ml-5 cursor-pointer btn"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <p>{{ item.label }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/assets/icons/logo.svg'
import DashboardIcon from '@/assets/icons/dashboard.svg'
import ProjectIcon from '@/assets/icons/project.svg'
import TaskIcon from '@/assets/icons/task.svg'
import TeamIcon from '@/assets/icons/team.svg'
import CalendarIcon from '@/assets/icons/calendar.svg'
import UserIcon from '@/assets/icons/user.svg'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const mainItems = ref([
  { name: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: DashboardIcon },
  { name: 'projects', label: 'Projects', route: '/projects', icon: ProjectIcon },
  { name: 'tasks', label: 'Tasks', route: '/task', icon: TaskIcon },
  { name: 'teams', label: 'Teams', route: '/teams', icon: TeamIcon },
  { name: 'calendars', label: 'Calendar', route: '/calendar', icon: CalendarIcon },
])

const adminMenu = { name: 'users', label: 'User Management', route: '/user', icon: UserIcon }

const displayedMainItems = computed(() => {
  return user.value?.role === 'admin' ? [...mainItems.value, adminMenu] : mainItems.value
})
</script>
