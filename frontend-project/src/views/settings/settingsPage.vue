<template>
  <div class="flex flex-col gap-6">
    <!-- Settings Options -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Notifications -->
      <div class="bg-main-bg shadow-md rounded-2xl p-6 flex flex-col gap-4 hover:brightness-90">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-lg">Notifications</h2>
            <p class="text-sm text-sub-text">
              Turn on to receive alerts about updates and activity.
            </p>
          </div>
          <button
            @click="toggleNotifications"
            :class="[
              'w-12 h-6 rounded-full transition-colors relative focus:outline-none',
              notificationsEnabled ? 'bg-blue-bg' : 'bg-gray-300',
            ]"
          >
            <span
              :class="[
                'block w-6 h-6 bg-main-bg rounded-full shadow transform transition-transform',
                notificationsEnabled ? 'translate-x-6' : 'translate-x-0',
              ]"
            ></span>
          </button>
        </div>
      </div>

      <!-- Personal Information -->
      <div
        class="bg-main-bg shadow-md rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition"
        @click="$router.push('/settings/profile')"
      >
        <div>
          <h2 class="font-semibold text-lg">Personal Information</h2>
          <p class="text-sm text-sub-text">View and edit your name, email, and profile details.</p>
        </div>
        <NextIcon />
      </div>

      <!-- Activity Logs (Admin Only) -->
      <div
        v-if="isAdmin"
        class="bg-main-bg shadow-md rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition"
        @click="$router.push('/settings/activity-logs')"
      >
        <div>
          <h2 class="font-semibold text-lg">Activity Logs</h2>
          <p class="text-sm text-sub-text">Review recent account activities and actions.</p>
        </div>
        <NextIcon />
      </div>

      <!-- Theme Settings -->
      <div
        class="bg-main-bg shadow-md rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition"
        @click="$router.push('/settings/theme')"
      >
        <div>
          <h2 class="font-semibold text-lg">Themes</h2>
          <p class="text-sm text-sub-text">Customize your application appearance.</p>
        </div>
        <NextIcon />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import NextIcon from '@/assets/icons/next.svg'

const notificationStore = useNotificationStore()
const userStore = useUserStore()

const notificationsEnabled = computed({
  get: () => notificationStore.notificationsEnabled,
  set: (val) => notificationStore.toggleNotifications(val),
})

const toggleNotifications = () => {
  notificationStore.toggleNotifications(!notificationsEnabled.value)
}

const isAdmin = computed(() => userStore.currentUser?.role === 'admin')
</script>
