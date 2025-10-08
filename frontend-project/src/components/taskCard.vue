<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="grid grid-cols-[3fr_2fr_1fr_1fr_1fr_auto] font-semibold border-b-2 pb-3 bg-white text-lg">
      <div class="pl-4">Task</div>
      <div class="flex justify-center">Project</div>
      <div class="flex justify-center">Due</div>
      <div class="flex justify-center">Priority</div>
      <!-- <div class="flex justify-center">Status</div> -->
      <div class="flex justify-center">Action</div>
      <div class="mx-5"></div>
    </div>

    <!-- Task Rows -->
    <div
      v-for="item in tasks"
      :key="item.id"
      class="group grid grid-cols-[3fr_2fr_1fr_1fr_1fr_auto] items-center px-4 py-3 rounded-lg border border-grey-200 hover:bg-grey-50 transition"
    >
      <div class=" truncate ">{{ item.title }}</div>
      <div class=" truncate flex justify-center ">{{ item.projectname }}</div>
      <div class="flex justify-center">{{ formatDate(item.due_date) }}</div>

      <!-- Priority -->
      <div class="flex justify-center">
        <span
          :class="[
            'px-2 py-1 rounded  w-auto inline-block',
            item.priority === 'High' ? ' w-auto bg-red- text-red-600' :
            item.priority === 'Medium' ? 'bg-yellow- text-yellow-600' :
            'bg-green- text-green-600'
          ]"
        >
          {{ item.priority }}
        </span>
      </div>

      <!-- Status -->
      <!-- <div class="flex justify-center">
        <span
          :class="[
            'px-2 py-1 rounded font-medium ',
            item.status === 'Completed' ? 'bg-green-100 text-green-600' :
            item.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-600'
          ]"
        >
          {{ item.status }}
        </span>
      </div> -->


      <!-- Action Buttons  -->
      <div class="flex justify-around gap-2 bg-red-">
        <button
          v-if="item.status === 'Not Started'"
          class="px-3 py-1 border border-blue-500 rounded-lg bg-blue-100 text-blue-700 
                  hover:bg-blue-500 hover:text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
          @click="$emit('update-status', item.id, 'In Progress')"
        >
          Start
        </button>

        <template v-else-if="item.status === 'In Progress'">
          <!-- <button
            class="px-3 py-1 text-sm rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
            @click="$emit('update-status', item.id, 'Pending')"
          >
            Pend
          </button> -->
          <button
            class="px-3 py-1 border border-green-500 rounded-lg bg-green-100 text-green-700 
                  hover:bg-green-500 hover:text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
            @click="$emit('update-status', item.id, 'Completed')"
          >
            Finish
          </button>
        </template>

        <template v-else-if="item.status === 'Completed'">
          <div class="px-3 py-1 text-sm rounded-full bg-green-50 text-green-600 hover:bg-green-100" >
            Completed
          </div>
        </template>

        <!-- <div class="flex items-center gap-2 text-gray-400 hover:text-gray-600 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"><path d="M4 8h.01v.01H4z"/>
              <path d="M4.5 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0M8 8h.01v.01H8z"/>
              <path d="M8.5 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0m3.49 0H12v.01h-.01z"/>
              <path d="M12.49 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0"/></g>
          </svg>
        </div> -->
      </div>

      <!-- <div class="flex justify-center items-center relative">
  <button
    v-if="item.status === 'Not Started'"
    class="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
    @click="$emit('update-status', item.id, 'In Progress')"
  >
    Start
  </button>

  <div v-else-if="item.status === 'In Progress'" class="group relative">
    <button
      class="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
    >
      Action
    </button>

    <div
      class="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-24 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-10"
    >
      <button
        class="block w-full text-left px-4 py-2 hover:bg-green-50 text-green-600"
        @click="$emit('update-status', item.id, 'Completed')"
      >
        Finish
      </button>
    </div>
  </div>

  <span v-else class="text-green-600 font-medium">Completed</span>
</div> -->


      <!-- More icon  -->
      <div class="flex justify-end items-center gap-2 text-gray-400 hover:text-gray-600 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"><path d="M4 8h.01v.01H4z"/>
            <path d="M4.5 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0M8 8h.01v.01H8z"/>
            <path d="M8.5 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0m3.49 0H12v.01h-.01z"/>
            <path d="M12.49 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0"/></g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{ tasks: any[] }>()
const emit = defineEmits(['edit-task', 'delete-task', 'update-status'])

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const dueDate = new Date(dateStr)
  const now = new Date()

  const sameYear = dueDate.getFullYear() === now.getFullYear()

  // Format options
  const options: Intl.DateTimeFormatOptions = sameYear
    ? { day: 'numeric', month: 'short' } // e.g. "6 Oct"
    : { day: 'numeric', month: 'short', year: 'numeric' } // e.g. "1 Feb 2026"

  return dueDate.toLocaleDateString('en-GB', options)
}

</script>
