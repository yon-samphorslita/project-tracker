<template>
  <div
    v-if="showForm"
    :class="[
      fullScreen
        ? 'fixed inset-0 h-full bg-[rgba(153,153,153,0.2)] flex items-center justify-center z-[1000]'
        : 'relative w-full',
    ]"
  >
    <div :class="[fullScreen ? 'bg-main-bg p-8 rounded-xl w-[550px] shadow-xl' : '']">
      <div class="text-2xl mb-3 text-gray-text font-semibold">{{ formTitle }}</div>
      <hr />

      <div class="grid grid-cols-2 gap-5 mt-4">
        <div
          v-for="(field, index) in fields"
          :key="field.label"
          :class="{
            'col-span-2': field.type === 'textarea' || ['title', 'email'].includes(field.model),
          }"
        >
          <label :for="field.label" class="block mb-2 text-gray-text font-medium">
            {{ field.label }}
            <span v-if="field.required" class="ml-1 text-red-500">*</span>
          </label>

          <input
            v-if="['text', 'email'].includes(field.type)"
            :id="field.label"
            v-model="formData[field.model]"
            :placeholder="field.placeholder"
            :class="inputClass(field.model)"
          />

          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.label"
            v-model="formData[field.model]"
            :placeholder="field.placeholder"
            :class="inputClass(field.model) + ' resize-y h-24'"
          />

          <input
            v-else-if="field.type === 'datetime-local'"
            type="datetime-local"
            :id="field.label"
            v-model="formData[field.model]"
            :min="field.model === 'startDate' ? getTodayMin() : getMinDate(field.model)"
            :class="inputClass(field.model)"
          />

          <select
            v-else-if="field.type === 'select'"
            :id="field.label"
            v-model="formData[field.model]"
            :class="inputClass(field.model)"
          >
            <option value="">Select {{ field.label }}</option>
            <option v-for="option in field.options" :key="option.id" :value="option.id">
              {{ option.name || option.p_name }}
            </option>
          </select>

          <p v-if="errors[field.model]" class="text-red-500 text-sm mt-1">
            {{ errors[field.model] }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-4 w-full mt-6">
        <Button class="btn-red" @click="cancel" label="Cancel" />
        <Button class="btn" @click="submitForm" label="Save" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import Button from '@/components/common-used/button.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useTeamStore } from '@/stores/team'
const props = defineProps({
  fullScreen: { type: Boolean, default: true },
  formTitle: { type: String, required: true },
  fields: { type: Array, required: true },
  endpoint: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'submitted'])
const showForm = ref(props.modelValue)
const submitting = ref(false)
const formData = reactive({})
const errors = reactive({})
const authStore = useAuthStore()
const userStore = useUserStore()
const teamStore = useTeamStore()

watch(
  () => props.modelValue,
  (val) => (showForm.value = val),
)
watch(showForm, (val) => emit('update:modelValue', val))

// Initialize formData
watch(
  () => props.initialData,
  (data) => {
    if (!data) return
    props.fields.forEach((field) => {
      if (['startDate', 'dueDate', 'endDate'].includes(field.model)) {
        const dateValue = data[field.model] ? new Date(data[field.model]) : null
        formData[field.model] = dateValue ? formatLocalDatetime(dateValue) : ''
      } else {
        formData[field.model] = data[field.model] ?? ''
      }
    })
  },
  { immediate: true },
)

// Helpers
function formatLocalDatetime(date) {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getTodayMin() {
  return formatLocalDatetime(new Date())
}

function getMinDate(model) {
  if (['dueDate', 'endDate'].includes(model) && formData.startDate) {
    return formData.startDate
  }
  return undefined
}

function inputClass(model) {
  return [
    'w-full px-3 py-2 border bg-main-bg rounded-xl text-base transition duration-300 focus:outline-none',
    errors[model]
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
  ].join(' ')
}

// Validation
async function validate() {
  let valid = true
  Object.keys(errors).forEach((k) => delete errors[k])

  for (const field of props.fields) {
    const val = formData[field.model]

    // Required
    if (field.required && (!val || val.toString().trim() === '')) {
      errors[field.model] = `${field.label} is required`
      valid = false
      continue
    }

    // Email validation
    if (field.type === 'email' && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(val)) {
        errors[field.model] = 'Invalid email format'
        valid = false
        continue
      }
      // check unique email
      const isUnique = await userStore.isEmailUnique(val, props.initialData?.id)
      if (!isUnique) {
        errors[field.model] = 'Email already exists'
        valid = false
        continue
      }
    }

    // Date validation
    if (['endDate', 'dueDate'].includes(field.model) && formData.startDate) {
      if (new Date(val) < new Date(formData.startDate)) {
        errors[field.model] = `${field.label} cannot be before Start Date & Time`
        valid = false
      }
    }
  }

  return valid
}

// Map payload for API
function mapPayload() {
  const data = formData
  const userId = authStore.user?.id

  switch (props.endpoint) {
    case 'projects':
      return {
        p_name: data.title,
        p_description: data.description,
        teamId: data.teamId || null,
        priority: data.priority || 'medium',
        start_date: data.startDate ? new Date(data.startDate) : null,
        due_date: data.dueDate ? new Date(data.dueDate) : null,
      }
    case 'tasks':
      return {
        t_name: data.title,
        t_description: data.description,
        t_status: data.status || 'not started',
        t_priority: data.priority || 'medium',
        start_date: data.startDate ? new Date(data.startDate) : null,
        due_date: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.project ?? props.initialData?.project_id ?? null,
        userId: data.user || userId || null,
      }
    case 'events':
      return {
        e_name: data.title,
        e_description: data.description,
        start_date: data.startDate ? new Date(data.startDate) : null,
        end_date: data.endDate ? new Date(data.endDate) : null,
        location: data.location || '',
        projectId: data.project ?? null,
        userId,
      }
    case 'subtask':
      return { name: data.title }
    case 'users':
      return {
        first_name: data.first_name?.trim(),
        last_name: data.last_name?.trim(),
        email: data.email?.trim(),
        role: data.role || 'member',
      }
  }
}

// Submit form
async function submitForm() {
  if (submitting.value) return
  submitting.value = true

  const isValid = await validate()
  if (!isValid) {
    submitting.value = false
    return
  }

  try {
    const payload = mapPayload()
    const token = localStorage.getItem('token')
    const url = props.initialData?.id
      ? `http://localhost:3000/${props.endpoint}/${props.initialData.id}`
      : `http://localhost:3000/${props.endpoint}`
    const method = props.initialData?.id ? 'patch' : 'post'

    const response = await axios[method](url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    emit('submitted', response.data)
    cancel()
  } catch (err) {
    console.error('Error saving:', err.response?.data || err.message)
  } finally {
    submitting.value = false
  }
}

// Cancel form
function cancel() {
  Object.keys(formData).forEach((k) => (formData[k] = ''))
  Object.keys(errors).forEach((k) => delete errors[k])
  showForm.value = false
}
</script>
