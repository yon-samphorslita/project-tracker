<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-100 p-4">
    <div class="bg-white rounded-2xl shadow-lg flex flex-wrap max-w-4xl w-full overflow-hidden">
      <!-- Image Section -->
      <div class="flex-1 min-w-[300px] flex justify-center items-center p-6">
        <img src="../assets/images/auth.png" alt="Logo" class="max-w-full h-auto" />
      </div>

      <!-- Form Section -->
      <div class="flex-1 min-w-[300px] flex flex-col p-8">
        <h1 class="text-2xl font-bold text-center mb-4">Change Password</h1>

        <form @submit.prevent="handleChangePassword" class="flex flex-col gap-4">
          <div class="flex flex-col">
            <label>Old Password</label>
            <input
              v-model="form.oldPassword"
              type="password"
              placeholder="Old Password"
              required
              class="rounded-[20px] border border-gray-300 p-[10px]"
            />
          </div>

          <div class="flex flex-col">
            <label>New Password</label>
            <input
              v-model="form.newPassword"
              type="password"
              placeholder="New Password"
              required
              class="rounded-[20px] border border-gray-300 p-[10px]"
            />
          </div>

          <div class="flex flex-col">
            <label>Confirm New Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              required
              class="rounded-[20px] border border-gray-300 p-[10px]"
            />
          </div>

          <button
            type="submit"
            class="bg-[#20A1FF] text-white py-3 rounded-[20px] font-bold hover:bg-blue-700 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function handleChangePassword() {
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('Passwords do not match')
    return
  }

  try {
    await auth.updatePassword(form.value.oldPassword, form.value.newPassword)

    alert('Password updated successfully')
    router.push('/') // redirect to dashboard
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Failed to update password')
  }
}
</script>
