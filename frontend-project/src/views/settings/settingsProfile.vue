<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Account Settings</h1>

    <div class="mx-auto bg-main-bg shadow-md rounded-2xl p-8">
      <!-- Profile Section -->
      <div class="flex items-center justify-between gap-6 mb-8">
        <div class="flex items-center gap-4">
          <div class="relative w-24 h-24">
            <img
              :src="form.img_url"
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover border"
            />
            <label
              v-if="isEditing"
              class="absolute bottom-0 right-0 btn rounded-full p-2 cursor-pointer"
            >
              <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m8 3a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 2a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3"
                />
              </svg>
            </label>
          </div>
          <div>
            <h2 class="text-xl font-semibold">{{ form.first_name }} {{ form.last_name }}</h2>
            <p class="text-sub-text">{{ form.email }}</p>
          </div>
        </div>
        <Button
          v-if="!isEditing"
          @click="startEditing"
          label="Edit"
          btn-color="var(--blue-bg)"
          btntext="var(--main-text)"
        />
      </div>

      <!-- Read-only info -->
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
              class="w-full px-4 py-2 border bg-main-bg rounded-xl focus:ring focus:ring-blue-200"
              type="text"
            />
          </div>
          <div>
            <label class="block text-gray-text mb-1">Last Name</label>
            <input
              v-model="form.last_name"
              class="w-full px-4 py-2 border bg-main-bg rounded-xl focus:ring focus:ring-blue-200"
              type="text"
            />
          </div>
        </div>

        <div>
          <label class="block text-gray-text mb-1">Email</label>
          <input
            v-model="form.email"
            disabled
            class="w-full px-4 py-2 border bg-main-bg rounded-xl bg-gray-100 cursor-not-allowed"
            type="email"
          />
        </div>

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
    alert('Profile picture updated!')
  } catch (err) {
    console.error('Failed to upload image', err)
    alert('Image upload failed')
  }
}

async function logout() {
  try {
    await authStore.logout()
  } catch (err) {
    console.error('Logout failed', err)
  } finally {
    router.push('/login')
  }
}
</script>
