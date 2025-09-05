<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-100 p-4">
    <div class="bg-white rounded-2xl shadow-lg flex flex-wrap max-w-4xl w-full overflow-hidden">
      <!-- Image Section -->
      <div class="flex-1 min-w-[300px] flex justify-center items-center p-6">
        <img src="../assets/images/auth.png" alt="Logo" class="max-w-full h-auto" />
      </div>

      <!-- Form Section -->
      <div class="flex-1 min-w-[300px] flex flex-col p-8">
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <h1 class="text-2xl font-bold text-center mb-4">Welcome Back!</h1>

          <div class="flex flex-col">
            <label class="font-medium mb-1">Email</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="Email"
              required
              class="rounded-[20px] border border-gray-300 p-[10px] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="flex flex-col">
            <label class="font-medium mb-1">Password</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="Password"
              required
              class="rounded-[20px] border border-gray-300 p-[10px] focus:outline-none focus:border-blue-500"
            />
            <a
              @click.prevent="goToForgotPassword"
              class="text-blue-500 text-sm mt-1 hover:underline cursor-pointer"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            class="bg-[#20A1FF] text-white py-3 rounded-[20px] font-bold hover:bg-blue-700 transition"
          >
            Login
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

const loginForm = ref({
  email: '',
  password: '',
})

// Login handler
async function handleLogin() {
  try {
    const user = await auth.login(loginForm.value)
    if (!user.password_changed) {
      // Force first-time password change
      router.push('/change-password')
      return
    }
    const role = user.role

    if (role === 'admin') {
      router.push('/settings/profile')
    } else if (role === 'project_manager') {
      router.push('/projects')
    } else if (role === 'member') {
      router.push('/member-dashboard')
    } else {
      router.push('/home')
    }

    alert('Login successful!')
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Login failed')
  }
}

// Navigate to forgot password page
function goToForgotPassword() {
  router.push('/forgot-password')
}
</script>
