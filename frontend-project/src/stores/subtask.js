import { defineStore } from 'pinia'
import axios from 'axios'

export const useSubtaskStore = defineStore('subtask', {
  state: () => ({
    subtasks: [],
    loading: false,
    error: null,
  }),

  actions: {
    // Fetch all subtasks
    async fetchSubtasks() {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get('/subtasks')
        this.subtasks = data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    // Fetch subtasks by taskId
    async fetchByTask(taskId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(`/subtasks/task/${taskId}`)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch a single subtask
    async fetchOne(id) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(`/subtasks/${id}`)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        return null
      } finally {
        this.loading = false
      }
    },

    // Create a new subtask
    async createSubtask(payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.post('/subtasks', payload)
        this.subtasks.push(data)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        return null
      } finally {
        this.loading = false
      }
    },

    // Update a subtask
    async updateSubtask(id, payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.patch(`/subtasks/${id}`, payload)
        const index = this.subtasks.findIndex((s) => s.id === id)
        if (index !== -1) this.subtasks[index] = data
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        return null
      } finally {
        this.loading = false
      }
    },

    // Delete a subtask
    async deleteSubtask(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`/subtasks/${id}`)
        this.subtasks = this.subtasks.filter((s) => s.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
  },
})
