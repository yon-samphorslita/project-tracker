<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-100 p-4">
    <div class="bg-white rounded-2xl shadow-lg flex flex-wrap max-w-4xl w-full overflow-hidden">
      <!-- Image Section -->
      <div class="flex-1 min-w-[300px] flex justify-center items-center p-6">
        <img src="/assets/images/auth.png" alt="Logo" class="max-w-full h-auto" />
      </div>

      <!-- Form Section -->
      <div class="flex-1 min-w-[300px] flex flex-col p-8">
        <!-- Sign Up Form -->
        <form v-if="mode === 'signup'" @submit.prevent="handleSignup" class="flex flex-col gap-4">
          <h1 class="text-2xl font-bold text-center mb-4">Get Started!</h1>

          <div class="flex flex-col">
            <label class="font-medium mb-1">First Name</label>
            <input
              v-model="signupForm.first_name"
              type="text"
              placeholder="First Name"
              class="rounded-[20px] border border-gray-300 p-[10px] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="flex flex-col">
            <label class="font-medium mb-1">Last Name</label>
            <input
              v-model="signupForm.last_name"
              type="text"
              placeholder="Last Name"
              class="rounded-[20px] border border-gray-300 p-[10px] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="flex flex-col">
            <label class="font-medium mb-1">Email</label>
            <input
              v-model="signupForm.email"
              type="email"
              placeholder="Email"
              required
              class="rounded-[20px] border border-gray-300 p-[10px] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="flex flex-col">
            <label class="font-medium mb-1">Password</label>
            <input
              v-model="signupForm.password"
              type="password"
              placeholder="Password"
              required
              class="rounded-[20px] border border-gray-300 p-[10px] focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            class="bg-[#20A1FF] text-white py-3 rounded-[20px] font-bold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>

          <p class="text-center cursor-pointer mt-2" @click="mode = 'login'">
            Already have an account? <span class="text-[#20A1FF]"> Login </span>
          </p>
        </form>

        <!-- Login Form -->
        <form v-else @submit.prevent="handleLogin" class="flex flex-col gap-4">
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
          </div>

          <button
            type="submit"
            class="bg-[#20A1FF] text-white py-3 rounded-[20px] font-bold hover:bg-blue-700 transition"
          >
            Login
          </button>

          <p class="text-center cursor-pointer mt-2" @click="mode = 'signup'">
            Don't have an account? <span class="text-[#20A1FF]"> Sign Up </span>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// Start in signup mode
const mode = ref('signup')

// Forms
const signupForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: localStorage.getItem('role') || 'member',
  img_url: '',
})

const loginForm = ref({
  email: '',
  password: '',
})

// Signup handler
async function handleSignup() {
  try {
    await axios.post('http://localhost:3000/auth/signup', signupForm.value)
    alert('Signup successful! You can now login.')
    mode.value = 'login'
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Signup failed')
  }
}

// Login handler
async function handleLogin() {
  try {
    const res = await axios.post('http://localhost:3000/auth/login', loginForm.value)
    const userRole = res.data.user.role // role returned from backend
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('role', userRole) // store actual role

    // Redirect based on role
    if (userRole === 'project_manager') {
      router.push('/pm-dashboard')
    } else if (userRole === 'member') {
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
</script>
