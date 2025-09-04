<template>
  <div
    v-if="showForm"
    class="fixed top-0 left-[250px] w-[calc(100vw-250px)] h-full bg-[rgba(153,153,153,0.2)] backdrop-blur-sm flex items-center justify-center z-[1000]"
  >
    <div class="bg-white p-10 rounded-lg w-[400px] max-w-[90%] shadow-xl">
      <div class="text-2xl mb-5 text-[#2c3e50] font-semibold">
        {{ formTitle }}
      </div>

      <div class="grid grid-cols-2 gap-5">
        <div
          v-for="(field, index) in fields"
          :key="field.label"
          class="w-full"
          :class="{ 'col-span-2': field.type === 'textarea' || isSingleInput(index, field.type) }"
        >
          <label :for="field.label" class="block mb-2 text-[#34495e] font-medium">
            {{ field.label }}
          </label>

          <!-- Text input -->
          <input
            v-if="['text', 'email', 'password'].includes(field.type)"
            :id="field.label"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            :placeholder="field.placeholder"
            v-model="formData[field.model]"
            required
          />

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.label"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 min-h-[120px] resize-y focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            :placeholder="field.placeholder"
            v-model="formData[field.model]"
          />

          <!-- Date input -->
          <input
            v-else-if="field.type === 'date'"
            type="date"
            :id="field.label"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            v-model="formData[field.model]"
            required
          />

          <!-- Select input -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.label"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            v-model="formData[field.model]"
          >
            <option disabled selected>Select {{ field.label }}</option>
            <option v-for="option in field.options" :key="option.id" :value="option.id">
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-around w-full mt-5">
        <button
          class="px-5 py-3 rounded text-white text-base cursor-pointer transition-colors bg-red-500 hover:bg-red-600"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          class="px-5 py-3 rounded text-white text-base cursor-pointer transition-colors bg-blue-500 hover:bg-blue-600"
          @click="submitForm"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
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

// Sync props.modelValue with showForm
watch(
  () => props.modelValue,
  (val) => (showForm.value = val),
)
watch(showForm, (val) => emit('update:modelValue', val))

// Populate formData with initialData
watch(
  () => props.initialData,
  (data) => {
    if (!data) return
    Object.keys(data).forEach((key) => {
      formData[key] =
        key === 'startDate' || key === 'dueDate' ? data[key]?.split('T')[0] || '' : data[key]
    })
  },
  { immediate: true },
)

// Map formData to API payload
function mapPayload() {
  switch (props.endpoint) {
    case 'projects':
      return {
        p_name: formData.title,
        p_description: formData.description,
        status: formData.status || 'not started',
        priority: formData.priority || 'medium',
        start_date: formData.startDate || null,
        due_date: formData.dueDate || null,
      }
    case 'tasks':
      return {
        t_name: formData.title,
        t_description: formData.description,
        t_status: formData.status || 'not started',
        t_priority: formData.priority || 'medium',
        start_date: formData.startDate || null,
        due_date: formData.dueDate || null,
        project: props.initialData?.project_id || null,
      }
    case 'subtask':
      return { name: formData.title }
    case 'auth/user':
      return {
        first_name: formData.first_name?.trim() || '',
        last_name: formData.last_name?.trim() || '',
        email: formData.email?.trim() || '',
        password: formData.password || undefined,
        role: formData.role || 'member',
        active: formData.active !== undefined ? formData.active : true,
        img_url: formData.img_url || null,
      }
  }
}

// Submit form
async function submitForm() {
  if (submitting.value) return
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
    Object.keys(formData).forEach((key) => (formData[key] = ''))
    showForm.value = false
  } catch (error) {
    console.error('Error saving:', error.response?.data || error.message)
  } finally {
    submitting.value = false
  }
}

// Cancel form
function cancel() {
  Object.keys(formData).forEach((key) => (formData[key] = ''))
  showForm.value = false
}

// Determine if input should span two columns
function isSingleInput(index, type) {
  const next = props.fields[index + 1]
  return ['text', 'email', 'password'].includes(type) && next?.type === 'textarea'
}
</script>
