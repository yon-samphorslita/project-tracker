import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useProjectStore = defineStore(
  'project',
  () => {
    const current = ref(null)
    const projects = ref([])

    const authHeaders = () => {
      const token = localStorage.getItem('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    }

    function setCurrent(project) {
      current.value = project
    }

    async function fetchProjects() {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects`, { headers: authHeaders() })
        projects.value = Array.from(new Map(res.data.map((p) => [p.id, p])).values())
      } catch (err) {
        console.error('Error fetching projects:', err)
      }
    }

    async function fetchProjectById(id) {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects/${id}`, { headers: authHeaders() })
        current.value = res.data
        return res.data
      } catch (err) {
        console.error(`Error fetching project ${id}:`, err)
        return null
      }
    }

    // async function fetchProjectsByPM(pmId) {
    //   try {
    //     const res = await axios.get(`${API_BASE_URL}/projects/pm/${pmId}`, {
    //       headers: authHeaders(),
    //     })
    //     projects.value = Array.from(new Map(res.data.map((p) => [p.id, p])).values())
    //     return projects.value
    //   } catch (err) {
    //     console.error(`Error fetching projects for PM ${pmId}:`, err)
    //     return []
    //   }
    // }

    async function createProject(projectDto) {
      try {
        const res = await axios.post(`${API_BASE_URL}/projects`, projectDto, {
          headers: authHeaders(),
        })
        if (!projects.value.some((p) => p.id === res.data.id)) projects.value.push(res.data)
        return res.data
      } catch (err) {
        console.error('Error creating project:', err)
        return null
      }
    }

    async function updateProject(id, updateDto) {
      try {
        const res = await axios.patch(`${API_BASE_URL}/projects/${id}`, updateDto, {
          headers: authHeaders(),
        })
        const index = projects.value.findIndex((p) => p.id === id)
        if (index !== -1) projects.value[index] = res.data
        if (current.value?.id === id) current.value = res.data
        return res.data
      } catch (err) {
        console.error(`Error updating project ${id}:`, err)
        return null
      }
    }

    async function deleteProject(id) {
      try {
        await axios.delete(`${API_BASE_URL}/projects/${id}`, { headers: authHeaders() })
        projects.value = projects.value.filter((p) => p.id !== id)
        if (current.value?.id === id) current.value = null
      } catch (err) {
        console.error(`Error deleting project ${id}:`, err)
      }
    }

    async function updateProjectStatus(id, status, priority) {
      try {
        const res = await axios.patch(
          `${API_BASE_URL}/projects/${id}`,
          { status, priority },
          { headers: authHeaders() },
        )

        const index = projects.value.findIndex((p) => p.id === id)
        if (index !== -1) projects.value[index] = res.data
        if (current.value?.id === id) current.value = res.data

        return res.data
      } catch (err) {
        console.error(`Error updating project status ${id}:`, err)
        return null
      }
    }

    return {
      current,
      projects,
      setCurrent,
      fetchProjects,
      fetchProjectById,
      // fetchProjectsByPM,
      createProject,
      updateProject,
      deleteProject,
      updateProjectStatus,
    }
  },
  { persist: true },
)
