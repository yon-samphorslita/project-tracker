<template>
  <div
    class="w-1/3 h-auto flex-shrink-0 overflow-y-auto top-[170px] rounded-md shadow-lg bg-blue-bg p-4"
  >
    <div class="sticky top-0 flex justify-between items-center my-5 bg-blue-bg z-10">
      <!-- kanban header  -->
      <div class="flex gap-2 items-center">
        <div class="w-2 h-8 rounded-r-md" :style="{ background: statusColor }"></div>
        <div class="text-[var(--darkgray-bg)] text-base md:text-lg font-medium">
          {{ kanbanTaskStatus }}
        </div>
      </div>

      <div class="flex items-center gap-2 md:gap-3">
        <div
          class="w-5 h-5 flex justify-center items-center rounded-full text-[var(--white-text)] text-xs"
          :style="{ background: statusColor }"
        >
          {{ kanbanTaskNum }}
        </div>
        <More class="w-5 h-5 md:w-6 md:h-6 icon-theme" />
      </div>
    </div>

    <!-- tasks  -->
    <div class="w-full h-[70vh] overflow-y-auto space-y-5">
      <div
        v-for="kanban in kanbantasks"
        :key="kanban.id"
        class="bg-main-bg border border-[var(--main-border)] rounded-md shadow-md p-3 flex flex-col space-y-2"
      >
        <!-- task header  -->
        <div class="flex justify-between items-center">
          <div class="font-medium text-gray-text truncate">
            {{ kanban.title }}
          </div>
          <div class="flex justify-between gap-1 md:gap-2">
            <button @click="$emit('editTask', kanban)" title="Edit">
              <Edit
                v-if="userRole === 'admin' || userRole === 'project_manager'"
                class="w-5 h-5 icon-theme"
              />
            </button>
            <More class="w-5 h-5 icon-theme" />
          </div>
        </div>

        <!-- task description  -->
        <div class="text-sub-text text-sm">
          {{ kanban.description }}
        </div>

        <!-- task footer  -->
        <div class="flex justify-between items-center">
          <Status :priority="kanban.priority" />
          <div class="w-8 h-8 rounded-full overflow-hidden">
            <img
              :src="kanban.user?.img_url"
              alt="Profile Image"
              class="object-cover w-full h-full"
            />
          </div>
        </div>
        <hr class="my-1 border-gray-300" />
        <div class="flex items-center text-sm text-gray-text">
          <div class="font-semibold mr-2">Due:</div>
          <div>{{ formatDate(kanban.due_date) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Status from './status.vue'
import More from '@/assets/icons/more.svg'
import Edit from '@/assets/icons/edit.svg'
const props = defineProps({
  kanbantasks: {
    type: Array,
    required: true,
  },
  kanbanTaskStatus: {
    type: String,
    required: true,
  },
  kanbanTaskNum: {
    type: Number,
    required: true,
  },
  formatDate: {
    type: Function,
  },
})

const statusColor = computed(() => {
  switch (props.kanbanTaskStatus.toLowerCase()) {
    case 'not started':
      return 'red'
    case 'in progress':
      return 'orange'
    case 'completed':
      return 'green'
    default:
      return '#9E9E9E'
  }
})
</script>

<style></style>
