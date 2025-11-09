<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-bg p-4">
    <div class="bg-main-bg rounded-2xl shadow-lg flex flex-wrap max-w-4xl w-full overflow-hidden">
      <!-- Image Section -->
      <div class="flex-1 min-w-[300px] flex justify-center items-center p-6">
        <img src="../../assets/images/auth.png" alt="Logo" class="max-w-full h-auto" />
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
              class="rounded-[20px] border border-gray-300 p-[10px]"
            />
            <span v-if="errors.oldPassword" class="text-red-500 text-sm mt-1">{{
              errors.oldPassword
            }}</span>
          </div>

          <div class="flex flex-col">
            <label>New Password</label>
            <input
              v-model="form.newPassword"
              type="password"
              placeholder="New Password"
              class="rounded-[20px] border border-gray-300 p-[10px]"
            />
            <span v-if="errors.newPassword" class="text-red-500 text-sm mt-1">{{
              errors.newPassword
            }}</span>
          </div>

          <div class="flex flex-col">
            <label>Confirm New Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              class="rounded-[20px] border border-gray-300 p-[10px]"
            />
            <span v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">{{
              errors.confirmPassword
            }}</span>
          </div>

          <div v-if="errors.general" class="text-red-500 text-sm text-center">
            {{ errors.general }}
          </div>

          <Button
            type="submit"
            :disabled="loading"
            btn-color="var(--blue-bg)"
            btntext="var(--main-text)"
            label="Update Password"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/common-used/button.vue'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  general: '',
})

const loading = ref(false)

function validateForm() {
  let valid = true
  errors.value.oldPassword = ''
  errors.value.newPassword = ''
  errors.value.confirmPassword = ''
  errors.value.general = ''

  if (!form.value.oldPassword) {
    errors.value.oldPassword = 'Old password is required'
    valid = false
  }
  if (!form.value.newPassword) {
    errors.value.newPassword = 'New password is required'
    valid = false
  }
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your new password'
    valid = false
  }
  if (
    form.value.newPassword &&
    form.value.confirmPassword &&
    form.value.newPassword !== form.value.confirmPassword
  ) {
    errors.value.confirmPassword = 'Passwords do not match'
    valid = false
  }
  return valid
}

async function handleChangePassword() {
  if (!validateForm()) return

  loading.value = true
  try {
    await auth.updatePassword(form.value.oldPassword, form.value.newPassword)
    router.push('/') // redirect to dashboard
  } catch (err) {
    console.error(err)
    errors.value.general = err.response?.data?.message || 'Failed to update password'
  } finally {
    loading.value = false
  }
}
</script>
