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

    const getAuthHeaders = () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      return { Authorization: `Bearer ${token}` }
    }

    // Fetch all tasks
    const fetchData = async (url) => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}${url}`, { headers: getAuthHeaders() })
        return Array.isArray(res.data) ? res.data : res.data?.data || []
      } catch (err) {
        error.value = err.response?.data?.message || 'Request failed'
        return []
      } finally {
        loading.value = false
      }
    }

    const fetchTasks = () => fetchData('/tasks').then((data) => (tasks.value = data))
    const fetchTasksByProject = (projectId) =>
      projectId
        ? fetchData(`/tasks/project/${projectId}`).then((data) => (tasks.value = data))
        : null

    const fetchTask = async (id) => {
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/${id}`, { headers: getAuthHeaders() })
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

    const updateTaskStatus = async (id, t_status) => {
      error.value = null
      try {
        const res = await axios.patch(
          `${API_BASE_URL}/tasks/${id}/status`,
          { t_status },
          { headers: getAuthHeaders() },
        )
        const index = tasks.value.findIndex((t) => t.id === id)
        if (index !== -1) tasks.value[index].t_status = res.data.t_status
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update task status'
        return null
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
      updateTaskStatus,
    }
  },
  { persist: true },
)
