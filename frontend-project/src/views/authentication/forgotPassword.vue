<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-bg p-4">
    <div class="bg-main-bg rounded-2xl shadow-lg flex flex-wrap max-w-4xl w-full overflow-hidden">
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

          <Button
            @click="requestOtp"
            btn-color="var(--blue-bg)"
            btntext="var(--main-text)"
            label="Send OTP"
          />
        </div>

        <!-- Step 2a: Enter OTP -->
        <div v-else-if="step === 2 && !otpVerified" class="flex flex-col gap-4">
          <label>Enter OTP</label>
          <div class="flex justify-between gap-2">
            <input
              v-for="(digit, index) in otpDigits"
              :key="index"
              type="text"
              maxlength="1"
              class="w-12 h-12 text-center border rounded-lg text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
              v-model="otpDigits[index]"
              @input="onOtpInput(index, $event)"
              @paste.prevent="onPasteOtp($event)"
              ref="setOtpRef"
            />
          </div>

          <Button
            @click="verifyOtp"
            btn-color="var(--blue-bg)"
            btntext="var(--main-text)"
            label="Verify OTP"
          />
        </div>

        <!-- Step 2b: Reset Password -->
        <div v-else-if="step === 2 && otpVerified" class="flex flex-col gap-4">
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

          <Button
            @click="resetPassword"
            btn-color="var(--blue-bg)"
            btntext="var(--main-text)"
            label="Reset Password"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/button.vue'
export default {
  setup() {
    const router = useRouter()
    const auth = useAuthStore()

    const step = ref(1)
    const email = ref('')
    const otpVerified = ref(false)
    const otpDigits = reactive(Array(6).fill(''))
    const otpRefs = []
    const newPassword = ref('')
    const confirmPassword = ref('')

    const setOtpRef = (el) => {
      if (el) otpRefs.push(el)
    }

    // Step 1: Request OTP
    const requestOtp = async () => {
      try {
        await auth.requestOtp(email.value)
        alert('OTP sent to your email.')
        step.value = 2
        nextTick(() => otpRefs[0]?.focus())
      } catch (err) {
        console.error(err)
        alert(err.response?.data?.message || 'Failed to request OTP')
      }
    }

    // Handle OTP input
    const onOtpInput = (index, e) => {
      const target = e.target
      otpDigits[index] = target.value.replace(/\D/g, '') // only digits

      if (target.value && index < 5) {
        otpRefs[index + 1]?.focus()
      }

      if (otpDigits.every((d) => d !== '')) {
        verifyOtp()
      }
    }

    // Paste full OTP
    const onPasteOtp = (e) => {
      const paste = e.clipboardData.getData('text') || ''
      if (paste.length === 6 && /^\d{6}$/.test(paste)) {
        paste.split('').forEach((digit, i) => (otpDigits[i] = digit))
        nextTick(() => verifyOtp())
      }
    }

    // Verify OTP
    const verifyOtp = async () => {
      try {
        await auth.verifyOtp({ email: email.value, otp: otpDigits.join('') })
        otpVerified.value = true
        nextTick(() => document.querySelector('input[type="password"]')?.focus())
      } catch (err) {
        console.error(err)
        alert(err.response?.data?.message || 'Invalid OTP')
      }
    }

    const resetPassword = async () => {
      if (newPassword.value !== confirmPassword.value) {
        alert('Passwords do not match.')
        return
      }

      try {
        await auth.resetPassword({
          email: email.value,
          otp: otpDigits.join(''),
          newPassword: newPassword.value,
        })
        alert('Password reset successful! Redirecting to login...')
        router.push('/login')
      } catch (err) {
        console.error(err)
        alert(err.response?.data?.message || 'Failed to reset password')
      }
    }

    return {
      step,
      email,
      otpVerified,
      otpDigits,
      setOtpRef,
      newPassword,
      confirmPassword,
      requestOtp,
      onOtpInput,
      onPasteOtp,
      verifyOtp,
      resetPassword,
    }
  },
}
</script>

<style scoped>
@media (max-width: 640px) {
  input[type='text'] {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
}
</style>
