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
    const adminEventSummary = ref([])

    const authHeaders = () => {
      const token = localStorage.getItem('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const normalizeEvent = (e) => ({
      ...e,
      date: e.start_date,
      time:
        e.start_date && e.end_date
          ? `${new Date(e.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(e.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : '',
    })

    const fetchEvents = async () => {
      loading.value = true
      try {
        const res = await axios.get(`${API_BASE_URL}/events`, { headers: authHeaders() })
        events.value = res.data.map(normalizeEvent)
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch events'
      } finally {
        loading.value = false
      }
    }

    const fetchEvent = async (id) => {
      try {
        const res = await axios.get(`${API_BASE_URL}/events/${id}`, { headers: authHeaders() })
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch event'
        return null
      }
    }

    const createEvent = async (eventData) => {
      try {
        const res = await axios.post(`${API_BASE_URL}/events`, eventData, {
          headers: authHeaders(),
        })
        events.value.push(res.data)
        return res.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create event'
        return null
      }
    }

    const updateEvent = async (id, eventData) => {
      try {
        const res = await axios.patch(`${API_BASE_URL}/events/${id}`, eventData, {
          headers: authHeaders(),
        })
        const normalizedEvent = normalizeEvent(res.data)
        const index = events.value.findIndex((e) => e.id === id)
        if (index !== -1) {
          events.value[index] = normalizedEvent
        }
        return normalizedEvent
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update event'
        return null
      }
    }

    const deleteEvent = async (id) => {
      try {
        await axios.delete(`${API_BASE_URL}/events/${id}`, { headers: authHeaders() })
        events.value = events.value.filter((e) => e.id !== id)
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to delete event'
      }
    }

    async function fetchAdminEventSummary() {
      try {
        const res = await axios.get(`${API_BASE_URL}/events/summary`, {
          headers: authHeaders(),
        })
        adminEventSummary.value = res.data
      } catch (err) {
        console.error('Failed to fetch admin summary:', err)
      }
    }

    return {
      events,
      loading,
      error,
      adminEventSummary,
      fetchEvents,
      fetchEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      fetchAdminEventSummary,
    }
  },
  { persist: true },
)
