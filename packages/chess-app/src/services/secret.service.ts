import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getSecret = async (): Promise<string | null> => {
  try {
    const response = await axios.get<string>(`${API_BASE_URL}/secret/`)
    return response.data
  } catch (error: any) {
    console.error("Error fetching game:", error)
    if (error.response && error.response.status === 404) {
      return null
    }
    throw error
  }
}
