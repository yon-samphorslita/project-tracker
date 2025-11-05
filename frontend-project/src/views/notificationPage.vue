<template>
  <PageLayout>
    <div class="flex flex-col gap-4">
      <!-- header  -->
      <div class="font-bold text-xl">Notifications</div>

      <div class="flex gap-4 w-full items-center justify-end">
        <!-- search function  -->
        <!-- <Search v-model:query="searchQuery" /> -->

        <div class="flex justify-end items-center bg-purple- gap-3 w-1/2">
          <!-- mark as read button  -->
          <button
            class="flex gap-2 text-green-600 border px-2 py-1 rounded-lg cursor-pointer hover:text-green-800"
            @click="markAllAsRead"
          >
            <MarkIcon />
            Mark all as Read
          </button>

          <!-- delete all button  -->
          <button
            class="flex gap-2 text-red-600 border px-2 py-1 rounded-lg cursor-pointer hover:text-red-800"
            @click="deleteAll"
          >
            <Delete />
            Delete All
          </button>

          <!-- sort by function -->
          <Filter class="min-w-fit" title="Sort by" :options="sortOptions" @select="applySort" />
        </div>
      </div>

      <!-- active filter indicator -->
      <div v-if="selectedSort" class="flex items-center justify-end gap-2">
        <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          Filter: {{ sortOptions.find((opt) => opt.value === selectedSort)?.label }}
        </span>
        <button @click="clearSort" class="text-sm text-red-500 hover:underline">Clear</button>
      </div>

      <!-- body  -->
      <div>
        <!-- tab  -->
        <div
          class="flex justify-between border rounded-t-2xl border-b-2 pb-2 p-4 bg-main-bg text-lg font-semibold"
        >
          <div
            class="w-1/3 cursor-pointer pb-2"
            :class="
              currentTab === 'all'
                ? 'border-b-2 border-[var(--main-border)] font-semibold'
                : 'text-sub-text'
            "
            @click="showAllNotifications"
          >
            All notifications
          </div>
          <div
            class="w-1/3 cursor-pointer pb-2"
            :class="
              currentTab === 'read'
                ? 'border-b-2 border-[var(--main-border)] font-semibold'
                : 'text-sub-text'
            "
            @click="showReadNotifications"
          >
            Read
          </div>
          <div
            class="w-1/3 cursor-pointer pb-2"
            :class="
              currentTab === 'unread'
                ? 'border-b-2 border-[var(--main-border)] font-semibold'
                : 'text-sub-text'
            "
            @click="showUnreadNotifications"
          >
            Unread
          </div>
        </div>

        <!-- notification list  -->
        <div class="flex flex-col gap-3 border rounded-b-2xl p-4 bg-main-bg h-full">
          <NotificationCard :notifications="filteredSortedNotifications" />

          <div v-if="!filteredSortedNotifications.length" class="text-center text-sub-text py-3">
            No notifications found
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import PageLayout from './pageLayout.vue'
import search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import NotificationCard from '@/components/notificationCard.vue'
import MarkIcon from '@/assets/icons/mark.svg'
import Delete from '@/assets/icons/delete.svg'
// Stores
const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)

const currentTab = ref('all')
function showAllNotifications() {
  currentTab.value = 'all'
}

function showUnreadNotifications() {
  currentTab.value = 'unread'
}

function showReadNotifications() {
  currentTab.value = 'read'
}

function markAllAsRead() {
  notificationStore.markAllAsRead()
}

function deleteAll() {
  notificationStore.softDeleteAll()
}

const searchQuery = ref('')
const selectedSort = ref('')
const sortOptions = [
  { value: 'today', label: 'by Today' },
  { value: 'this week', label: 'by This week' },
  { value: 'this month', label: 'by This month' },
  // { value: 'see All', label: 'See All'},
]

// Computed filtered & sorted projects
const filteredSortedNotifications = computed(() => {
  let list = [...notifications.value]
  // console.log('Notifications: ', list )
  const now = new Date()

  // Search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((n) => n.message.toLowerCase().includes(q))
  }

  // Tab filter
  if (currentTab.value === 'read') {
    list = list.filter((n) => n.read_status === true)
  } else if (currentTab.value === 'unread') {
    list = list.filter((n) => n.read_status === false)
  }

  // Date filter
  switch (selectedSort.value) {
    case 'today':
      list = list.filter((n) => {
        const created = new Date(n.created_at)
        return created.toLocaleDateString() === now.toLocaleDateString()
      })
      break
    case 'this week':
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
      startOfWeek.setHours(0, 0, 0, 0)
      list = list.filter((n) => new Date(n.created_at) >= startOfWeek)
      break
    case 'this month':
      list = list.filter((n) => {
        const created = new Date(n.created_at)
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      })
      break
    case 'see All':
    default:
      // no filter
      break
  }
  // console.log('Notification list: ', list);
  return list
})

// Sorting
const applySort = (option) => {
  selectedSort.value = option
}

const clearSort = () => {
  selectedSort.value = ''
}
</script>
