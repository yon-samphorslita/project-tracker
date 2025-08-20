import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`)
    return response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}
