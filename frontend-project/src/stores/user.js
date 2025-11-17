import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useUserStore = defineStore(
  'user',
  () => {
    const users = ref([])

    const getAuthHeaders = () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      return { Authorization: `Bearer ${token}` }
    }

    // Fetch all users (admin only)
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users`, { headers: getAuthHeaders() })
        users.value = res.data
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    }

    // Fetch user by ID (admin only)
    const fetchUserById = async (id) => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders() })
        return res.data
      } catch (err) {
        console.error(`Error fetching user ${id}:`, err)
        return null
      }
    }

    // Create a new user (admin only)
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

    // Update user info (admin only)
    const updateUser = async (id, updateDto) => {
      try {
        const res = await axios.patch(`${API_BASE_URL}/users/${id}`, updateDto, {
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

    // Reset user password
    const resetUserPassword = async (id) => {
      try {
        const res = await axios.patch(
          `${API_BASE_URL}/users/${id}`,
          { resetPassword: true }, // must match controller check
          { headers: getAuthHeaders() },
        )
        return res.data
      } catch (err) {
        console.error(`Error resetting password for user ${id}:`, err)
        return null
      }
    }

    // Delete user (admin only)
    const deleteUser = async (id) => {
      try {
        await axios.delete(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders() })
        users.value = users.value.filter((u) => u.id !== id)
      } catch (err) {
        console.error(`Error deleting user ${id}:`, err)
      }
    }

    // Get user teams
    const fetchUserTeams = async (id) => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${id}/teams`, {
          headers: getAuthHeaders(),
        })
        return res.data
      } catch (err) {
        console.error(`Error fetching teams for user ${id}:`, err)
        return []
      }
    }

    return {
      users,
      fetchUsers,
      fetchUserById,
      createUser,
      updateUser,
      resetUserPassword,
      deleteUser,
      fetchUserTeams,
    }
  },
  { persist: true },
)
