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

    // Fetch all tasks
    async function fetchTasks() {
      loading.value = true
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        tasks.value = res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch tasks'
        console.error(error.value)
      } finally {
        loading.value = false
      }
    }

    // Fetch tasks by project
    async function fetchTasksByProject(projectId) {
      loading.value = true
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/tasks/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        tasks.value = res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch tasks for project'
        console.error(error.value)
      } finally {
        loading.value = false
      }
    }

    // Fetch single task
    async function fetchTask(id) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch task'
        console.error(error.value)
        return null
      }
    }

    // Create new task
    async function createTask(taskData) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        tasks.value.push(res.data)
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create task'
        console.error(error.value)
        return null
      }
    }

    // Update task
    async function updateTask(id, taskData) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.patch(`${API_BASE_URL}/tasks/${id}`, taskData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const index = tasks.value.findIndex((t) => t.id === id)
        if (index !== -1) tasks.value[index] = res.data
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update task'
        console.error(error.value)
        return null
      }
    }

    // Delete task
    async function deleteTask(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        tasks.value = tasks.value.filter((t) => t.id !== id)
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to delete task'
        console.error(error.value)
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
  { persist: true }, // persist store in localStorage
)
