<template>
  <div class="w-[400px] rounded-lg shadow-lg border border-[var(--main-border)] bg-main-bg">
    <!-- Header -->
    <div class="flex justify-between items-center border-b-2 p-4">
      <div class="font-bold">Notifications</div>
      <div
        class="flex gap-2 text-green-600 cursor-pointer hover:text-green-800"
        @click="markAllAsRead"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m7 17l-5-5m5 0l5 5L22 7m-10 5l5-5"
          />
        </svg>
        Mark all as Read
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex mb-3 border-b-2 border-gray-600 pt-4 pb-0 mx-4 space-x-3">
      <div
        class="cursor-pointer pb-2"
        :class="
          activeTab === 'all'
            ? 'border-b-2 border-[var(--main-border)] font-semibold'
            : 'text-sub-text'
        "
        @click="showAllNotifications"
      >
        All notifications
      </div>
      <div
        class="cursor-pointer pb-2"
        :class="
          activeTab === 'unread'
            ? 'border-b-2 border-[var(--main-border)] font-semibold'
            : 'text-sub-text'
        "
        @click="showUnreadNotifications"
      >
        Unread
      </div>
    </div>

    <!-- Notification list -->
    <div class="overflow-scroll w-full max-h-[320px] flex flex-col">
      <div v-if="!notifications.length" class="p-4 text-sub-text text-center">
        No notifications yet
      </div>

      <div
        v-for="n in notifications"
        :key="n.id"
        :class="[
          'group w-full min-h-20 px-4 py-2 border-gray-200 cursor-pointer transition-colors',
          !n.read_status ? 'bg-gray-bg' : 'bg-main-bg',
        ]"
      >
        <div class="flex justify-between items-center cursor-pointer" @click="markAsRead(n.id)">
          <div class="flex items-center gap-2">
            <div v-if="!n.read_status" class="w-2 h-2 bg-blue-500 rounded-full mb-1"></div>
            <div class="font-semibold">{{ n.title }}</div>
          </div>
          <div class="text-sm text-sub-text">{{ timeAgo(n.created_at) }}</div>
        </div>

        <div class="flex justify-between items-start pl-5">
          <div class="text-sm text-sub-text line-clamp-2 p-1 pl-5">
            {{ n.message }}
          </div>

          <!-- Delete button appears only on hover -->
          <button
            class="opacity-0 group-hover:opacity-100 ml-3 text-red-500 hover:text-red-700 transition-opacity"
            @click.stop="softDeleteOne(n.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="border-t-2 p-4 font-bold cursor-pointer" @click="goToNotificationPage">
      View all notifications
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { routeLocationKey, useRouter } from 'vue-router'

const store = useNotificationStore()
const { notifications } = storeToRefs(store)
const router = useRouter()

const activeTab = ref('all')

function showAllNotifications() {
  activeTab.value = 'all'
  store.fetchNotifications()
}

function showUnreadNotifications() {
  activeTab.value = 'unread'
  store.fetchUnreadNotifications()
}

function markAllAsRead() {
  store.markAllAsRead()
}

function markAsRead(notificationId: string) {
  store.markAsRead(notificationId)
  // router.push(`/`)
}

function softDeleteOne(notificationId: number) {
  store.softDeleteOne(notificationId)
}

function goToNotificationPage() {
  router.push('/notifications')
}
function timeAgo(dateString: string) {
  const now = new Date()
  const past = new Date(dateString)
  const diff = (now.getTime() - past.getTime()) / 1000 // in seconds

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
</script>
