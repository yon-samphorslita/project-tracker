// stores/authStore.js
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

    // Helper: set user & token
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

    // Signup
    async function signup(userData) {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData)
      const { user: u, accessToken } = response.data
      setAuthData(u, accessToken)
      return u
    }

    // Login
    async function login(credentials) {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials)
      const { user: u, accessToken } = response.data
      setAuthData(u, accessToken)
      return u
    }

    // Logout
    function logout() {
      clearAuthData()
    }

    // Fetch profile
    async function fetchProfile() {
      if (!token.value) return null
      try {
        const response = await api.get('/auth/profile')
        user.value = response.data
        return user.value
      } catch (error) {
        console.error('Error fetching profile:', error)
        if (error.response?.status === 401) logout()
        return null
      }
    }

    // Update profile
    async function updateProfile(updateUserDto) {
      if (!token.value) return null
      const response = await api.patch('/auth/update', updateUserDto)
      user.value = response.data
      return user.value
    }

    return {
      user,
      token,
      isAuthenticated,
      signup,
      login,
      logout,
      fetchProfile,
      updateProfile,
    }
  },
  {
    persist: true, // persist store in localStorage
  },
)
