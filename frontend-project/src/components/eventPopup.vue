<template>
  <transition name="fade">
    <div
      v-if="visible && eventData"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="handleClose"
    >
      <div
        class="relative bg-main-bg rounded-lg shadow-lg w-80 p-4 border border-gray-200 overflow-hidden"
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
          class="absolute top-2 right-2 hover:text-[var(--gray-text)] text-[var(--graysvg-text)]"
        >
          <Close />
        </button>

        <!-- Header -->
        <div class="flex items-center justify-between mb-3 border-b pb-2 mr-4">
          <h3 class="font-semibold text-lg">
            {{
              isEditing ? 'Edit Event' : eventData.title || eventData.e_title || 'Untitled Event'
            }}
          </h3>

          <div v-if="!isEditing" class="flex items-center">
            <button @click="isEditing = true" title="Edit">
              <Edit class="icon-theme w-6 h-6" />
            </button>
            <button @click="handleDelete" title="Delete">
              <Delete class="icon-theme" />
            </button>
          </div>
        </div>

        <!-- VIEW MODE -->
        <div v-if="!isEditing" class="space-y-2 text-sm text-gray-text">
          <div>
            <span class="font-medium text-gray-text">Start:</span>
            {{ formatDate(eventData.start || eventData.startDate) }}
          </div>
          <div>
            <span class="font-medium text-gray-text">End:</span>
            {{ formatDate(eventData.end || eventData.endDate) }}
          </div>
          <div v-if="eventData.location">
            <span class="font-medium text-gray-text">Location:</span> {{ eventData.location }}
          </div>
          <div v-if="eventData.project">
            <span class="font-medium text-gray-text">Project:</span>
            {{ getProjectName(eventData.project) }}
          </div>
          <div v-if="eventData.description || eventData.e_description">
            <span class="font-medium text-gray-text">Description:</span>
            {{ eventData.description || eventData.e_description }}
          </div>
        </div>

        <!-- EDIT MODE -->
        <div v-else class="space-y-3 text-sm text-gray-text">
          <div>
            <label class="font-medium text-gray-text block mb-1">Title</label>
            <input
              v-model="editableData.title"
              type="text"
              class="w-full bg-main-bg border rounded-md px-2 py-1 focus:ring focus:ring-blue-200"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="font-medium text-gray-text block mb-1">Start</label>
              <input
                v-model="editableData.start"
                type="datetime-local"
                class="w-full border bg-main-bg rounded-md px-2 py-1 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label class="font-medium text-gray-text block mb-1">End</label>
              <input
                v-model="editableData.end"
                type="datetime-local"
                class="w-full border bg-main-bg rounded-md px-2 py-1 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label class="font-medium text-gray-text block mb-1">Location</label>
            <input
              v-model="editableData.location"
              type="text"
              class="w-full border bg-main-bg rounded-md px-2 py-1 focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label class="font-medium text-gray-text block mb-1">Description</label>
            <textarea
              v-model="editableData.description"
              rows="2"
              class="w-full border bg-main-bg rounded-md px-2 py-1 focus:ring focus:ring-blue-200 resize-none"
            ></textarea>
          </div>

          <div class="flex justify-end mt-4 gap-3 border-t pt-3">
            <button
              @click="cancelEdit"
              class="px-3 py-1.5 text-sm font-medium btn-red rounded-md transition"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              class="px-3 py-1.5 text-sm font-medium btn rounded-md transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { useProjectStore } from '@/stores/project'
import { useEventStore } from '@/stores/event'
import Close from '@/assets/icons/cross.svg'
import Edit from '@/assets/icons/edit.svg'
import Delete from '@/assets/icons/delete.svg'

const props = defineProps({
  visible: Boolean,
  event: Object,
  itemTop: Number,
  itemLeft: Number,
})

const emit = defineEmits(['close'])
const projectStore = useProjectStore()
const eventStore = useEventStore()

const isEditing = ref(false)
const eventData = ref(null)
const editableData = ref({})

watch(
  () => props.event,
  (val) => {
    if (val) {
      eventData.value = { ...val }
      editableData.value = {
        ...val,
        start: toInputDatetime(val.start || val.startDate),
        end: toInputDatetime(val.end || val.endDate),
      }
      isEditing.value = false
    }
  },
  { immediate: true },
)

function toInputDatetime(date) {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(date) {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), 'EEE dd MMM yyyy, HH:mm')
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

async function handleDelete() {
  if (!eventData.value?.id) return
  if (confirm('Are you sure you want to delete this event?')) {
    await eventStore.deleteEvent(eventData.value.id)
    handleClose()
  }
}

async function handleSave() {
  const updated = await eventStore.updateEvent(eventData.value.id, editableData.value)
  if (updated) {
    eventData.value = { ...updated }
    isEditing.value = false
  }
}

function cancelEdit() {
  editableData.value = { ...eventData.value }
  isEditing.value = false
}

// Scroll lock
watch(
  () => props.visible,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  },
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
