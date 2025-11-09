import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from './user'
import { useNotificationStore } from './notification'

const API_BASE_URL = 'http://localhost:3000'

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

    const login = async (credentials) => {
      const { user: u, accessToken } = (await api.post('/auth/login', credentials)).data
      setAuthData(u, accessToken)
      return u
    }

    const logout = async (router) => {
      try {
        if (token.value) await api.post('/auth/logout')
      } catch {
        console.warn('Backend logout failed')
      } finally {
        useNotificationStore().disconnect()
        clearAuthData()
        if (router) router.push('/login')
      }
    }

    const fetchProfile = async () => {
      if (!token.value) return null
      try {
        const data = (await api.get('/auth/profile')).data
        user.value = data
        useUserStore().currentUser = data
        return data
      } catch (err) {
        if (err.response?.status === 401) logout()
        return null
      }
    }

    const fetchAllUsers = async () => {
      if (!token.value) return []
      users.value = (await api.get('/auth/users')).data
      return users.value
    }

    const updateProfile = async (updateUserDto) => {
      if (!token.value) return null
      const data = (await api.patch('/auth/profile', updateUserDto)).data
      user.value = data
      useUserStore().currentUser = data
      return data
    }

    const updateUser = async ({ id, ...updateUserDto }) => {
      if (!token.value) return null
      if (!id) throw new Error('User ID required')
      return (await api.patch(`/auth/user/${id}`, updateUserDto)).data
    }

    const updatePassword = async (oldPassword, newPassword) => {
      if (!token.value) return null
      return (await api.patch('/auth/update-password', { oldPassword, newPassword })).data
    }

    const createUser = async (userDto) => {
      if (!token.value) throw new Error('Not authenticated')
      const payload = Object.fromEntries(Object.entries(userDto).filter(([_, v]) => v != null))
      return (await api.post('/auth/user', payload)).data
    }

    const requestOtp = async (email) => (await api.post('/auth/request-otp', { email })).data

    const resetPassword = async ({ email, otp, newPassword }) =>
      (await api.post('/auth/reset-password', { email, otp, newPassword })).data

    const verifyOtp = async ({ email, otp }) =>
      (await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp })).data

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
