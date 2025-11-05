import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useTeamStore = defineStore('team', () => {
  const teams = ref([])

  async function fetchTeams() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      teams.value = res.data
      console.log('Fetched teams:', teams.value)
    } catch (err) {
      console.error('Error fetching teams:', err)
    }
  }

  async function fetchTeam(id) {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data
    } catch (err) {
      console.error('Error fetching team:', err)
      return null
    }
  }

  function addTeam(newTeam) {
    teams.value.unshift(newTeam)
  }

    async function createTeam(payload) {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(`${API_BASE_URL}/teams`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      teams.value.unshift(res.data) // add new team to top
      return res.data
    } catch (err) {
      console.error('Error creating team:', err.response?.data || err.message)
      throw err
    }
  }

  async function updateTeam(id, payload) {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.patch(`${API_BASE_URL}/teams/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // update local list
      const idx = teams.value.findIndex((t) => t.id === id)
      if (idx !== -1) teams.value[idx] = res.data
    } catch (err) {
      console.error('Error updating team:', err)
    }
  }

  async function deleteTeam(id) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      teams.value = teams.value.filter((t) => t.id !== id)
    } catch (err) {
      console.error('Error deleting team:', err)
    }
  }

  return {
    teams,
    fetchTeams,
    fetchTeam,
    addTeam,
    createTeam,
    updateTeam,
    deleteTeam,
  }
})
