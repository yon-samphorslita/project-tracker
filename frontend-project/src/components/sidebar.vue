<template>
  <div
    class="h-screen w-[250px] top-0 left-0 bg-blue-bg bg-opacity-50 fixed overflow-hidden flex flex-col"
  >
    <div class="flex justify-center items-center">
      <Logo class="text-graysvg-text w-[80%] h-[91px]"
/>
    </div>

    <hr style="margin-left: 10%; margin-right: 10%; border-color: var(--sub-text)" />

    <div class="flex flex-col gap-2 ml-3 m-8">
      <!-- <div class="text-sub-text text-sm mb-1 ml-5">Main</div> -->

      <router-link
        v-for="item in displayedMainItems"
        :key="item.name"
        :to="item.route"
        class="flex align-center gap-3 p-2 text-lg w-full rounded-md ml-6 btn cursor-pointer;"
      >
        <component :is="item.icon" class="w-6 h-6"></component>
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
  {
    name: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    icon: DashboardIcon,
  },
  {
    name: 'projects',
    label: 'Projects',
    route: '/projects',
    icon: ProjectIcon,
  },
  {
    name: 'tasks',
    label: 'Tasks',
    route: '/task',
    icon: TaskIcon,
  },
  {
    name: 'teams',
    label: 'Teams',
    route: '/teams',
    icon: TeamIcon,
  },
  {
    name: 'calendars',
    label: 'Calendar',
    route: '/calendar',
    icon: CalendarIcon,
  },
])

const adminMenu = {
  name: 'users',
  label: 'User Management',
  route: '/user',
  icon: UserIcon,
}

const displayedMainItems = computed(() => {
  if (user.value?.role === 'admin') {
    return [...mainItems.value, adminMenu]
  }
  return mainItems.value
})
</script>
