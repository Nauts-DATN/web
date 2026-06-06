import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.")
      return
    }

    setIsLoading(true)
    try {
      const res = await register(name, email, password)
      const msg = res.isSuccess
        ? "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
        : "Đăng ký thất bại. Vui lòng thử lại."
      toast.success(msg)
      if (res.isSuccess) {
        navigate("/verify-email", { state: { email } })
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Đăng ký thất bại. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field>
        <FieldLabel htmlFor="register-name">Họ và tên</FieldLabel>
        <Input
          id="register-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="register-email">Email</FieldLabel>
        <Input
          id="register-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="register-password">Mật khẩu</FieldLabel>
        <Input
          id="register-password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="register-confirm-password">
          Xác nhận mật khẩu
        </FieldLabel>
        <Input
          id="register-confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Đăng ký
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
