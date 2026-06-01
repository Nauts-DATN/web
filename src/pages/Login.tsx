import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { isAxiosError } from "axios"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return error instanceof Error ? error.message : fallback
}

export function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const message =
    (location.state as { message?: string } | null)?.message ?? null
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success("Đăng nhập thành công!")
    } catch (e) {
      toast.error(getErrorMessage(e, "Login failed. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {message && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}
      <Field>
        <FieldLabel htmlFor="login-email">Email</FieldLabel>
        <Input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
        <Input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Đăng nhập
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          to="/forgot-password"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </form>
  )
}
