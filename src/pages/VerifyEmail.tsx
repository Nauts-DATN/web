import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  useResendVerification,
  useVerifyEmailCode,
  useVerifyEmailLink,
} from "@/hooks/queries/auth-hooks"
import { toast } from "sonner"

type VerifyEmailLocationState = {
  email?: string
}

export function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = location.state as VerifyEmailLocationState | null
  const token = searchParams.get("token")
  const initialEmail = useMemo(
    () => state?.email ?? searchParams.get("email") ?? "",
    [state?.email, searchParams],
  )

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState("")
  const verifyCode = useVerifyEmailCode()
  const resendVerification = useResendVerification()
  const verifyLink = useVerifyEmailLink(token)

  useEffect(() => {
    if (!token || verifyLink.isLoading) return

    if (verifyLink.isSuccess) {
      toast.success("Xác thực email thành công. Bạn có thể đăng nhập.")
      navigate("/login", {
        replace: true,
        state: { message: "Xác thực email thành công. Bạn có thể đăng nhập." },
      })
    }

    if (verifyLink.isError) {
      const message =
        verifyLink.error instanceof Error
          ? verifyLink.error.message
          : "Liên kết xác thực không hợp lệ hoặc đã hết hạn."
      toast.error(message)
    }
  }, [
    navigate,
    token,
    verifyLink.error,
    verifyLink.isError,
    verifyLink.isLoading,
    verifyLink.isSuccess,
  ])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || code.trim().length !== 6) return

    try {
      await verifyCode.mutateAsync({
        email: email.trim(),
        code: code.trim(),
      })
      toast.success("Xác thực email thành công. Bạn có thể đăng nhập.")
      navigate("/login", {
        replace: true,
        state: { message: "Xác thực email thành công. Bạn có thể đăng nhập." },
      })
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Xác thực thất bại. Vui lòng thử lại.",
      )
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      toast.error("Vui lòng nhập email để gửi lại mã xác thực.")
      return
    }

    try {
      await resendVerification.mutateAsync({ email: email.trim() })
      toast.success("Mã xác thực mới đã được gửi nếu email hợp lệ.")
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể gửi lại mã xác thực. Vui lòng thử lại.",
      )
    }
  }

  if (token && verifyLink.isLoading) {
    return (
      <div className="space-y-5 text-center">
        <MailCheck className="mx-auto size-10 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Đang xác thực email</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vui lòng chờ trong giây lát.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2 text-center">
        <MailCheck className="mx-auto size-10 text-primary" />
        <h2 className="text-lg font-semibold">Xác thực email</h2>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đã gửi mã xác thực đến email của bạn. Vui lòng kiểm tra.
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="verify-email">Email</FieldLabel>
        <Input
          id="verify-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="verify-code">Mã xác nhận</FieldLabel>
        <Input
          id="verify-code"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
        />
      </Field>

      <Button
        type="submit"
        className="w-full"
        disabled={code.length !== 6}
        isLoading={verifyCode.isPending}
      >
        Xác thực
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleResend}
        isLoading={resendVerification.isPending}
      >
        Gửi lại mã xác thực
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã xác thực?{" "}
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
