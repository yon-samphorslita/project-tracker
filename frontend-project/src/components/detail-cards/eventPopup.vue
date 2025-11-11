<template>
  <transition name="fade">
    <div
      v-if="visible && eventData"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="handleClose"
    >
      <div
        class="relative bg-main-bg rounded-lg shadow-lg w-80 p-4 border border-[var(--sub-text)] overflow-hidden"
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
          <h3 class="font-semibold text-lg">{{ popupTitle }}</h3>
          <div v-if="!isEditing && canEditOrDelete" class="flex items-center gap-2">
            <button v-if="canEditOrDelete" @click="startEditing" title="Edit">
              <Edit class="icon-theme w-6 h-6" />
            </button>
            <button v-if="canDelete" @click="handleDelete" title="Delete">
              <Delete class="icon-theme" />
            </button>
          </div>
        </div>

        <!-- VIEW MODE -->
        <div v-if="!isEditing" class="space-y-2 text-sm text-[var(--graysvg-text)]">
          <div>
            <span class="font-medium text-[var(--gray-text)]">Start:</span>
            {{ formatDisplayDate(eventData.start_date || eventData.start) }}
          </div>
          <div>
            <span class="font-medium text-[var(--gray-text)]">End:</span>
            {{ formatDisplayDate(eventData.end_date || eventData.end) }}
          </div>
          <div v-if="eventData.location">
            <span class="font-medium text-[var(--gray-text)]">Location:</span>
            {{ eventData.location }}
          </div>
          <div v-if="eventData.project">
            <span class="font-medium text-[var(--gray-text)]">Project:</span>
            {{ getProjectName(eventData.project) }}
          </div>
          <div v-if="eventData.e_description || eventData.t_description || eventData.description">
            <span class="font-medium text-[var(--gray-text)]">Description:</span>
            {{ eventData.e_description || eventData.t_description || eventData.description }}
          </div>
        </div>

        <!-- EDIT MODE -->
        <div v-else class="space-y-3 text-sm text-[var(--graysvg-text)]">
          <div v-for="field in currentFields" :key="field.model">
            <label class="font-medium text-[var(--gray-text)] block mb-1">{{ field.label }}</label>

            <input
              v-if="field.type === 'text' || field.type === 'datetime-local'"
              :type="field.type"
              v-model="editableData[field.model]"
              :placeholder="field.placeholder || ''"
              class="w-full border rounded-md px-2 py-1 focus:ring focus:ring-[var(--blue-bg)]"
            />

            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="editableData[field.model]"
              rows="2"
              :placeholder="field.placeholder || ''"
              class="w-full border rounded-md px-2 py-1 focus:ring focus:ring-[var(--blue-bg)] resize-none"
            ></textarea>
          </div>

          <div v-if="validationErrors.length" class="p-2 bg-red-50 text-red-600 text-xs rounded">
            <div v-for="error in validationErrors" :key="error" class="mb-1">{{ error }}</div>
          </div>

          <div v-if="canEditOrDelete" class="flex justify-end mt-4 gap-3 border-t pt-3">
            <button
              @click="handleSave"
              :disabled="saving"
              class="px-3 py-1.5 text-sm font-medium text-white-text btn disabled:bg-gray-400 rounded-md transition"
            >
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button
              @click="cancelEdit"
              class="px-3 py-1.5 text-sm font-medium btn-red rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { useProjectStore } from '@/stores/project'
import { useEventStore } from '@/stores/event'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'
import Close from '@/assets/icons/cross.svg'
import Edit from '@/assets/icons/edit.svg'
import Delete from '@/assets/icons/delete.svg'

const props = defineProps({ visible: Boolean, event: Object, itemTop: Number, itemLeft: Number })
const emit = defineEmits(['close'])

const projectStore = useProjectStore()
const eventStore = useEventStore()
const taskStore = useTaskStore()

const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role || '')
const isEditing = ref(false)
const eventData = ref(null)
const editableData = ref({})
const saving = ref(false)

// Fields
const eventFields = [
  { type: 'text', label: 'Event Title', model: 'e_name', placeholder: 'Enter event title' },
  { type: 'datetime-local', label: 'Start Date & Time', model: 'start_date' },
  { type: 'datetime-local', label: 'End Date & Time', model: 'end_date' },
  { type: 'text', label: 'Location', model: 'location', placeholder: 'Enter location' },
  {
    type: 'textarea',
    label: 'Description',
    model: 'e_description',
    placeholder: 'Enter description',
  },
]
const taskFields = [
  { type: 'text', label: 'Task Name', model: 't_name', placeholder: 'Enter task name' },
  {
    type: 'textarea',
    label: 'Description',
    model: 't_description',
    placeholder: 'Enter description',
  },
  { type: 'datetime-local', label: 'Start Date', model: 'start_date' },
  { type: 'datetime-local', label: 'Due Date', model: 'due_date' },
]

const currentFields = computed(() => (eventData.value?.type === 'task' ? taskFields : eventFields))
const popupTitle = computed(() =>
  !isEditing.value
    ? eventData.value?.title || 'Untitled Event'
    : eventData.value?.type === 'task'
      ? 'Edit Task'
      : 'Edit Event',
)
const validationErrors = computed(() => {
  const errors = []
  if (!eventData.value) return errors

  if (eventData.value.type === 'event') {
    if (!editableData.value.e_name?.trim()) errors.push('Title is required')
    if (!editableData.value.start_date) errors.push('Start date is required')
    if (!editableData.value.end_date) errors.push('End date is required')
    if (
      editableData.value.start_date &&
      editableData.value.end_date &&
      new Date(editableData.value.end_date) <= new Date(editableData.value.start_date)
    )
      errors.push('End date must be after start date')
  } else if (eventData.value.type === 'task') {
    if (!editableData.value.t_name?.trim()) errors.push('Task Name is required')
    if (!editableData.value.start_date) errors.push('Start date is required')
    if (!editableData.value.due_date) errors.push('Due date is required')
    if (
      editableData.value.start_date &&
      editableData.value.due_date &&
      new Date(editableData.value.due_date) <= new Date(editableData.value.start_date)
    )
      errors.push('Due date must be after start date')
  }
  return errors
})

// Watch for prop changes
watch(
  () => props.event,
  (val) => {
    if (val) {
      eventData.value = {
        ...val,
        type: val.t_name ? 'task' : 'event',
        title: val.e_name || val.t_name || val.title || 'Untitled Event',
        description: val.e_description || val.t_description || val.description || '',
        start: val.start_date || val.start || val.start_date,
        end: val.end_date || val.end || val.due_date,
      }
      resetEditableData()
      isEditing.value = false
      saving.value = false
    }
  },
  { immediate: true },
)
watch(
  () => eventData.value,
  (val) => {
    console.log('Event type:', val?.type, 'Role:', userRole.value)
  },
)

watch(
  () => props.visible,
  (val) => (document.body.style.overflow = val ? 'hidden' : ''),
)

// Reset editable data
function resetEditableData() {
  if (!eventData.value) return
  const data = {}
  currentFields.value.forEach((field) => {
    if (eventData.value.type === 'event') {
      data[field.model] =
        field.model === 'e_name'
          ? eventData.value.e_name
          : field.model === 'e_description'
            ? eventData.value.e_description
            : field.model === 'start_date'
              ? formatDateForInput(eventData.value.start_date)
              : field.model === 'end_date'
                ? formatDateForInput(eventData.value.end_date)
                : field.model === 'location'
                  ? eventData.value.location || ''
                  : eventData.value[field.model] || ''
    } else if (eventData.value.type === 'task') {
      data[field.model] =
        field.model === 't_name'
          ? eventData.value.t_name
          : field.model === 't_description'
            ? eventData.value.t_description
            : field.model === 'start_date'
              ? formatDateForInput(eventData.value.start_date)
              : field.model === 'due_date'
                ? formatDateForInput(eventData.value.due_date)
                : eventData.value[field.model] || ''
    }
  })
  data.id = eventData.value.id
  editableData.value = data
}

// Date formatting
function formatDisplayDate(date) {
  if (!date) return 'N/A'
  try {
    return format(
      typeof date === 'string' ? parseISO(date) : new Date(date),
      'EEE dd MMM yyyy, HH:mm',
    )
  } catch {
    return 'Invalid Date'
  }
}
function formatDateForInput(date) {
  if (!date) return ''
  try {
    return format(typeof date === 'string' ? parseISO(date) : new Date(date), "yyyy-MM-dd'T'HH:mm")
  } catch {
    return ''
  }
}
// True if user can modify this event/task
const canEditOrDelete = computed(() => {
  if (!eventData.value) return false

  // Members: can only modify events
  if (userRole.value === 'member') {
    return eventData.value.type === 'event'
  }

  // Admins and PMs: can modify everything
  return ['admin', 'project_manager'].includes(userRole.value)
})

// True if user can delete this item
const canDelete = computed(() => canEditOrDelete.value)

// Editing
function startEditing() {
  resetEditableData()
  isEditing.value = true
}
function cancelEdit() {
  resetEditableData()
  isEditing.value = false
}
function handleClose() {
  emit('close')
}

// Helpers
function getProjectName(project) {
  if (!project) return 'Unknown Project'
  if (typeof project === 'string') return project
  if (project.p_name) return project.p_name
  const found = projectStore.projects.find((p) => p.id === project.id)
  return found?.p_name || 'Unknown Project'
}

// Delete
async function handleDelete() {
  if (!eventData.value?.id || !confirm('Are you sure you want to delete this item?')) return
  try {
    if (eventData.value.type === 'event') await eventStore.deleteEvent(eventData.value.id)
    else if (eventData.value.type === 'task') await taskStore.deleteTask(eventData.value.id)
    handleClose()
  } catch {
    alert('Failed to delete item.')
  }
}

// Save
async function handleSave() {
  if (validationErrors.value.length) return
  saving.value = true
  try {
    let updatedItem
    if (eventData.value.type === 'event') {
      updatedItem = await eventStore.updateEvent(eventData.value.id, {
        e_name: editableData.value.e_name?.trim(),
        e_description: editableData.value.e_description?.trim(),
        start_date: editableData.value.start_date
          ? new Date(editableData.value.start_date).toISOString()
          : null,
        end_date: editableData.value.end_date
          ? new Date(editableData.value.end_date).toISOString()
          : null,
        location: editableData.value.location?.trim() || null,
      })
      eventData.value = {
        ...updatedItem,
        type: 'event',
        title: updatedItem.e_name,
        description: updatedItem.e_description,
      }
    } else if (eventData.value.type === 'task') {
      updatedItem = await taskStore.updateTask(eventData.value.id, {
        t_name: editableData.value.t_name?.trim(),
        t_description: editableData.value.t_description?.trim(),
        start_date: editableData.value.start_date
          ? new Date(editableData.value.start_date).toISOString()
          : null,
        due_date: editableData.value.due_date
          ? new Date(editableData.value.due_date).toISOString()
          : null,
      })
      eventData.value = {
        ...updatedItem,
        type: 'task',
        title: updatedItem.t_name,
        description: updatedItem.t_description,
        end: updatedItem.due_date,
      }
    }
    isEditing.value = false
  } catch (err) {
    console.error(err)
    alert('Failed to save.')
  } finally {
    saving.value = false
  }
}
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
