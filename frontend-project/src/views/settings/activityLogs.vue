<template>
  <div v-if="isAdmin" class="relative">
    <h1 class="text-2xl font-bold">Activity Logs</h1>

    <div class="flex items-center py-4 justify-start gap-4">
      <Search v-model:query="searchQuery" />

      <Filter
        class="min-w-fit"
        title="Sort / Filter"
        :fields="filterFields"
        @update="handleFilterUpdate"
      />

      <Button @click="exportCSV" class="btn text-nowrap" label="Export CSV" />
    </div>

    <div class="overflow-x-auto bg-main-bg shadow rounded-2xl p-8">
      <GenericTable :data="tableData" :columns="columns" class="h-[500px]" />
    </div>
  </div>

  <div v-else class="text-center mt-20 text-sub-text">Access denied. Admins only.</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { io } from 'socket.io-client'
import axios from 'axios'
import GenericTable from '@/components/table.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import Button from '@/components/button.vue'

const auth = useAuthStore()
const router = useRouter()

const logs = ref([])
const searchQuery = ref('')
const isAdmin = computed(() => auth.user?.role === 'admin')

// Table columns
const columns = computed(() => [
  { key: 'index', label: '#' },
  { key: 'user', label: 'User' },
  { key: 'action', label: 'Action' },
  { key: 'createdAt', label: 'Time' },
])

// Filter fields
const filterFields = [
  {
    key: 'sort',
    label: 'Sort',
    type: 'select',
    options: [
      { label: 'Newest First', value: 'desc' },
      { label: 'Oldest First', value: 'asc' },
    ],
  },
  {
    key: 'range',
    label: 'Date Range',
    type: 'select',
    options: [
      { label: 'All', value: 'all' },
      { label: 'This Month', value: 'thisMonth' },
      { label: 'Last Month', value: 'lastMonth' },
      { label: 'Last 3 Months', value: 'last3Months' },
    ],
  },
]

const currentSort = ref('desc')
const currentRange = ref('all')

function handleFilterUpdate(form) {
  currentSort.value = form.sort || 'desc'
  currentRange.value = form.range || 'all'
}

// Computed table data with search, filter, and sort
const tableData = computed(() => {
  let filtered = [...logs.value]
  const now = new Date()

  if (currentRange.value === 'thisMonth') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    filtered = filtered.filter((log) => new Date(log.createdAt) >= monthStart)
  } else if (currentRange.value === 'lastMonth') {
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    filtered = filtered.filter((log) => {
      const d = new Date(log.createdAt)
      return d >= lastMonthStart && d <= lastMonthEnd
    })
  } else if (currentRange.value === 'last3Months') {
    const pastDate = new Date()
    pastDate.setMonth(now.getMonth() - 3)
    filtered = filtered.filter((log) => new Date(log.createdAt) >= pastDate)
  }

  filtered = filtered.filter((log) =>
    log.action.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )

  filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return currentSort.value === 'desc' ? dateB - dateA : dateA - dateB
  })

  return filtered.map((log, index) => ({
    id: log.id,
    index: index + 1,
    user: log.user?.email || 'N/A',
    action: log.action,
    createdAt: new Date(log.createdAt).toLocaleString(),
  }))
})

// Fetch logs
async function fetchLogs() {
  try {
    const res = await axios.get('http://localhost:3000/activity/logs', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    logs.value = res.data
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Failed to fetch logs')
  }
}

// WebSocket setup
let socket
function setupSocket() {
  socket = io('http://localhost:3000/activity', {
    auth: { role: 'admin', token: auth.token },
    transports: ['websocket', 'polling'],
  })
  socket.on('connect', () => console.log('Connected to activity WebSocket'))
  socket.on('activityLog', (log) => logs.value.unshift(log))
}

// CSV export
function exportCSV() {
  if (!tableData.value.length) return alert('No logs to export.')

  const csvRows = [columns.value.map((col) => col.label).join(',')]
  tableData.value.forEach((row) => {
    const values = columns.value.map((col) => {
      const val = row[col.key]
      return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    })
    csvRows.push(values.join(','))
  })

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `activity_logs_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  if (!isAdmin.value) {
    alert('You do not have permission to access this page.')
    router.push('/dashboard')
    return
  }
  fetchLogs()
  setupSocket()
})

onBeforeUnmount(() => {
  if (socket) socket.disconnect()
})
</script>
