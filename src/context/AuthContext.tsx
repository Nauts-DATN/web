import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useLogin, useRegister, authKeys } from "@/hooks/queries/auth-hooks"
import Persistence from "@/utils/persistence"
import type { AuthRes, AuthState } from "@/types/core/auth"
import type { User } from "@/types/db/user"

// ─── Persistence keys ─────────────────────────────────────────────────────────

const AUTH_TOKEN_KEY = "auth_token"
const AUTH_USER_KEY  = "auth_user"

// ─── Persistence helpers ──────────────────────────────────────────────────────

function saveAuthData(data: NonNullable<AuthRes["data"]>) {
  if (data.accessToken) Persistence.setItem(AUTH_TOKEN_KEY, data.accessToken)
  if (data.user)        Persistence.setItem(AUTH_USER_KEY, data.user)
}

function clearAuthData() {
  Persistence.removeItem(AUTH_TOKEN_KEY)
  Persistence.removeItem(AUTH_USER_KEY)
}

function readAuthState(): AuthState {
  const token = Persistence.getItem<string>(AUTH_TOKEN_KEY)
  const user  = Persistence.getItem<Partial<User>>(AUTH_USER_KEY)
  return {
    token,
    user,
    isAuthenticated: !!(token && user),
    requiresEmailVerification: user?.emailVerified === false,
  }
}

// ─── Interface ────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: Partial<User> | null
  isAuthenticated: boolean
  /** true khi mutation login/register đang chạy */
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<AuthRes>
  logout: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  // Khởi tạo đồng bộ từ localStorage — không cần effect async
  const [authState, setAuthState] = useState<AuthState>(readAuthState)

  const loginMutation    = useLogin()
  const registerMutation = useRegister()

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginMutation.mutateAsync({ email, password })

      if (res.isSuccess && res.data) {
        saveAuthData(res.data)
        setAuthState(readAuthState())
        queryClient.invalidateQueries({ queryKey: authKeys.root })
      } else {
        throw new Error(
          typeof res.error === "string"
            ? res.error
            : "Đăng nhập thất bại. Vui lòng thử lại.",
        )
      }
    },
    [loginMutation, queryClient],
  )

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthRes> => {
      const res = await registerMutation.mutateAsync({ name, email, password })

      if (res.isSuccess && res.data && !res.data.emailVerificationRequired) {
        // Nếu backend không yêu cầu xác thực email, lưu luôn
        saveAuthData(res.data)
        setAuthState(readAuthState())
      }

      return res
    },
    [registerMutation],
  )

  const logout = useCallback(() => {
    clearAuthData()
    queryClient.removeQueries({ queryKey: authKeys.root })
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      requiresEmailVerification: false,
    })
  }, [queryClient])

  const loading = loginMutation.isPending || registerMutation.isPending

  const value = useMemo<AuthContextType>(
    () => ({
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      loading,
      login,
      register,
      logout,
    }),
    [authState, loading, login, register, logout],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
