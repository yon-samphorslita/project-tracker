<template>
  <!-- <SettingsLayout /> -->
  <div>
    <h1 class="text-2xl font-bold mb-6">Account Settings</h1>

    <div class="mx-auto bg-white shadow-md rounded-2xl p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button
          v-if="!isEditing"
          @click="startEditing"
          type="button"
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
      <form class="grid gap-6" @submit.prevent>
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
            disabled
            class="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
            type="email"
          />
        </div>
      </form>

      <!-- Action Buttons -->
      <div v-if="isEditing" class="flex justify-end gap-3 mt-6">
        <button
          @click="cancelEditing"
          type="button"
          class="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          @click="saveChanges"
          type="button"
          class="px-4 py-2 rounded-xl bg-[#C6E7FF] text-black hover:bg-blue-400 transition"
        >
          Save Changes
        </button>
      </div>

      <!-- Change Password Section -->
      <div class="mt-8 border-t pt-6">
        <h2 class="text-xl font-semibold mb-4">Change Password</h2>
        <form @submit.prevent="updatePassword" class="flex flex-col gap-4">
          <div>
            <label class="block text-gray-700 mb-1">Current Password</label>
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="Enter current password"
              class="w-full px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 mb-1">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password"
              class="w-full px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 mb-1">Confirm New Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
              class="w-full px-4 py-2 border rounded-xl focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <button
            type="submit"
            class="mt-4 px-4 py-2 bg-[#C6E7FF] text-black font-bold rounded-xl hover:bg-blue-400 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>

    <div class="mt-4">
      <button
        @click="logout"
        type="button"
        class="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  </div>
  <!-- </SettingsLayout> -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SettingsLayout from './settingsLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

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

async function updatePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('New password and confirm password do not match')
    return
  }

  try {
    const res = await authStore.updatePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword,
    )
    alert(res.message)
    passwordForm.value.oldPassword = ''
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update password')
    console.error(err)
  }
}

function handleImageUpload(e) {
  const file = e.target.files[0]
  if (file) {
    form.value.img_url = URL.createObjectURL(file)
    // TODO: Upload image to backend
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
