import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)
    const isAuthenticated = ref(!!token.value)

    // set user & token
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

    // Axios instance with token
    const api = axios.create({
      baseURL: API_BASE_URL,
    })

    api.interceptors.request.use((config) => {
      if (token.value) {
        config.headers.Authorization = `Bearer ${token.value}`
      }
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
    async function logout() {
      try {
        if (token.value) await api.post('/auth/logout')
      } catch (error) {
        console.warn('Backend logout failed, clearing local auth anyway')
      } finally {
        clearAuthData()
      }
    }

    // Fetch profile
    async function fetchProfile() {
      if (!token.value) return null
      try {
        const response = await api.get('/auth/profile')
        user.value = response.data
        return user.value
      } catch (error) {
        if (error.response?.status === 401) {
          logout() // token expired, clear state
        }
        return null
      }
    }

    // Fetch all users (admin only)
    async function fetchAllUsers() {
      if (!token.value) return []
      try {
        const response = await api.get('/auth/users')
        return response.data // array of users without passwords
      } catch (error) {
        console.error('Error fetching users:', error)
        throw error
      }
    }

    // Update profile (excluding password)
    async function updateProfile(updateUserDto) {
      if (!token.value) return null
      const response = await api.patch('/auth/user', updateUserDto)
      user.value = response.data
      return user.value
    }

    // Update password
    async function updatePassword(oldPassword, newPassword) {
      if (!token.value) return null
      const response = await api.patch('/auth/update-password', {
        oldPassword,
        newPassword,
      })
      return response.data
    }
    async function createUser(userDto) {
      if (!token.value) throw new Error('Not authenticated')

      const payload = Object.fromEntries(
        Object.entries(userDto).filter(([_, v]) => v !== undefined && v !== null),
      )

      const response = await api.post('/auth/user', payload)
      return response.data.user
    }
    return {
      user,
      token,
      isAuthenticated,
      login,
      logout,
      fetchProfile,
      fetchAllUsers,
      updateProfile,
      updatePassword,
      createUser,
    }
  },
  {
    persist: true,
  },
)
