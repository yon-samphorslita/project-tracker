<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="n in props.notifications"
      :key="n.id"
      :class="[
        'group w-full min-h-20 flex px-4 py-2 border-gray-200 cursor-pointer transition-colors',
        !n.read_status ? 'bg-gray-bg' : 'bg-main-bg',
      ]"
    >
      <div
        class="flex justify-between items-center w-full cursor-pointer"
        @click="goToNotification(n)"
      >
        <div class="flex items-center gap-2">
          <div v-if="!n.read_status" class="w-2 h-2 bg-blue-500 rounded-full mb-1"></div>
          <div class="font-semibold whitespace-nowrap">{{ n.title }}</div>
          <div class="font-bold">-</div>
          <div class="text-sm text-sub-text line-clamp-2 p-1">
            {{ n.message }}
          </div>
        </div>

        <div class="flex text-sm text-sub-text whitespace-nowrap pr-5">
          {{ timeAgo(n.created_at) }}
        </div>
      </div>

      <!-- Delete button appears only on hover -->
      <button
        class="opacity-0 group-hover:opacity-100 ml-3 text-red-500 hover:text-red-700 transition-opacity"
        @click.stop="softDeleteOne(n.id)"
      >
        <Delete />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import Delete from '@/assets/icons/delete.svg'
import axios from 'axios'
import { useRouter } from 'vue-router'

const store = useNotificationStore()
const router = useRouter()
const props = defineProps<{
  notifications: any
}>()

async function goToNotification(n: any) {
  try {
    if (!n.read_status) {
      await store.markAsRead(n.id)
    }

    // router.push(n.link)
    if (n.link) router.push(n.link)
  } catch (err) {
    console.error('Failed to mark notification as read:', err)
  }
}

function softDeleteOne(notificationId: number) {
  store.softDeleteOne(notificationId)
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
