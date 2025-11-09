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

    const authHeaders = () => {
      const token = localStorage.getItem('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    }

    async function fetchSubtasks() {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/subtasks`, { headers: authHeaders() })
        subtasks.value = res.data
      } catch (err) {
        error.value = err.response?.data?.message || err.message
      } finally {
        loading.value = false
      }
    }

    async function fetchByTask(taskId) {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${API_BASE_URL}/subtasks/task/${taskId}`, {
          headers: authHeaders(),
        })
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || err.message
        return []
      } finally {
        loading.value = false
      }
    }

    async function createSubtask(payload) {
      loading.value = true
      error.value = null
      try {
        const res = await axios.post(`${API_BASE_URL}/subtasks`, payload, {
          headers: authHeaders(),
        })
        subtasks.value.push(res.data)
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || err.message
        return null
      } finally {
        loading.value = false
      }
    }

    async function updateSubtask(id, payload) {
      loading.value = true
      error.value = null
      try {
        const res = await axios.patch(`${API_BASE_URL}/subtasks/${id}`, payload, {
          headers: authHeaders(),
        })
        const index = subtasks.value.findIndex((s) => s.id === id)
        if (index !== -1) subtasks.value[index] = { ...subtasks.value[index], ...res.data }
        else if (payload.taskId) await fetchByTask(payload.taskId)
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || err.message
        return null
      } finally {
        loading.value = false
      }
    }

    async function deleteSubtask(id) {
      loading.value = true
      error.value = null
      try {
        await axios.delete(`${API_BASE_URL}/subtasks/${id}`, { headers: authHeaders() })
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
  { persist: true },
)
