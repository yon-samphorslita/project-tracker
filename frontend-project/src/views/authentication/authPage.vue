<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-bg p-4">
    <div class="rounded-2xl bg-main-bg shadow-lg flex flex-wrap max-w-4xl w-full overflow-hidden">
      <!-- Image Section -->
      <div class="flex-1 min-w-[300px] flex justify-center items-center p-6">
        <img src="../../assets/images/auth.png" alt="Logo" class="max-w-full h-auto" />
      </div>

      <!-- Form Section -->
      <div class="flex-1 min-w-[300px] flex flex-col p-8">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <h1 class="text-2xl font-bold text-center mb-4">Welcome Back!</h1>

          <!-- Email -->
          <div class="flex flex-col">
            <label class="font-medium mb-1">Email</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="Email"
              class="rounded-[20px] border border-gray-300 p-[10px] focus:outline-none focus:border-blue-500"
            />
            <span v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</span>
          </div>

          <!-- Password -->
          <div class="flex flex-col">
            <label class="font-medium mb-1">Password</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="Password"
              class="rounded-[20px] border border-gray-300 p-[10px] focus:outline-none focus:border-blue-500"
            />
            <span v-if="errors.password" class="text-red-500 text-sm mt-1">{{
              errors.password
            }}</span>
            <a
              @click.prevent="goToForgotPassword"
              class="text-[var(--btn-red-bg)] text-sm mt-1 hover:underline cursor-pointer"
            >
              Forgot Password?
            </a>
          </div>

          <!-- General Error -->
          <div v-if="errors.general" class="text-red-500 text-sm text-center">
            {{ errors.general }}
          </div>

          <Button
            type="submit"
            btn-color="var(--blue-bg)"
            btntext="var(--main-text)"
            label="Login"
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

const loginForm = ref({
  email: '',
  password: '',
})

const errors = ref({
  email: '',
  password: '',
  general: '',
})

function validateForm() {
  let valid = true
  errors.value.email = ''
  errors.value.password = ''
  errors.value.general = ''

  if (!loginForm.value.email) {
    errors.value.email = 'Email is required.'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(loginForm.value.email)) {
    errors.value.email = 'Email is invalid.'
    valid = false
  }

  if (!loginForm.value.password) {
    errors.value.password = 'Password is required.'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validateForm()) return

  try {
    const user = await auth.login(loginForm.value)
    await auth.fetchProfile()

    if (!user.password_changed) {
      await router.push('/change-password')
    } else {
      await router.push('/dashboard')
    }
  } catch (err) {
    console.error(err)
    errors.value.general = err.response?.data?.message || 'Login failed'
  }
}

function goToForgotPassword() {
  router.push('/forgot-password')
}
</script>
