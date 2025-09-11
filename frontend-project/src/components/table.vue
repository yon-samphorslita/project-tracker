<template>
  <div class="border border-gray-600/80 rounded-lg overflow-x-auto shadow-lg max-h-[600px]">
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="bg-[#C6E7FF] px-4 py-2 text-left border-t border-b border-gray-200"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="row.id || rowIndex">
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-2 text-left border-t border-b border-gray-200"
          >
            <!-- Actions slot -->
            <template v-if="col.slot === 'actions'">
              <slot name="actions" :row="row"></slot>
            </template>

            <!-- Priority, Status, Active -->
            <template v-else-if="col.key === 'priority'">
              <Status :priority="row[col.key]" />
            </template>
            <template v-else-if="col.key === 'status'">
              <Status :status="row[col.key]" />
            </template>
            <template v-else-if="col.key === 'active'">
              <Status :active="row[col.key]" />
            </template>

            <!-- Icon / Avatar -->
            <template v-else-if="col.key === 'icon'">
              <div class="flex items-center">
                <img
                  v-if="row[col.key]"
                  :src="row[col.key]"
                  alt="avatar"
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

            <!-- Progress Bar -->
            <template v-else-if="col.key === 'progress'">
              <ProgressBar :completed="row.completed" :total="row.total" />
            </template>

            <!-- Default -->
            <template v-else>
              {{ row[col.key] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!data.length" class="text-center text-gray-500 mt-2">No data found</div>
  </div>
</template>

<script setup>
import Status from '@/components/status.vue'
import ProgressBar from '@/components/progressBar.vue'
const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  formatDate: { type: Function, default: null },
})

function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
</script>
