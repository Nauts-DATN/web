import { useMutation, useQuery } from "@tanstack/react-query"
import authService from "@/services/auth-service"
import type {
    LoginReq,
    RegisterReq,
    VerifyEmailReq,
    VerifyEmailCodeReq,
    ResendVerificationReq,
    ForgotPasswordReq,
    ResetPasswordReq,
    AuthRes,
    LogoutRes,
} from "@/types/core/auth"

export const authKeys = {
    root: ["auth"] as const,
    me: () => [...authKeys.root, "me"] as const,
    verifyEmail: (token: string) =>
        [...authKeys.root, "verify-email", token] as const,
}

export const useLogin = () =>
    useMutation<AuthRes, Error, LoginReq>({
        mutationFn: authService.login,
    })

export const useRegister = () =>
    useMutation<AuthRes, Error, RegisterReq>({
        mutationFn: authService.register,
    })

export const useVerifyEmailCode = () =>
    useMutation<AuthRes, Error, VerifyEmailCodeReq>({
        mutationFn: authService.verifyEmailCode,
    })

export const useResendVerification = () =>
    useMutation<AuthRes, Error, ResendVerificationReq>({
        mutationFn: authService.resendVerification,
    })

export const useForgotPassword = () =>
    useMutation<LogoutRes, Error, ForgotPasswordReq>({
        mutationFn: authService.forgotPassword,
    })

export const useResetPassword = () =>
    useMutation<LogoutRes, Error, ResetPasswordReq>({
        mutationFn: authService.resetPassword,
    })

/** GET /auth/verify-email?token=… (link email xác thực) */
export const useVerifyEmailLink = (token: string | null) =>
    useQuery({
        queryKey: authKeys.verifyEmail(token ?? ""),
        queryFn: () => authService.verifyEmail({ token: token! }),
        enabled: !!token?.trim(),
        retry: false,
        staleTime: Infinity,
    })
