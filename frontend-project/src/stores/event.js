import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useEventStore = defineStore(
  'event',
  () => {
    const events = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Fetch all events
    async function fetchEvents() {
      loading.value = true
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        // Normalize events so calendar can consume them easily
        events.value = res.data.map((e) => ({
          ...e,
          date: e.start_date, // alias for calendar display
          time:
            e.start_date && e.end_date
              ? `${new Date(e.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(e.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : '',
        }))
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch events'
        console.error(error.value)
      } finally {
        loading.value = false
      }
    }

    // Fetch single event by ID
    async function fetchEvent(id) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch event'
        console.error(error.value)
        return null
      }
    }

    // Create a new event
    async function createEvent(eventData) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(`${API_BASE_URL}/events`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        events.value.push(res.data)
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create event'
        console.error(error.value)
        return null
      }
    }

    // Update an existing event
    async function updateEvent(id, eventData) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.patch(`${API_BASE_URL}/events/${id}`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const index = events.value.findIndex((e) => e.id === id)
        if (index !== -1) events.value[index] = res.data
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update event'
        console.error(error.value)
        return null
      }
    }

    // Delete an event
    async function deleteEvent(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        events.value = events.value.filter((e) => e.id !== id)
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to delete event'
        console.error(error.value)
      }
    }

    return {
      events,
      loading,
      error,
      fetchEvents,
      fetchEvent,
      createEvent,
      updateEvent,
      deleteEvent,
    }
  },
  { persist: true },
)
