import axios, { type AxiosInstance } from "axios"
import Persistence from "./persistence"

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
  originalError?: unknown
}

const AUTH_TOKEN_KEY = "auth_token"

/** Để trống VITE_API_URL khi dev → gọi `/api` cùng origin, Vite proxy chuyển tới backend (tránh CORS). */
const baseURL = import.meta.env.VITE_API_URL?.trim() || ""

const api: AxiosInstance = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = Persistence.getItem<string>(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
