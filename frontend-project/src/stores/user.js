import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useUserStore = defineStore(
  'user',
  () => {
    const users = ref([])
    const currentUser = ref(null)
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        users.value = res.data
        console.log('Fetched users:', users.value)
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    }

    // Fetch logged-in user profile
    async function fetchCurrentUser() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        currentUser.value = res.data
        console.log('Fetched current user:', currentUser.value)
      } catch (err) {
        console.error('Error fetching current user:', err)
      }
    }

    // Fetch a user by ID
    async function fetchUserById(id) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        return res.data // returns only that user
      } catch (err) {
        console.error(`Error fetching user ${id}:`, err)
        return null
      }
    }

    // Create a new user
    async function createUser(userDto) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(`${API_BASE_URL}/users`, userDto, {
          headers: { Authorization: `Bearer ${token}` },
        })
        users.value.push(res.data)
        return res.data
      } catch (err) {
        console.error('Error creating user:', err)
        return null
      }
    }

    // Update a user
    async function updateUser(id, updateDto) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.put(`${API_BASE_URL}/users/${id}`, updateDto, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const index = users.value.findIndex((u) => u.id === id)
        if (index !== -1) users.value[index] = res.data
        return res.data
      } catch (err) {
        console.error(`Error updating user ${id}:`, err)
        return null
      }
    }

    // Delete a user
    async function deleteUser(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        users.value = users.value.filter((u) => u.id !== id)
      } catch (err) {
        console.error(`Error deleting user ${id}:`, err)
      }
    }

    return {
      users,
      fetchUsers,
      createUser,
      updateUser,
      deleteUser,
      fetchCurrentUser,
      currentUser,
      fetchUserById,
    }
  },
  {
    persist: true,
  },
)
