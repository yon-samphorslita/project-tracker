<template>
  <transition name="fade">
    <div
      v-if="visible && event"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="handleClose"
    >
      <div
        class="relative bg-white rounded-lg shadow-lg w-80 p-4 border border-gray-200 overflow-hidden"
        :style="{
          top: `${itemTop}px`,
          left: `${itemLeft}px`,
          transform: 'translate(-50%, -50%)',
          position: 'absolute',
        }"
        @click.stop
      >
        <!-- Close Button -->
        <button
          @click="handleClose"
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <!-- Header -->
        <h3 class="font-semibold text-lg mb-3 border-b pb-2">
          {{ event.title || event.e_title || 'Untitled Event' }}
        </h3>

        <!-- Event Details -->
        <div class="space-y-2 text-sm text-gray-700">
          <!-- Start / End Date -->
          <div>
            <span class="font-medium text-gray-600">Start:</span>
            {{ formatDate(event.start || event.startDate) }}
          </div>
          <div>
            <span class="font-medium text-gray-600">End:</span>
            {{ formatDate(event.end || event.endDate) }}
          </div>

          <!-- Location -->
          <div v-if="event.location">
            <span class="font-medium text-gray-600">Location:</span>
            {{ event.location }}
          </div>

          <!-- Project -->
          <div v-if="event.project">
            <span class="font-medium text-gray-600">Project:</span>
            {{ getProjectName(event.project) }}
          </div>

          <!-- Description -->
          <div v-if="event.description || event.e_description">
            <span class="font-medium text-gray-600">Description:</span>
              {{ event.description || event.e_description }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { watch, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { useProjectStore } from '@/stores/project'

const props = defineProps({
  visible: Boolean,
  event: Object,
  itemTop: Number,
  itemLeft: Number,
})

const emit = defineEmits(['close'])
const projectStore = useProjectStore()

function formatDate(date) {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    return format(d, 'EEE dd MMM yyyy, HH:mm')
  } catch {
    return date
  }
}

function getProjectName(project) {
  if (typeof project === 'string') return project
  if (project?.p_name) return project.p_name
  const found = projectStore.projects.find((p) => p.id === project?.id)
  return found?.p_name || 'Unknown Project'
}

function handleClose() {
  emit('close')
}

// 🔒 Scroll Lock when popup opens
watch(
  () => props.visible,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
