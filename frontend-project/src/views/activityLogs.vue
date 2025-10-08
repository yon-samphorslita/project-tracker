<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Activity Logs</h1>

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

const auth = useAuthStore()
const logs = ref([])
const isAdmin = ref(false)

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
  logs.value.map((log, index) => ({
    id: log.id,
    index: index + 1,
    user: log.user?.email || 'N/A',
    action: log.action,
    createdAt: formatDate(log.createdAt),
  })),
)

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
</script>

<style scoped>
/* Optional: make table scrollable on small screens */
table {
  min-width: 600px;
}
</style>
