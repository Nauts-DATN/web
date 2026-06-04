import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios"
import Persistence from "./persistence"

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
  originalError?: unknown
}

const AUTH_TOKEN_KEY = "auth_token"
const AUTH_REFRESH_TOKEN_KEY = "auth_refresh_token"
const AUTH_USER_KEY = "auth_user"

/** Để trống VITE_API_URL khi dev → gọi `/api` cùng origin, Vite proxy chuyển tới backend (tránh CORS). */
const baseURL = import.meta.env.VITE_API_URL?.trim() || ""

const api: AxiosInstance = axios.create({
  baseURL,
})

type RefreshData = {
  accessToken: string
  refreshToken: string
  user?: unknown
}

let refreshPromise: Promise<RefreshData> | null = null

api.interceptors.request.use((config) => {
  const token = Persistence.getItem<string>(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

function isAuthRetryExcluded(url?: string): boolean {
  return (
    url?.includes("/api/auth/login") ||
    url?.includes("/api/auth/refresh")
  ) ?? false
}

async function refreshAccessToken(refreshToken: string): Promise<RefreshData> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/api/auth/refresh`, { refreshToken })
      .then((response) => {
        const data = response.data?.data as RefreshData | undefined
        if (!data?.accessToken || !data?.refreshToken) {
          throw new Error("Invalid refresh response")
        }

        Persistence.setItem(AUTH_TOKEN_KEY, data.accessToken)
        Persistence.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken)
        if (data.user) {
          Persistence.setItem(AUTH_USER_KEY, data.user)
        }

        return data
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRetryExcluded(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    const refreshToken = Persistence.getItem<string>(AUTH_REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const data = await refreshAccessToken(refreshToken)
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      Persistence.removeItem(AUTH_TOKEN_KEY)
      Persistence.removeItem(AUTH_REFRESH_TOKEN_KEY)
      Persistence.removeItem(AUTH_USER_KEY)
      return Promise.reject(refreshError)
    }
  },
)

export default api
