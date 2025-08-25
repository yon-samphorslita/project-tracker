<template>
  <SettingsLayout>
    <h1 class="text-2xl font-bold mb-6">Account Settings</h1>

    <div class="mx-auto bg-white shadow-md rounded-2xl p-8">
      <!-- Header -->
      <div class="flex items-center justify-end mb-6">
        <button
          v-if="!isEditing"
          @click="startEditing"
          class="px-4 py-2 text-sm bg-[#C6E7FF] text-black rounded-xl hover:bg-blue-400 transition"
        >
          Edit
        </button>
      </div>

      <!-- Profile Section -->
      <div class="flex items-center gap-6 mb-8">
        <div class="relative w-24 h-24">
          <img
            :src="form.img_url || 'https://via.placeholder.com/150'"
            alt="Profile"
            class="w-24 h-24 rounded-full object-cover border"
          />
          <label
            v-if="isEditing"
            class="absolute bottom-0 right-0 bg-[#C6E7FF] text-black rounded-full p-2 cursor-pointer hover:bg-blue-400"
          >
            <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
            <span class="text-xs">
              <img src="../assets/icons/camera.svg" alt="Upload" />
            </span>
          </label>
        </div>
        <div>
          <h2 class="text-xl font-semibold">{{ form.first_name }} {{ form.last_name }}</h2>
          <p class="text-gray-500">{{ form.email }}</p>
        </div>
      </div>

      <!-- Editable Form -->
      <form class="grid gap-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-700 mb-1">First Name</label>
            <input
              v-model="form.first_name"
              :disabled="!isEditing"
              class="w-full px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200 disabled:bg-gray-100"
              type="text"
            />
          </div>
          <div>
            <label class="block text-gray-700 mb-1">Last Name</label>
            <input
              v-model="form.last_name"
              :disabled="!isEditing"
              class="w-full px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200 disabled:bg-gray-100"
              type="text"
            />
          </div>
        </div>

        <div>
          <label class="block text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            :disabled="!isEditing"
            class="w-full px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200 disabled:bg-gray-100"
            type="email"
          />
        </div>
      </form>

      <!-- Action Buttons -->
      <div v-if="isEditing" class="flex justify-end gap-3 mt-6">
        <button
          @click="cancelEditing"
          class="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          @click="saveChanges"
          class="px-4 py-2 rounded-xl bg-[#C6E7FF] text-black hover:bg-blue-400 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  </SettingsLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SettingsLayout from './settingsLayout.vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  img_url: '',
})

const isEditing = ref(false)

// 🔹 Fetch authenticated user profile
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/auth/profile', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    form.value = {
      first_name: res.data.first_name,
      last_name: res.data.last_name,
      email: res.data.email,
      password: '',
      img_url: res.data.img_url || '',
    }

    // update store user
    authStore.user = res.data
  } catch (err) {
    console.error('Failed to fetch user', err)
  }
})

// Toggle editing
function startEditing() {
  isEditing.value = true
}
function cancelEditing() {
  isEditing.value = false
}
async function saveChanges() {
  try {
    const res = await axios.patch('http://localhost:3000/auth/update', form.value, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    alert('Profile updated successfully!')
    authStore.user = res.data
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update profile', err)
    alert(err.response?.data?.message || 'Update failed')
  }
}

// Handle profile image upload
function handleImageUpload(e) {
  const file = e.target.files[0]
  if (file) {
    form.value.img_url = URL.createObjectURL(file)
    // 🔹 In real app, upload image to backend here
  }
}
</script>
