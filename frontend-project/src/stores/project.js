import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useProjectStore = defineStore(
  'project',
  () => {
    const current = ref(null)
    const projects = ref([])

    // Set the currently selected project
    function setCurrent(project) {
      current.value = project
    }

    // Fetch all projects from backend
    async function fetchProjects() {
      try {
        const token = localStorage.getItem('token') // or wherever you store it
        const response = await axios.get(`${API_BASE_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        projects.value = response.data
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }

    return { current, projects, setCurrent, fetchProjects }
  },
  {
    persist: true, // persists store in localStorage
  },
)
