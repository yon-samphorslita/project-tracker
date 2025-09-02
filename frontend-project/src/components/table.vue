<template>
  <div class="border border-gray-600/80 rounded-lg overflow-x-auto shadow-lg max-h-[600px]">
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            @click="sortBy(col.key)"
            class="bg-[#C6E7FF] cursor-pointer select-none px-4 py-2 text-left border-t border-b border-gray-200"
          >
            {{ col.label }}
            <span v-if="sortColumn === col.key">
              {{ sortDirection === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, rowIndex) in filteredData" :key="rowIndex">
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-2 text-left border-t border-b border-gray-200"
          >
            <!-- Actions Column -->
            <template v-if="col.slot === 'actions'">
              <slot name="actions" :row="row"></slot>
            </template>

            <!-- Priority -->
            <template v-else-if="col.key === 'priority'">
              <Status :priority="row[col.key]" />
            </template>

            <!-- Status -->
            <template v-else-if="col.key === 'status'">
              <Status :status="row[col.key]" />
            </template>
            <!-- Active Column -->
            <template v-else-if="col.key === 'active'">
              <Status :active="row[col.key]" />
            </template>

            <!-- Assignee / Avatar -->
            <template v-else-if="col.key === 'icon'">
              <div class="flex items-center">
                <img
                  v-if="row[col.key]"
                  :src="row[col.key]"
                  alt="assignee"
                  class="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm"
                >
                  {{ getInitials(row.name) }}
                </div>
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

    <div v-if="!filteredData.length" class="text-center text-gray-500 mt-2">No data found</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Status from '@/components/status.vue'

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
