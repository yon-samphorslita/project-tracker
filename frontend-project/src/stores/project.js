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
    // If the user is admin, backend returns all projects automatically
    async function fetchProjects() {
      try {
        const token = localStorage.getItem('token')
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

    // Fetch a single project by ID
    async function fetchProjectById(id) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      } catch (error) {
        console.error(`Error fetching project ${id}:`, error)
        return null
      }
    }

    // Create a new project
    async function createProject(projectDto) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${API_BASE_URL}/projects`, projectDto, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        projects.value.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating project:', error)
        return null
      }
    }

    // Update a project
    async function updateProject(id, updateDto) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.patch(`${API_BASE_URL}/projects/${id}`, updateDto, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const index = projects.value.findIndex((p) => p.id === id)
        if (index !== -1) projects.value[index] = response.data
        if (current.value?.id === id) current.value = response.data
        return response.data
      } catch (error) {
        console.error(`Error updating project ${id}:`, error)
        return null
      }
    }

    // Delete a project
    async function deleteProject(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        projects.value = projects.value.filter((p) => p.id !== id)
        if (current.value?.id === id) current.value = null
      } catch (error) {
        console.error(`Error deleting project ${id}:`, error)
      }
    }

    return {
      current,
      projects,
      setCurrent,
      fetchProjects,
      fetchProjectById,
      createProject,
      updateProject,
      deleteProject,
    }
  },
  {
    persist: true,
  },
)
