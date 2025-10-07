<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Activity Logs</h1>
    <div class="flex items-center w-full">
      <Search @update="searchQuery = $event" />
      <Filter class="min-w-fit" title="Sort / Filter" :options="sortOptions" @select="applySort" />
      <button
        class="ml-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        @click="exportToCSV"
      >
        Export CSV
      </button>
    </div>
    <div class="overflow-x-auto bg-white shadow rounded-2xl p-8">
      <GenericTable :data="tableData" :columns="columns">
        <!-- Optional actions slot if needed -->
        <template #actions="{ row }">
          <!-- Example: view details button -->
          <button class="text-blue-500 hover:underline" @click="viewLog(row)">View</button>
        </template>
      </GenericTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import GenericTable from '@/components/table.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
const auth = useAuthStore()
const logs = ref([])
const isAdmin = ref(false)
const searchQuery = ref('')
// Format date
function formatDate(date) {
  return new Date(date).toLocaleString()
}

// Columns definition
const columns = computed(() => {
  const baseCols = [
    { key: 'index', label: '#' },
    { key: 'action', label: 'Action' },
    { key: 'createdAt', label: 'Time' },
  ]
  if (isAdmin.value) {
    baseCols.splice(1, 0, { key: 'user', label: 'User' }) // insert after index
  }
  return baseCols
})

// Map logs for GenericTable
const tableData = computed(() =>
  logs.value
    .filter((log) => log.action.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .map((log, index) => ({
      id: log.id,
      index: index + 1,
      user: log.user?.email || 'N/A',
      action: log.action,
      createdAt: formatDate(log.createdAt),
    })),
)

const sortOptions = [
  { label: 'Newest First', value: 'desc' },
  { label: 'Oldest First', value: 'asc' },
]

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
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
    logs.value = res.data
    isAdmin.value = auth.user.role === 'admin'
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Failed to fetch logs')
  }
}

// Optional action
function viewLog(row) {
  alert(`Viewing log: ${row.action}`)
}

onMounted(() => {
  fetchLogs()
})
function exportToCSV() {
  if (!logs.value.length) return alert('No logs to export.')

  // Map table data for CSV
  const csvRows = []
  const headers = columns.value.map((col) => col.label)
  csvRows.push(headers.join(','))

  tableData.value.forEach((row) => {
    const values = columns.value.map((col) => {
      let val = row[col.key]
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""') // escape quotes
        return `"${val}"`
      }
      return val
    })
    csvRows.push(values.join(','))
  })

  // Create CSV file and trigger download
  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `activity_logs_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
