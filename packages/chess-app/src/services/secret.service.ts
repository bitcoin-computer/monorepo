import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getHash = async (): Promise<string | null> => {
    const { data } = await axios.get<string>(`${API_BASE_URL}/hash/`)
    return data
}
