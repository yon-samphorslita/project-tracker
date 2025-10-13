<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-100 p-4">
    <div class="bg-white rounded-2xl shadow-lg flex flex-wrap max-w-4xl w-full overflow-hidden">
      <!-- Image Section -->
      <div class="flex-1 min-w-[300px] flex justify-center items-center p-6">
        <img src="../../assets/images/auth.png" alt="Logo" class="max-w-full h-auto" />
      </div>

      <!-- Form Section -->
      <div class="flex-1 min-w-[300px] flex flex-col p-8">
        <h1 class="text-2xl font-bold text-center mb-6">Forgot Password</h1>

        <!-- Step 1: Request OTP -->
        <div v-if="step === 1" class="flex flex-col gap-4">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            class="rounded-[20px] border border-gray-300 p-[10px]"
          />

          <button
            @click="requestOtp"
            class="bg-[#20A1FF] text-white py-3 rounded-[20px] font-bold hover:bg-blue-700 transition"
          >
            Send OTP
          </button>
        </div>

        <!-- Step 2: Reset Password with OTP -->
        <div v-else-if="step === 2" class="flex flex-col gap-4">
          <label>OTP</label>
          <input
            v-model="otp"
            type="text"
            placeholder="Enter OTP"
            required
            class="rounded-[20px] border border-gray-300 p-[10px]"
          />

          <label>New Password</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="New Password"
            required
            class="rounded-[20px] border border-gray-300 p-[10px]"
          />

          <label>Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            required
            class="rounded-[20px] border border-gray-300 p-[10px]"
          />

          <button
            @click="resetPassword"
            class="bg-[#20A1FF] text-white py-3 rounded-[20px] font-bold hover:bg-blue-700 transition"
          >
            Reset Password
          </button>
        </div>
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

const step = ref(1)
const email = ref('')
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Step 1: Request OTP
async function requestOtp() {
  try {
    await auth.requestOtp(email.value)
    alert('OTP sent to your email.')
    step.value = 2
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Failed to request OTP')
  }
}

// Step 2: Reset Password
async function resetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    alert('Passwords do not match.')
    return
  }

  try {
    await auth.resetPassword({
      email: email.value,
      otp: otp.value,
      newPassword: newPassword.value,
    })
    alert('Password reset successful! Redirecting to login...')
    router.push('/login')
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Failed to reset password')
  }
}
</script>
