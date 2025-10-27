import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useSubtaskStore = defineStore(
  'subtask',
  () => {
    const subtasks = ref([])
    const loading = ref(false)
    const error = ref(null)

    const getAuthHeaders = () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      return { Authorization: `Bearer ${token}` }
    }

    // Fetch all subtasks
    const fetchSubtasks = async () => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/subtasks`, {
          headers: getAuthHeaders(),
        })
        subtasks.value = Array.isArray(res.data) ? res.data : res.data?.data || []
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch subtasks'
      } finally {
        loading.value = false
      }
    }

    // Fetch subtasks by taskId
    const fetchByTask = async (taskId) => {
      if (!taskId) return []
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/subtasks/task/${taskId}`, {
          headers: getAuthHeaders(),
        })
        return Array.isArray(res.data) ? res.data : res.data?.data || []
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch subtasks for task'
        return []
      } finally {
        loading.value = false
      }
    }

    // Fetch single subtask
    const fetchOne = async (id) => {
      if (!id) return null
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/subtasks/${id}`, {
          headers: getAuthHeaders(),
        })
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch subtask'
        return null
      } finally {
        loading.value = false
      }
    }

    // Create subtask
    const createSubtask = async (payload) => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.post(`${API_BASE_URL}/subtasks`, payload, {
          headers: getAuthHeaders(),
        })
        subtasks.value.push(res.data)
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create subtask'
        return null
      } finally {
        loading.value = false
      }
    }

    // Update subtask
    const updateSubtask = async (id, payload) => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.patch(`${API_BASE_URL}/subtasks/${id}`, payload, {
          headers: getAuthHeaders(),
        })
        const index = subtasks.value.findIndex((s) => s.id === id)
        if (index !== -1) subtasks.value[index] = res.data
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update subtask'
        return null
      } finally {
        loading.value = false
      }
    }

    // Delete subtask
    const deleteSubtask = async (id) => {
      loading.value = true
      error.value = null
      try {
        await axios.delete(`${API_BASE_URL}/subtasks/${id}`, {
          headers: getAuthHeaders(),
        })
        subtasks.value = subtasks.value.filter((s) => s.id !== id)
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to delete subtask'
      } finally {
        loading.value = false
      }
    }

    return {
      subtasks,
      loading,
      error,
      fetchSubtasks,
      fetchByTask,
      fetchOne,
      createSubtask,
      updateSubtask,
      deleteSubtask,
    }
  },
  { persist: true },
)
