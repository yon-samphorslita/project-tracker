<template>
  <div class="table-container">
    <table class="custom-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" @click="sortBy(col.key)">
            {{ col.label }}
            <span v-if="sortColumn === col.key">
              {{ sortDirection === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, rowIndex) in filteredData" :key="rowIndex">
          <td v-for="col in columns" :key="col.key">
            <!-- Priority -->
            <template v-if="col.key === 'priority'">
              <span class="priority-pill" :class="row[col.key].toLowerCase()">
                {{ row[col.key] }}
              </span>
            </template>

            <!-- Status -->
            <template v-else-if="col.key === 'status'">
              <span class="status-badge" :class="row[col.key].toLowerCase().replace(' ', '-')">
                {{ row[col.key] }}
              </span>
            </template>

            <!-- Assignee / Avatar -->
            <template v-else-if="col.key === 'icon'">
              <div class="avatar-wrapper">
                <img v-if="row[col.key]" :src="row[col.key]" alt="assignee" class="avatar" />
                <div v-else class="avatar-fallback">{{ getInitials(row.name) }}</div>
              </div>
            </template>

            <!-- Dates -->
            <template v-else-if="['start_date', 'due_date'].includes(col.key)">
              {{ formatDate ? formatDate(row[col.key]) : row[col.key] }}
            </template>

            <!-- Default -->
            <template v-else>
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!filteredData.length" class="empty-message">No data found</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  formatDate: { type: Function, required: false },
})

const searchQuery = ref('')
const sortColumn = ref(null)
const sortDirection = ref('asc')

const filteredData = computed(() => {
  let result = [...props.data]

  if (searchQuery.value) {
    result = result.filter((row) =>
      Object.values(row).join(' ').toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  if (sortColumn.value) {
    result.sort((a, b) => {
      const valA = a[sortColumn.value]
      const valB = b[sortColumn.value]
      if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

function sortBy(col) {
  if (sortColumn.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = col
    sortDirection.value = 'asc'
  }
}

function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
</script>

<style scoped>
.table-container {
  border: 1px solid rgba(56, 56, 56, 0.8);
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

/* Only horizontal borders, no vertical borders */
.custom-table th,
.custom-table td {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  border-left: none;
  border-right: none;
  padding: 10px;
  text-align: left;
}

.custom-table th {
  background: #c6e7ff;
  cursor: pointer;
  user-select: none;
}

.empty-message {
  text-align: center;
  color: #777;
  margin-top: 10px;
}

/* Priority Pills */
.priority-pill {
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: 600;
  color: #fff;
}
.priority-pill.high {
  background: #c70707;
}
.priority-pill.medium {
  background: #fac036;
}
.priority-pill.low {
  background: #07c70e;
}

/* Status Badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 5px;
  font-weight: 600;
  text-transform: capitalize;
}
.status-badge.in-progress {
  background: #2196f3;
  color: #fff;
}
.status-badge.not-started {
  background: #9e9e9e;
  color: #fff;
}
.status-badge.completed {
  background: #4caf50;
  color: #fff;
}

/* Avatar */
.avatar-wrapper {
  display: flex;
  align-items: center;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}
.avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #bbb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>
