import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useUserStore = defineStore(
  'user',
  () => {
    const users = ref([])
    const currentUser = ref(null)

    const getAuthHeaders = () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      return { Authorization: `Bearer ${token}` }
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users`, { headers: getAuthHeaders() })
        users.value = res.data
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/profile`, { headers: getAuthHeaders() })
        currentUser.value = res.data
      } catch (err) {
        console.error('Error fetching current user:', err)
      }
    }

    const fetchUserById = async (id) => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders() })
        return res.data
      } catch (err) {
        console.error(`Error fetching user ${id}:`, err)
        return null
      }
    }

    const createUser = async (userDto) => {
      try {
        const res = await axios.post(`${API_BASE_URL}/users`, userDto, {
          headers: getAuthHeaders(),
        })
        users.value.push(res.data)
        return res.data
      } catch (err) {
        console.error('Error creating user:', err)
        return null
      }
    }

    const updateUser = async (id, updateDto) => {
      try {
        const res = await axios.put(`${API_BASE_URL}/users/${id}`, updateDto, {
          headers: getAuthHeaders(),
        })
        const index = users.value.findIndex((u) => u.id === id)
        if (index !== -1) users.value[index] = res.data
        return res.data
      } catch (err) {
        console.error(`Error updating user ${id}:`, err)
        return null
      }
    }

    const deleteUser = async (id) => {
      try {
        await axios.delete(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders() })
        users.value = users.value.filter((u) => u.id !== id)
      } catch (err) {
        console.error(`Error deleting user ${id}:`, err)
      }
    }

    return {
      users,
      currentUser,
      fetchUsers,
      fetchCurrentUser,
      fetchUserById,
      createUser,
      updateUser,
      deleteUser,
    }
  },
  { persist: true },
)
