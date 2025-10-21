import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

const API_BASE_URL = 'http://localhost:3000'

export const useTaskStore = defineStore(
  'task',
  () => {
    const tasks = ref([])
    const loading = ref(false)
    const error = ref(null)

    //  auth headers
    const getAuthHeaders = () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      return { Authorization: `Bearer ${token}` }
    }

    // Fetch all tasks
    const fetchTasks = async () => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks`, {
          headers: getAuthHeaders(),
        })
        tasks.value = Array.isArray(res.data) ? res.data : res.data?.data || []
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch tasks'
      } finally {
        loading.value = false
      }
    }

    // Fetch tasks by project
    const fetchTasksByProject = async (projectId) => {
      if (!projectId) return
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/project/${projectId}`, {
          headers: getAuthHeaders(),
        })

        const newTasks = Array.isArray(res.data) ? res.data : res.data?.data || []

        // Only store the current project's tasks
        tasks.value = newTasks
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch tasks for project'
      } finally {
        loading.value = false
      }
    }

    const fetchTask = async (id) => {
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/${id}`, {
          headers: getAuthHeaders(),
        })
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch task'
        return null
      }
    }

    const createTask = async (taskData) => {
      error.value = null
      try {
        const res = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
          headers: getAuthHeaders(),
        })
        tasks.value.push(res.data)
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create task'
        return null
      }
    }

    const updateTask = async (id, taskData) => {
      error.value = null
      try {
        const res = await axios.patch(`${API_BASE_URL}/tasks/${id}`, taskData, {
          headers: getAuthHeaders(),
        })
        const index = tasks.value.findIndex((t) => t.id === id)
        if (index !== -1) tasks.value[index] = res.data
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update task'
        return null
      }
    }

    const deleteTask = async (id) => {
      error.value = null
      try {
        await axios.delete(`${API_BASE_URL}/tasks/${id}`, { headers: getAuthHeaders() })
        tasks.value = tasks.value.filter((t) => t.id !== id)
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to delete task'
      }
    }

    return {
      tasks,
      loading,
      error,
      fetchTasks,
      fetchTasksByProject,
      fetchTask,
      createTask,
      updateTask,
      deleteTask,
    }
  },
  { persist: true },
)
