import axios from "axios"
import { API_BASE_URL } from "../constants/modSpecs.js"

export const getHash = async (): Promise<string | null> => {
    const { data } = await axios.get<string>(`${API_BASE_URL}/hash/`)
    return data
}

export const getSecret = async (id: string): Promise<string | null> => {
  const { data } = await axios.get<string>(`${API_BASE_URL}/secret/${id}`)
  return data
}
