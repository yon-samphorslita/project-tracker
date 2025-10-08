<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Activity Logs</h1>

    <div class="flex items-center w-full mb-4">
      <Search @update="searchQuery = $event" />
      <Filter
        class="min-w-fit"
        title="Sort / Filter"
        :options="sortOptions"
        @select="applySort"
      />
      <Button
        label="Export CSV"
        btn-color="green"
        class="ml-auto text-white px-4 py-2 rounded hover:bg-green-600 transition"
        @click="exportToCSV"
      />
    </div>

    <div class="overflow-x-auto bg-white shadow rounded-2xl p-8">
      <GenericTable :data="tableData" :columns="columns" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { io } from 'socket.io-client'
import axios from 'axios'
import GenericTable from '@/components/table.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import Button from '@/components/button.vue'

// Stores and state
const auth = useAuthStore()
const logs = ref([])
const isAdmin = ref(false)
const searchQuery = ref('')

// Columns for table
const columns = computed(() => {
  const baseCols = [
    { key: 'index', label: '#' },
    { key: 'action', label: 'Action' },
    { key: 'createdAt', label: 'Time' },
  ]
  if (isAdmin.value) baseCols.splice(1, 0, { key: 'user', label: 'User' })
  return baseCols
})

// Table data mapping
const tableData = computed(() =>
  logs.value
    .filter((log) => log.action.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .map((log, index) => ({
      id: log.id,
      index: index + 1,
      user: log.user?.email || 'N/A',
      action: log.action,
      createdAt: new Date(log.createdAt).toLocaleString(),
    }))
)

// Sorting options
const sortOptions = [
  { label: 'Newest First', value: 'desc' },
  { label: 'Oldest First', value: 'asc' },
]

// Sort function
function applySort(option) {
  if (!option) return
  logs.value.sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return option.value === 'desc' ? dateB - dateA : dateA - dateB
  })
}

// Fetch logs from backend
async function fetchLogs() {
  try {
    const res = await axios.get('http://localhost:3000/activity/logs', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    logs.value = res.data
    isAdmin.value = auth.user.role === 'admin'
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Failed to fetch logs')
  }
}

// WebSocket for live updates
let socket
onMounted(() => {
  fetchLogs()

  if (auth.user.role === 'admin') {
    socket = io('http://localhost:3000/activity', {
      auth: { role: 'admin', token: auth.token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => console.log('Connected to activity WebSocket'))
    socket.on('activityLog', (log) => logs.value.unshift(log))
  }
})

onBeforeUnmount(() => {
  if (socket) socket.disconnect()
})

// Export CSV
function exportToCSV() {
  if (!logs.value.length) return alert('No logs to export.')

  const csvRows = []
  csvRows.push(columns.value.map((col) => col.label).join(','))

  tableData.value.forEach((row) => {
    const values = columns.value.map((col) => {
      let val = row[col.key]
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
</script>
