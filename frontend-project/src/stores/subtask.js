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

    // Fetch all subtasks
    async function fetchSubtasks() {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/subtasks`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        subtasks.value = response.data
      } catch (err) {
        error.value = err.response?.data?.message || err.message
      } finally {
        loading.value = false
      }
    }

    // Fetch subtasks by task ID
    async function fetchByTask(taskId) {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/subtasks/task/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        return response.data
      } catch (err) {
        error.value = err.response?.data?.message || err.message
        return []
      } finally {
        loading.value = false
      }
    }

    // Create subtask
    async function createSubtask(payload) {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${API_BASE_URL}/subtasks`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        subtasks.value.push(response.data)
        return response.data
      } catch (err) {
        error.value = err.response?.data?.message || err.message
        return null
      } finally {
        loading.value = false
      }
    }

    // Update subtask
    async function updateSubtask(id, payload) {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.patch(`${API_BASE_URL}/subtasks/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const index = subtasks.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          subtasks.value[index] = { ...subtasks.value[index], ...response.data }
        } else if (payload.taskId){
          await fetchByTask(payload.taskId)
        }
        return response.data
      } catch (err) {
        error.value = err.response?.data?.message || err.message
        return null
      } finally {
        loading.value = false
      }
    }

    // Delete subtask
    async function deleteSubtask(id) {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/subtasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        subtasks.value = subtasks.value.filter((s) => s.id !== id)
      } catch (err) {
        error.value = err.response?.data?.message || err.message
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
      createSubtask,
      updateSubtask,
      deleteSubtask,
    }
  },
  {
    persist: true,
  },
)

