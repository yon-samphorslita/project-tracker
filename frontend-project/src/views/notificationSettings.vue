<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Notifications</h1>

    <label>
      <input type="checkbox" v-model="notificationsEnabled" @change="toggleNotifications" />
      Notifications
    </label>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  setup() {
    const store = useNotificationStore()
    const notifications = computed(() => store.notifications)
    const notificationsEnabled = computed({
      get: () => store.notificationsEnabled,
      set: (val) => store.toggleNotifications(val),
    })

    const toggleNotifications = () => {
      store.toggleNotifications(notificationsEnabled.value)
    }

    return {
      notifications,
      notificationsEnabled,
      toggleNotifications,
    }
  },
}
</script>
