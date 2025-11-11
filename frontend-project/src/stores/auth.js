import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from './user'
import { useNotificationStore } from './notification'

const API_BASE_URL = 'http://localhost:3000/auth'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)
    const isAuthenticated = ref(!!token.value)
    const users = ref([])

    const api = axios.create({ baseURL: API_BASE_URL })
    api.interceptors.request.use((config) => {
      if (token.value) config.headers.Authorization = `Bearer ${token.value}`
      return config
    })

    const setAuthData = (userData, accessToken) => {
      user.value = userData
      token.value = accessToken
      isAuthenticated.value = true
      localStorage.setItem('token', accessToken)
    }

    const clearAuthData = () => {
      user.value = null
      token.value = null
      isAuthenticated.value = false
      localStorage.removeItem('token')
    }

    // Login
    const login = async (credentials) => {
      const res = await api.post('/login', credentials)
      const { user: u, accessToken } = res.data
      setAuthData(u, accessToken)
      useUserStore().currentUser = u
      return u
    }

    // Logout
    const logout = async (router) => {
      try {
        if (token.value) await api.post('/logout')
      } catch {
        console.warn('Backend logout failed')
      } finally {
        useNotificationStore().disconnect?.()
        clearAuthData()
        if (router) router.push('/login')
      }
    }

    // Fetch current user's profile
    const fetchProfile = async () => {
      if (!token.value) return null
      try {
        const data = (await api.get('/profile')).data
        user.value = data
        useUserStore().currentUser = data
        return data
      } catch (err) {
        if (err.response?.status === 401) logout()
        return null
      }
    }

    // Update own profile
    const updateProfile = async (updateUserDto) => {
      if (!token.value) return null
      const data = (await api.patch('/profile', updateUserDto)).data
      user.value = data
      useUserStore().currentUser = data
      return data
    }

    // Update first time password
    const updatePassword = async (oldPassword, newPassword) => {
      if (!token.value) return null
      return (await api.patch('/update-password', { oldPassword, newPassword })).data
    }

    // Request OTP for password reset
    const requestOtp = async (email) => {
      return (await api.post('/request-otp', { email })).data
    }

    // Reset password using OTP
    const resetPassword = async ({ email, otp, newPassword }) => {
      return (await api.post('/reset-password', { email, otp, newPassword })).data
    }

    // Verify OTP
    const verifyOtp = async ({ email, otp }) => {
      return (await api.post('/verify-otp', { email, otp })).data
    }

    return {
      user,
      users,
      token,
      isAuthenticated,
      login,
      logout,
      fetchProfile,
      updateProfile,
      updatePassword,
      requestOtp,
      resetPassword,
      verifyOtp,
    }
  },
  { persist: true },
)
