<template>
  <div ref="profileRef" class="relative">
    <!-- Profile Button -->
    <div class="rounded-full cursor-pointer" @click="toggleDropdown">
      <div class="w-9 h-9 rounded-full overflow-hidden">
        <img :src="user?.img_url" alt="Profile Image" class="w-9 h-9 object-cover" />
      </div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-72 bg-main-bg shadow-lg rounded-md border border-black overflow-hidden z-50"
    >
      <div class="flex flex-col gap-4 p-4">
        <!-- Account Section -->
        <div>
          <p class="text-xs text-[var(--gray-text)] font-bold mb-2">ACCOUNT</p>
          <div class="flex items-center gap-3 p-2 rounded-md">
            <div class="w-12 h-12 rounded-full overflow-hidden">
              <img :src="user?.img_url" alt="Profile Image" class="w-12 h-12 object-cover" />
            </div>
            <div class="flex flex-col truncate">
              <span class="font-medium truncate">
                {{ user ? `${user.first_name} ${user.last_name}` : '' }}
              </span>
              <span class="text-sm text-sub-text truncate">{{ user.email }}</span>
            </div>
          </div>
        </div>

        <hr />

        <!-- Trackzen Section -->
        <div>
          <p class="text-xs text-[var(--gray-text)] font-bold mb-2">TRACKZEN</p>
          <ul class="flex flex-col">
            <li class="hover:bg-black/15 rounded-md p-2 cursor-pointer" @click.stop="gotoProfile">
              Profile
            </li>
            <li
              v-if="Role === 'Admin'"
              class="hover:bg-black/15 rounded-md p-2 cursor-pointer"
              @click.stop="gotoActivityLogs"
            >
              Activity Logs
            </li>
            <li class="hover:bg-black/15 rounded-md p-2 cursor-pointer" @click.stop="gotoSettings">
              Settings
            </li>

            <!-- Notification Toggle -->
            <li class="flex items-center justify-between p-2 rounded-md">
              <span>Notifications</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="notificationsEnabled" class="sr-only peer" />
                <div
                  class="w-10 h-5 bg-[var(--sub-text)] peer-focus:ring-2 peer-focus:ring-[var(--blue-bg)] rounded-full peer-checked:after:translate-x-5 peer-checked:bg-blue-bg after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--sub-text)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
                ></div>
              </label>
            </li>

            <li class="hover:bg-black/15 rounded-md p-2 cursor-pointer" @click.stop="gotoTheme">
              Theme
            </li>
          </ul>
        </div>

        <hr />

        <!-- Help Section -->
        <div>
          <ul class="flex flex-col">
            <li class="hover:bg-black/15 rounded-md p-2 cursor-pointer" @click.stop="gotoHelp">
              Help
            </li>
          </ul>
        </div>

        <hr />

        <!-- Logout Section -->
        <div>
          <ul>
            <li
              class="hover:bg-black/15 rounded-md p-2 cursor-pointer text-red-500 font-bold"
              @click.stop="logout"
            >
              Logout
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watchEffect, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const user = computed(() => authStore.user)
const showDropdown = ref(false)
const profileRef = ref(null)

// Toggle dropdown
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Notification toggle
const notificationsEnabled = computed({
  get: () => notificationStore.notificationsEnabled,
  set: (val) => notificationStore.toggleNotifications(val),
})

// Connect to socket when user is available
watchEffect(() => {
  if (user.value && user.value.id) {
    notificationStore.connect(user.value.id)
  }
})

// Navigation helpers
const gotoProfile = async () => {
  showDropdown.value = false
  await nextTick()
  router.push('/settings/profile')
}

const gotoSettings = async () => {
  showDropdown.value = false
  await nextTick()
  router.push('/settings')
}

const gotoActivityLogs = async () => {
  showDropdown.value = false
  await nextTick()
  router.push('/settings/activity-logs')
}

const gotoTheme = async () => {
  showDropdown.value = false
  await nextTick()
  router.push('/settings/theme')
}

const gotoHelp = async () => {
  showDropdown.value = false
  await nextTick()
  router.push('/help')
}

// Logout
const logout = async () => {
  showDropdown.value = false
  if (notificationStore.socket) notificationStore.socket.disconnect()
  try {
    await authStore.logout(router)
  } catch (err) {
    console.error('Logout failed', err)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// Compute user role for conditional items
const Role = computed(() => {
  if (!user.value) return ''
  switch (user.value.role) {
    case 'admin':
      return 'Admin'
    case 'project_manager':
      return 'Project Manager'
    case 'member':
      return 'Member'
    default:
      return user.value.role || ''
  }
})
</script>
