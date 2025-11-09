<template>
  <div class="fixed left-[250px] w-[calc(100vw-250px)] h-[91px] z-30 bg-main-bg">
    <div class="flex items-center h-full mx-6 md:mx-12">
      <span class="ml-5 text-xl md:text-2xl font-bold w-full">{{ currentPageTitle }}</span>

      <div class="flex gap-2 items-center justify-end w-full">
        <div class="relative flex flex-col items-end">
          <!-- notification icon -->
          <div @click="toggleNotification" class="notification-bell cursor-pointer flex">
            <NotificationIcon class="w-6 h-6 mr-1 md:mr-5 cursor-pointer icon-theme" />
            <div
              v-if="unreadCount > 0"
              class="absolute -top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
            >
              {{ unreadCount }}
            </div>
          </div>
          <Notification
            v-if="showNotification"
            class="absolute top-full right-0 mt-2 z-30 notification-dropdown"
          />
        </div>
        <HelpIcon
          class="w-6 h-6 mr-1 md:mr-5 cursor-pointer icon-theme"
          @click="router.push('/help')"
        />
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
import ProfileDropdown from '@/components/common-used/profileDropdown.vue'
import NotificationIcon from '@/assets/icons/notification.svg'
import HelpIcon from '@/assets/icons/help.svg'
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
