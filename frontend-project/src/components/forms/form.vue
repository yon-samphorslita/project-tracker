<template>
  <div
    v-if="showForm"
    :class="[
      fullScreen
        ? 'fixed top-0 left-[250px] w-[calc(100vw-250px)] h-full bg-[rgba(153,153,153,0.2)] backdrop-blur-sm flex items-center justify-center z-[1000]'
        : 'relative w-full',
    ]"
  >
    <div :class="[fullScreen ? 'bg-main-bg p-10 rounded-lg w-[400px] max-w-[90%] shadow-xl' : '']">
      <div class="text-2xl mb-5 text-gray-text font-semibold">
        {{ formTitle }}
      </div>

      <div class="grid grid-cols-2 gap-5">
        <div
          v-for="(field, index) in fields"
          :key="field.label"
          class="w-full"
          :class="{
            'col-span-1':
              field.model === 'first_name' ||
              field.model === 'last_name' ||
              field.model === 'location',
            'col-span-2':
              field.type === 'text' ||
              field.type === 'email' ||
              field.type === 'password' ||
              field.type === 'textarea' ||
              isSingleInput(index, field.type),
          }"
        >
          <label :for="field.label" class="block mb-2 text-gray-text font-medium">
            {{ field.label }}<span v-if="field.required" class="ml-1 text-red-500">*</span>
          </label>

          <!-- Text input -->
          <input
            v-if="['text', 'email', 'password'].includes(field.type)"
            :id="field.label"
            class="w-full px-4 py-3 border bg-main-bg rounded-lg text-base transition duration-300 focus:outline-none"
            :class="
              errors[field.model]
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            "
            :placeholder="field.placeholder"
            v-model="formData[field.model]"
          />

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.label"
            class="w-full px-4 py-3 border bg-main-bg rounded-lg text-base transition duration-300 row-span-2 resize-y focus:outline-none"
            :class="
              errors[field.model]
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            "
            :placeholder="field.placeholder"
            v-model="formData[field.model]"
          />

          <!-- Date input -->
          <input
            v-else-if="field.type === 'date' || field.type === 'datetime-local'"
            :type="field.type"
            :id="field.label"
            class="w-full px-4 py-3 border bg-main-bg rounded-lg text-base transition duration-300 focus:outline-none"
            :class="
              errors[field.model]
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            "
            v-model="formData[field.model]"
            :min="
              field.model === 'dueDate' || field.model === 'endDate'
                ? formData.startDate
                : undefined
            "
          />

          <!-- Select input -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.label"
            class="w-full px-4 py-3 border bg-main-bg rounded-lg text-base transition duration-300 focus:outline-none"
            :class="
              errors[field.model]
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            "
            v-model="formData[field.model]"
          >
            <option value="">Select {{ field.label }}</option>
            <option v-for="option in field.options" :key="option.id" :value="option.id">
              {{ option.name || option.p_name }}
            </option>
          </select>

          <!-- Error message -->
          <p v-if="errors[field.model]" class="text-red-500 text-sm mt-1">
            {{ errors[field.model] }}
          </p>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end gap-4 w-full mt-5">
        <Button class="btn-red" @click="cancel" label="Cancel" />
        <Button @click="submitForm" label="Save" class="btn" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/common-used/button.vue'
const props = defineProps({
  fullScreen: { type: Boolean, default: true },
  formTitle: { type: String, required: true },
  fields: { type: Array, required: true },
  endpoint: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'submitted'])
const formData = reactive({})
const showForm = ref(props.modelValue)
const submitting = ref(false)
const errors = reactive({})
const authStore = useAuthStore()
// Sync props.modelValue
watch(
  () => props.modelValue,
  (val) => (showForm.value = val),
)
watch(showForm, (val) => emit('update:modelValue', val))

// Populate formData
watch(
  () => props.initialData,
  (data) => {
    if (!data) return
    Object.keys(data).forEach((key) => {
      if (['startDate', 'dueDate', 'endDate'].includes(key)) {
        const dateValue = data[key] ? new Date(data[key]) : null
        if (dateValue) {
          // Detect whether this field is date or datetime-local in the field definition
          const field = props.fields.find((f) => f.model === key)
          if (field?.type === 'datetime-local') {
            formData[key] = dateValue.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"
          } else {
            formData[key] = dateValue.toISOString().slice(0, 10) // "YYYY-MM-DD"
          }
        } else {
          formData[key] = ''
        }
      } else if (key === 'user') {
        formData.user = data.user || ''
      } else {
        formData[key] = data[key]
      }
    })
  },
  { immediate: true },
)

// Validate fields
function validate() {
  let valid = true
  Object.keys(errors).forEach((k) => delete errors[k]) // reset errors

  props.fields.forEach((field) => {
    const value = formData[field.model]
    if (field.required && (!value || value.toString().trim() === '')) {
      errors[field.model] = `${field.label} is required`
      valid = false
    } else if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors[field.model] = 'Invalid email format'
        valid = false
      }
    } else if ((field.model === 'endDate' || field.model === 'dueDate') && formData.startDate) {
      if (new Date(formData[field.model]) < new Date(formData.startDate)) {
        errors[field.model] = `${field.label} cannot be before Start Date & Time`
        valid = false
      }
    }
  })
  return valid
}

// Map payload
function mapPayload() {
  switch (props.endpoint) {
    case 'projects':
      return {
        p_name: formData.title,
        p_description: formData.description,
        teamId: formData.teamId || null,
        status: formData.status || 'not started',
        priority: formData.priority || 'medium',
        start_date: formData.startDate ? new Date(formData.startDate) : null,
        due_date: formData.dueDate ? new Date(formData.dueDate) : null,
      }
    case 'tasks':
      return {
        t_name: formData.title,
        t_description: formData.description,
        t_status: formData.status || 'not started',
        t_priority: formData.priority || 'medium',
        start_date: formData.startDate ? new Date(formData.startDate) : null,
        due_date: formData.dueDate ? new Date(formData.dueDate) : null,
        projectId: formData.project || props.initialData?.project_id || null,
        userId: formData.user || authStore.user?.id || null,
      }
    case 'events':
      return {
        e_name: formData.title,
        e_description: formData.description,
        start_date: formData.startDate ? new Date(formData.startDate) : null,
        end_date: formData.endDate ? new Date(formData.endDate) : null,
        location: formData.location || '',
        projectId: formData.project || props.initialData?.project_id || null,
        userId: authStore.user?.id,
      }
    case 'subtask':
      return { name: formData.title }
    case 'users':
      return {
        first_name: formData.first_name?.trim() || '',
        last_name: formData.last_name?.trim() || '',
        email: formData.email?.trim() || '',
        role: formData.role || 'member',
        active: formData.active !== undefined ? formData.active : true,
        img_url: formData.img_url || null,
      }
  }
}

// Submit
async function submitForm() {
  if (submitting.value) return
  if (!validate()) return

  submitting.value = true
  try {
    const payload = mapPayload()
    const token = localStorage.getItem('token')
    let response

    if (props.initialData?.id) {
      response = await axios.patch(
        `http://localhost:3000/${props.endpoint}/${props.initialData.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      )
    } else {
      response = await axios.post(`http://localhost:3000/${props.endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
    }

    emit('submitted', response.data)
    Object.keys(formData).forEach((k) => (formData[k] = ''))
    showForm.value = false
  } catch (err) {
    console.error('Error saving:', err.response?.data || err.message)
  } finally {
    submitting.value = false
  }
}

// Cancel
function cancel() {
  Object.keys(formData).forEach((k) => (formData[k] = ''))
  Object.keys(errors).forEach((k) => delete errors[k])
  showForm.value = false
}

// Determine input span
function isSingleInput(index, type) {
  const next = props.fields[index + 1]
  return ['text', 'email', 'password'].includes(type) && next?.type === 'textarea'
}
</script>
