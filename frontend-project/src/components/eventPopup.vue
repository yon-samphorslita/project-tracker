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
        <button @click="handleClose" class="absolute top-2 right-2 hover:text-gray-text">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 20 20"
            :style="{ fill: 'var(--main-text)' }"
          >
            <path
              d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15l-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152l2.758 3.15a1.2 1.2 0 0 1 0 1.698"
            />
          </svg>
        </button>

        <!-- Header -->
        <div class="flex items-center justify-between mb-3 border-b pb-2 mr-4">
          <h3 class="font-semibold text-lg">
            {{
              isEditing ? 'Edit Event' : eventData.title || eventData.e_title || 'Untitled Event'
            }}
          </h3>

          <!-- Edit/Delete Icons -->
          <div v-if="!isEditing" class="flex items-center gap-3">
            <button @click="isEditing = true" title="Edit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                :style="{ fill: 'var(--graysvg-text)' }"
              >
                <path
                  d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C20.8027 6.94749 20.8762 6.8376 20.9264 6.71663C20.9766 6.59565 21.0024 6.46597 21.0024 6.335C21.0024 6.20403 20.9766 6.07435 20.9264 5.95338C20.8762 5.83241 20.8027 5.72252 20.71 5.63L18.37 3.29C18.2775 3.1973 18.1676 3.12375 18.0466 3.07357C17.9257 3.02339 17.796 2.99756 17.665 2.99756C17.534 2.99756 17.4043 3.02339 17.2834 3.07357C17.1624 3.12375 17.0525 3.1973 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
                />
              </svg>
            </button>
            <button @click="handleDelete" title="Delete">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                :style="{ fill: 'var(--graysvg-text)' }"
              >
                <path
                  fill-rule="evenodd"
                  d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"
                />
              </svg>
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
            <span class="font-medium text-gray-text">Location:</span>
            {{ eventData.location }}
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

          <!-- Save / Cancel Buttons -->
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

// Watch for selected event
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
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Format dates
function formatDate(date) {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    return format(d, 'EEE dd MMM yyyy, HH:mm')
  } catch {
    return date
  }
}

// Project name
function getProjectName(project) {
  if (typeof project === 'string') return project
  if (project?.p_name) return project.p_name
  const found = projectStore.projects.find((p) => p.id === project?.id)
  return found?.p_name || 'Unknown Project'
}

// Close popup
function handleClose() {
  emit('close')
}

// Delete event
async function handleDelete() {
  if (!eventData.value?.id) return
  if (confirm('Are you sure you want to delete this event?')) {
    await eventStore.deleteEvent(eventData.value.id)
    handleClose()
  }
}

// Save edits
async function handleSave() {
  const updated = await eventStore.updateEvent(eventData.value.id, editableData.value)
  if (updated) {
    eventData.value = { ...updated }
    isEditing.value = false
  }
}

// Cancel edit
function cancelEdit() {
  editableData.value = { ...eventData.value }
  isEditing.value = false
}

// 🔒 Scroll lock
watch(
  () => props.visible,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  },
)
onUnmounted(() => (document.body.style.overflow = ''))
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
