import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Game {
  id: string
  gameId: string
  firstPlayerPubKey: string
  secondPlayerPubKey: string
  firstPlayerHash?: string
  secondPlayerHash?: string
}

export const getGame = async (gameId: string): Promise<Game | null> => {
  try {
    const response = await axios.get<Game>(`${API_BASE_URL}/games/${gameId}`)
    return response.data
  } catch (error: any) {
    console.error("Error fetching game:", error)
    if (error.response && error.response.status === 404) {
      return null
    }
    throw error
  }
}

export const createGame = async (game: Omit<Game, "id">): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/games`, game)
  } catch (error) {
    console.error("Error creating game:", error)
    throw error
  }
}
