<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Change Password</h1>

    <div class="mx-auto bg-white shadow-md rounded-2xl p-8">
      <!-- Header -->
      
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

</script>
