<template>
  <div class="fixed left-[250px] w-[calc(100vw-250px)] h-[91px] z-50 bg-main-bg">
    <div class="flex items-center h-full mx-6 md:mx-12">
      <span class="ml-5 text-xl md:text-2xl font-bold w-full">{{ currentPageTitle }}</span>

      <div class="flex gap-2 items-center justify-end w-full">
        <div class="relative flex flex-col items-end">
          <!-- notification icon -->
          <div @click="toggleNotification" class="notification-bell cursor-pointer flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 mr-1 md:mr-5 cursor-pointer bg-pink-00"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M12 1a2 2 0 0 0-1.98 2.284A7 7 0 0 0 5 10v8H4a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2h-1v-8a7 7 0 0 0-5.02-6.716Q14 3.144 14 3a2 2 0 0 0-2-2m2 21a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1"
                clip-rule="evenodd"
              />
            </svg>
            <div
              v-if="unreadCount > 0"
              class="absolute -top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
            >
              {{ unreadCount }}
            </div>
          </div>
          <Notification
            v-if="showNotification"
            class="absolute top-full right-0 mt-2 z-50 notification-dropdown"
          />
        </div>
        <!-- help -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 mr-1 md:mr-5 cursor-pointer"
          viewBox="0 0 24 24"
          @click="router.push('/help')"
        >
          <path
            fill="currentColor"
            d="M11.95 18q.525 0 .888-.363t.362-.887t-.362-.888t-.888-.362t-.887.363t-.363.887t.363.888t.887.362m-.9-3.85h1.85q0-.825.188-1.3t1.062-1.3q.65-.65 1.025-1.238T15.55 8.9q0-1.4-1.025-2.15T12.1 6q-1.425 0-2.312.75T8.55 8.55l1.65.65q.125-.45.563-.975T12.1 7.7q.8 0 1.2.438t.4.962q0 .5-.3.938t-.75.812q-1.1.975-1.35 1.475t-.25 1.825M12 22q-2.075 0-3.9-.787t-3.175-2.138T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
          />
        </svg>

        <!-- new component -->
        <ProfileDropdown />
      </div>
    </div>
    <hr class="mx-3 md:mx-12" style="border-color: var(--sub-text)" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import Notification from '@/components/notification.vue'
import ProfileDropdown from '@/components/profileDropdown.vue'

const router = useRouter()
const route = useRoute()
const store = useNotificationStore()

const showNotification = ref(false)
const unreadCount = computed(() => store.notifications.filter((n) => !n.read_status).length)

const toggleNotification = () => {
  showNotification.value = !showNotification.value
}

const currentPageTitle = computed(() => route.meta.title)

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
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
