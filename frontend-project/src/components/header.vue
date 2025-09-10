<template>
  <div class="fixed top-0 left-[250px] w-[calc(100vw-250px)] h-[91px] z-50 bg-white">
    <div class="flex items-center h-full mx-6 md:mx-12">
      <span class="ml-5 text-black text-xl md:text-2xl font-bold">{{ menu_item }}</span>

      <div class="flex items-center justify-end w-full">
        <div class="relative flex flex-col items-end">
          <!-- notification icon -->
          <div @click="toggleNotification" class="notification-bell cursor-pointer flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 mr-1 md:mr-5 cursor-pointer"
              viewBox="0 0 24 24"
            >
              <g fill="none" stroke="currentColor" stroke-width="2.5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 19v-9a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v9M6 19h12M6 19H4m14 0h2m-9 3h2"
                />
                <circle cx="12" cy="3" r="1" />
              </g>
            </svg>
          </div>

          <!-- Notification dropdown -->
          <Notification
            v-if="showNotification"
            class="absolute top-full right-0 mt-2 z-50 notification-dropdown"
          />
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 mr-1 md:mr-5 cursor-pointer"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M11.95 18q.525 0 .888-.363t.362-.887t-.362-.888t-.888-.362t-.887.363t-.363.887t.363.888t.887.362m-.9-3.85h1.85q0-.825.188-1.3t1.062-1.3q.65-.65 1.025-1.238T15.55 8.9q0-1.4-1.025-2.15T12.1 6q-1.425 0-2.312.75T8.55 8.55l1.65.65q.125-.45.563-.975T12.1 7.7q.8 0 1.2.438t.4.962q0 .5-.3.938t-.75.812q-1.1.975-1.35 1.475t-.25 1.825M12 22q-2.075 0-3.9-.787t-3.175-2.138T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
          />
        </svg>

        <!-- user profile  -->
        <div
          class="flex items-center bg-[#C6E7FF] rounded-full px-3 py-1.5 w-[130px] max-w-[150px] truncate cursor-pointer"
          @click="gotoProfile"
        >
          <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
            <img :src="profile" alt="Profile Image" />
          </div>
          <div class="flex flex-col truncate">
            <span class="text-sm font-medium truncate">{{ username }}</span>
            <span class="text-xs text-gray-500 truncate">{{ role }}</span>
          </div>
        </div>
      </div>
    </div>
    <hr class="mx-3 md:mx-12" />
  </div>
</template>

<script setup lang="ts">
import profileimg from '@/assets/profile.jpg'
import { useRouter } from 'vue-router'
import Notification from '@/components/notification.vue'
import { useNotificationStore } from '@/stores/notification'
import { onBeforeUnmount, onMounted, ref } from 'vue'
const router = useRouter()

defineProps({
  menu_item: {
    type: String,
    default: 'Dashboard',
  },
  username: {
    type: String,
    default: 'Megan Sea',
  },
  role: {
    type: String,
    default: 'Project Manager',
  },
  profile: {
    type: String,
    default: profileimg,
  },
})
function gotoProfile() {
  router.push('/settings/profile')
  console.log('Navigating to profile page...')
}
const showNotification = ref(false)
const store = useNotificationStore()

const toggleNotification = () => {
  showNotification.value = !showNotification.value
}

// close when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const dropdown = document.querySelector('.notification-dropdown')
  const bell = document.querySelector('.notification-bell')

  if (
    showNotification.value &&
    dropdown &&
    !dropdown.contains(e.target as Node) &&
    bell &&
    !bell.contains(e.target as Node)
  ) {
    showNotification.value = false
  }
}

onMounted(() => {
  store.connect('1')
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style></style>
