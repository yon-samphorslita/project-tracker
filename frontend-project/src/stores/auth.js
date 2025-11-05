import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from './user'
import { useNotificationStore } from './notification'
const API_BASE_URL = 'http://localhost:3000'
// const router = useRouter()
export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)
    const isAuthenticated = ref(!!token.value)
    const users = ref([]) // for admin list

    // Set auth state
    function setAuthData(userData, accessToken) {
      user.value = userData
      token.value = accessToken
      isAuthenticated.value = true
      localStorage.setItem('token', accessToken)
    }

    function clearAuthData() {
      user.value = null
      token.value = null
      isAuthenticated.value = false
      localStorage.removeItem('token')
    }

    // Axios instance with auth header
    const api = axios.create({ baseURL: API_BASE_URL })
    api.interceptors.request.use((config) => {
      if (token.value) config.headers.Authorization = `Bearer ${token.value}`
      return config
    })

    // Login
    async function login(credentials) {
      const response = await api.post('/auth/login', credentials)
      const { user: u, accessToken } = response.data
      setAuthData(u, accessToken)
      return u
    }

    // Logout
    async function logout(router) {
      try {
        if (token.value) await api.post('/auth/logout')
      } catch {
        console.warn('Backend logout failed, clearing local auth anyway')
      } finally {
        const notificationStore = useNotificationStore()
    notificationStore.disconnect()
        clearAuthData()
        if (router) router.push('/login')
      }
    }

    // Fetch profile
    async function fetchProfile() {
      if (!token.value) return null
      try {
        const response = await api.get('/auth/profile')
        user.value = response.data
        const userStore = useUserStore()
        userStore.currentUser = response.data
        return user.value
      } catch (err) {
        if (err.response?.status === 401) logout()
        return null
      }
    }

    // Fetch all users (admin)
    async function fetchAllUsers() {
      if (!token.value) return []
      const response = await api.get('/auth/users')
      users.value = response.data
      return users.value
    }

    // Update own profile (excluding password/email)
    async function updateProfile(updateUserDto) {
      if (!token.value) return null
      const response = await api.patch('/auth/profile', updateUserDto)
      user.value = response.data
      const userStore = useUserStore()
      userStore.currentUser = response.data
      return user.value
    }

    // Update another user (admin)
    async function updateUser(updateUserDto) {
      if (!token.value) return null
      if (!updateUserDto.id) throw new Error('User ID required')
      const response = await api.patch(`/auth/user/${updateUserDto.id}`, updateUserDto)
      return response.data
    }

    // Update password
    async function updatePassword(oldPassword, newPassword) {
      if (!token.value) return null
      const response = await api.patch('/auth/update-password', { oldPassword, newPassword })
      return response.data
    }

    // Create user (admin)
    async function createUser(userDto) {
      if (!token.value) throw new Error('Not authenticated')
      const payload = Object.fromEntries(
        Object.entries(userDto).filter(([_, v]) => v !== undefined && v !== null),
      )
      const response = await api.post('/auth/user', payload)
      return response.data
    }
    async function requestOtp(email) {
      const response = await api.post('/auth/request-otp', { email })
      return response.data
    }

    async function resetPassword({ email, otp, newPassword }) {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword })
      return response.data
    }

    async function verifyOtp({ email, otp }) {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp })
      return response.data
    }

    return {
      user,
      users,
      token,
      isAuthenticated,
      login,
      logout,
      fetchProfile,
      fetchAllUsers,
      updateProfile,
      updateUser,
      updatePassword,
      createUser,
      requestOtp,
      resetPassword,
      verifyOtp,
    }
  },
  { persist: true },
)
