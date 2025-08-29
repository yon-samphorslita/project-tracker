<template>
  <div v-if="showForm" class="overlay">
    <div class="form-container">
      <div class="formTitle">{{ formTitle }}</div>
      <div class="field-grid">
        <div
          v-for="field in fields"
          :key="field.label"
          :class="[
            'form-group',
            field.type === 'textarea' || field.type === 'text' ? 'full-row' : '',
          ]"
        >
          <label :for="field.label">{{ field.label }}</label>

          <!-- Text, Email, Password -->
          <input
            v-if="['text', 'email', 'password'].includes(field.type)"
            :type="field.type"
            :id="field.label"
            class="form-control"
            :placeholder="field.placeholder"
            v-model="formData[field.model]"
            required
          />

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.label"
            class="form-control"
            :placeholder="field.placeholder"
            v-model="formData[field.model]"
          >
          </textarea>

          <!-- Date -->
          <input
            v-else-if="field.type === 'date'"
            type="date"
            :id="field.label"
            class="form-control"
            v-model="formData[field.model]"
            required
          />

          <!-- Select -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.label"
            class="form-control"
            v-model="formData[field.model]"
          >
            <option disabled selected>Select {{ field.label }}</option>
            <option v-for="option in field.options" :key="option.id" :value="option.id">
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: end; gap: 10px; width: 100%; margin-top: 20px">
        <button class="form-btn" style="background: red" @click="cancel">Cancel</button>
        <button class="form-btn" style="background: blue" @click="submitForm">Submit</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { defineProps, defineEmits, reactive } from 'vue'
import axios from 'axios'

const props = defineProps({
  formTitle: { type: String, required: true },
  fields: { type: Array, required: true },
  endpoint: { type: String, required: true },
  modelValue: { type: Boolean, required: false },
  initialData: { type: Object, required: false, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue', 'submitted'])
const formData = reactive({})
const showForm = ref(props.modelValue || false)

watch(
  () => props.modelValue,
  (newVal) => {
    showForm.value = newVal
  },
)
watch(showForm, (val) => emit('update:modelValue', val))
watch(
  () => props.initialData,
  (data) => {
    if (data) Object.keys(data).forEach((key) => (formData[key] = data[key]))
  },
  { immediate: true },
)
function mapPayload() {
  if (props.endpoint === 'projects') {
    return {
      p_name: formData.title,
      p_description: formData.description,
      status: formData.status || 'not started',
      priority: formData.priority,
      start_date: formData.startDate || null,
      due_date: formData.dueDate || null,
    }
  } else if (props.endpoint === 'tasks') {
    return {
      t_name: formData.title,
      t_description: formData.description,
      t_status: formData.status || 'not started',
      t_priority: formData.priority || 'medium',
      start_date: formData.startDate || null,
      due_date: formData.dueDate || null,
    }
  } else if (props.endpoint === 'subtask') {
    return {
      name: formData.title,
    }
  } else if (props.endpoint === 'auth/user') {
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

// handle submit
async function submitForm() {
  try {
    const payload = mapPayload()
    const token = localStorage.getItem('token')
    let response

    if (props.initialData?.id) {
      // Update existing user
      response = await axios.patch(
        `http://localhost:3000/${props.endpoint}/${props.initialData.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      )
    } else {
      // Create new user
      response = await axios.post(`http://localhost:3000/${props.endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
    }

    emit('submitted', response.data.user || response.data)
    Object.keys(formData).forEach((key) => (formData[key] = ''))
    showForm.value = false
  } catch (error) {
    console.error('Error saving user:', error.response?.data || error.message)
  }
}

// handle cancel
function cancel() {
  Object.keys(formData).forEach((key) => (formData[key] = ''))
  showForm.value = false
  console.log('Form cancelled')
}
</script>

<style>
.overlay {
  position: fixed;
  top: 0;
  left: 250px;
  width: calc(100vw - 250px);
  height: 100%;
  background: rgba(153, 153, 153, 0.2);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.form-container {
  height: fit-content;
  background: white;
  padding: 40px;
  border-radius: 10px;
  /* width: 400px; */
  max-width: 90%;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
}

.formTitle {
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 600;
}

.form-group {
  /* margin-bottom: 20px; */
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #34495e;
  font-weight: 500;
  width: 100%;
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dce1e6;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s;
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-btn {
  padding: 15px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.form-group.full-row {
  grid-column: span 2;
}
</style>
