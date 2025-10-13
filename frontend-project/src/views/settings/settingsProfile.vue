<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Account Settings</h1>

    <div class="mx-auto bg-white shadow-md rounded-2xl p-8">
      <!-- Profile Section -->
      <div class="flex items-center justify-between gap-6 mb-8">
        <div class="flex items-center gap-4">
          <div class="relative w-24 h-24">
            <img
              :src="form.img_url || 'https://via.placeholder.com/150'"
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover border"
            />
            <!-- Upload button only if editing -->
            <label
              v-if="isEditing"
              class="absolute bottom-0 right-0 bg-[#C6E7FF] text-black rounded-full p-2 cursor-pointer hover:bg-blue-400"
            >
              <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
              <span class="text-xs">
                <img src="../../assets/icons/camera.svg" alt="Upload" />
              </span>
            </label>
          </div>
          <div>
            <h2 class="text-xl font-semibold">{{ form.first_name }} {{ form.last_name }}</h2>
            <p class="text-gray-500">{{ form.email }}</p>
          </div>
        </div>
        <!-- Edit button -->
        <Button
          v-if="!isEditing"
          @click="startEditing"
          label="Edit"
          btn-color="#C6E7FF"
          btntext="black"
        />
      </div>

      <!-- Read-only info (when not editing) -->
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

      <!-- Editable Form (when editing) -->
      <form v-else class="grid gap-6" @submit.prevent>
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-700 mb-1">First Name</label>
            <input
              v-model="form.first_name"
              class="w-full px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200"
              type="text"
            />
          </div>
          <div>
            <label class="block text-gray-700 mb-1">Last Name</label>
            <input
              v-model="form.last_name"
              class="w-full px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200"
              type="text"
            />
          </div>
        </div>

        <div>
          <label class="block text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            disabled
            class="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
            type="email"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 mt-6">
          <Button @click="cancelEditing" label="Cancel" btn-color="#c70707" btntext="white" />
          <Button label="Save Changes" @click="saveChanges" btn-color="#c6e7ff" btntext="black" />
        </div>
      </form>
    </div>

    <div class="mt-4">
      <Button @click="logout" label="Logout" btn-color="#c70707" btntext="white" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Button from '@/components/button.vue'
const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  img_url: '',
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isEditing = ref(false)

onMounted(async () => {
  const profile = await authStore.fetchProfile()
  if (profile) {
    form.value = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      img_url: profile.img_url || '',
    }
  }
})

function startEditing() {
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function saveChanges() {
  try {
    const { first_name, last_name, img_url } = form.value
    await authStore.updateProfile({ first_name, last_name, img_url })
    alert('Profile updated successfully!')
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update profile', err)
    alert(err.response?.data?.message || 'Update failed')
  }
}

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  // Show a local preview immediately
  form.value.img_url = URL.createObjectURL(file)

  try {
    const formData = new FormData()
    formData.append('file', file)

    // Upload to your backend NestJS MinIO endpoint
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    // Replace local preview with the real public URL
    form.value.img_url = data.url
  } catch (err) {
    console.error('Failed to upload image', err)
    alert('Image upload failed')
  }
}

async function logout() {
  try {
    await authStore.logout() // wait for backend logout and clearing state
  } catch (err) {
    console.error('Logout failed', err)
  } finally {
    router.push('/login')
  }
}
</script>
