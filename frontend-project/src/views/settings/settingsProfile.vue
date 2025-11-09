<template>
  <div>
    <div class="flex gap-2">
      <Back
        class="mr-4 w-8 h-8 text-[var(--graysvg-text)] opacity-80 hover:opacity-100 cursor-pointer"
        @click="goBack"
      />
      <h1 class="text-2xl font-bold mb-6">Account Settings</h1>
    </div>
    <div class="mx-auto bg-main-bg shadow-md rounded-2xl p-8">
      <!-- Profile Section -->
      <div class="flex items-center justify-between gap-6 mb-8">
        <div class="flex items-center gap-4">
          <!-- Profile Image -->
          <div class="relative w-24 h-24">
            <img
              :src="form.img_url || fallbackImg"
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover border"
            />
            <label
              v-if="isEditing"
              class="absolute bottom-0 right-0 btn rounded-full p-2 cursor-pointer"
            >
              <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
              <Camera />
            </label>
          </div>

          <!-- Name & Email -->
          <div>
            <h2 class="text-xl font-semibold">{{ form.first_name }} {{ form.last_name }}</h2>
            <p class="text-sub-text">{{ form.email }}</p>
          </div>
        </div>

        <!-- Edit Button -->
        <Button
          v-if="!isEditing"
          @click="startEditing"
          label="Edit"
          btn-color="var(--blue-bg)"
          btntext="var(--main-text)"
        />
      </div>

      <!-- Read-only Information -->
      <div v-if="!isEditing" class="grid gap-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-600 text-sm">First Name</label>
            <p class="px-4 py-2">{{ form.first_name }}</p>
          </div>
          <div>
            <label class="block text-gray-600 text-sm">Last Name</label>
            <p class="px-4 py-2">{{ form.last_name }}</p>
          </div>
        </div>
        <div>
          <label class="block text-gray-600 text-sm">Email</label>
          <p class="px-4 py-2">{{ form.email }}</p>
        </div>
      </div>

      <!-- Editable Form -->
      <form v-else class="grid gap-6" @submit.prevent="saveChanges">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-text mb-1">First Name</label>
            <input
              v-model="form.first_name"
              type="text"
              class="w-full px-4 py-2 border bg-main-bg rounded-xl focus:ring focus:ring-blue-200"
            />
            <p v-if="errors.first_name" class="text-red-500 text-sm mt-1">
              {{ errors.first_name }}
            </p>
          </div>
          <div>
            <label class="block text-gray-text mb-1">Last Name</label>
            <input
              v-model="form.last_name"
              type="text"
              class="w-full px-4 py-2 border bg-main-bg rounded-xl focus:ring focus:ring-blue-200"
            />
            <p v-if="errors.last_name" class="text-red-500 text-sm mt-1">{{ errors.last_name }}</p>
          </div>
        </div>

        <div>
          <label class="block text-gray-text mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            disabled
            class="w-full px-4 py-2 border bg-gray-100 rounded-xl cursor-not-allowed"
          />
        </div>

        <div v-if="errors.general" class="text-red-500 text-sm mt-2">{{ errors.general }}</div>

        <div class="flex justify-end gap-3 mt-6">
          <Button @click="cancelEditing" label="Cancel" class="btn-red" />
          <Button label="Save Changes" btn-color="var(--blue-bg)" btntext="var(--black-text)" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/common-used/button.vue'
import Camera from '@/assets/icons/camera.svg'
import Back from '@/assets/icons/back.svg'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const fallbackImg = '/assets/profile.jpg'

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  img_url: '',
})

const isEditing = ref(false)

const goBack = () => {
  router.push('/settings')
}

// Validation errors
const errors = ref({
  first_name: '',
  last_name: '',
  general: '',
})

onMounted(async () => {
  try {
    const profile = await authStore.fetchProfile()
    if (profile) {
      form.value = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        img_url: profile.img_url || fallbackImg,
      }
    }
  } catch (err) {
    console.error('Failed to fetch profile', err)
    errors.value.general = 'Failed to load profile'
  }
})

function startEditing() {
  isEditing.value = true
  clearErrors()
}

function cancelEditing() {
  isEditing.value = false
  clearErrors()
}

function clearErrors() {
  errors.value = { first_name: '', last_name: '', general: '' }
}

function validateForm() {
  let valid = true
  clearErrors()
  if (!form.value.first_name.trim()) {
    errors.value.first_name = 'First name is required'
    valid = false
  }
  if (!form.value.last_name.trim()) {
    errors.value.last_name = 'Last name is required'
    valid = false
  }
  return valid
}

async function saveChanges() {
  if (!validateForm()) return
  try {
    const { first_name, last_name, img_url } = form.value
    await authStore.updateProfile({ first_name, last_name, img_url })
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update profile', err)
    errors.value.general = err.response?.data?.message || 'Update failed'
  }
}

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  form.value.img_url = URL.createObjectURL(file)

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await response.json()
    const uploadedUrl = `http://localhost:3000/upload/images/${data.filename}`
    form.value.img_url = uploadedUrl
    await authStore.updateProfile({ img_url: uploadedUrl })
  } catch (err) {
    console.error('Failed to upload image', err)
    errors.value.general = 'Image upload failed'
  }
}
</script>
