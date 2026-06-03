import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  useForgotPassword,
  useResetPassword,
} from "@/hooks/queries/auth-hooks"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return error instanceof Error ? error.message : fallback
}

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const forgotPassword = useForgotPassword()
  const resetPassword = useResetPassword()

  async function handleSendCode() {
    if (!email.trim()) {
      toast.error("Vui lòng nhập email")
      return
    }

    try {
      await forgotPassword.mutateAsync({ email: email.trim() })
      setCodeSent(true)
      toast.success("Mã đặt lại mật khẩu đã được gửi tới email của bạn.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể gửi mã đặt lại mật khẩu."))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || code.trim().length !== 6) {
      toast.error("Vui lòng nhập email và mã gồm 6 số")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu mới không khớp")
      return
    }

    try {
      await resetPassword.mutateAsync({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      })
      toast.success("Đã đặt lại mật khẩu. Bạn có thể đăng nhập.")
      navigate("/login", {
        replace: true,
        state: { message: "Đã đặt lại mật khẩu. Bạn có thể đăng nhập." },
      })
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể đặt lại mật khẩu."))
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Quên mật khẩu</h2>
        <p className="text-sm text-muted-foreground">
          Nhập email để nhận mã đặt lại mật khẩu, sau đó nhập mã và mật khẩu mới.
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={handleSendCode}
            isLoading={forgotPassword.isPending}
          >
            Gửi mã
          </Button>
        </div>
      </Field>

      {codeSent && (
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Mã đặt lại mật khẩu đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.
        </p>
      )}

      <Field>
        <FieldLabel htmlFor="reset-code">Mã xác nhận</FieldLabel>
        <Input
          id="reset-code"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="new-password">Mật khẩu mới</FieldLabel>
        <Input
          id="new-password"
          type="password"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="confirm-password">Xác nhận mật khẩu mới</FieldLabel>
        <Input
          id="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <Button
        type="submit"
        className="w-full"
        isLoading={resetPassword.isPending}
      >
        Đặt lại mật khẩu
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Nhớ mật khẩu?{" "}
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
