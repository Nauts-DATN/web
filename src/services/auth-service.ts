import API_ROUTES from "@/conf/constants/api-routes";
import type { AuthRes, LoginReq, RegisterReq, LogoutRes, VerifyEmailReq, VerifyEmailCodeReq, ResendVerificationReq } from "@/types/core/auth";
import api from "@/utils/api";

const authService = {
    login: async ( data: LoginReq): Promise<AuthRes> => {
        const response = await api.post(API_ROUTES.AUTH.LOGIN, data);
        return response.data;
    },
    register: async (data: RegisterReq): Promise<AuthRes> => {
        const response = await api.post(API_ROUTES.AUTH.REGISTER, data);
        return response.data;
    },
    logout: async (): Promise<LogoutRes> => {
        const response = await api.post(API_ROUTES.AUTH.LOGOUT);
        return response.data;
    },
    verifyEmail: async (data: VerifyEmailReq): Promise<AuthRes> => {
        const response = await api.post(API_ROUTES.AUTH.VERIFY_EMAIL, data);
        return response.data;
    },
    verifyEmailCode: async (data: VerifyEmailCodeReq): Promise<AuthRes> => {
        const response = await api.post(API_ROUTES.AUTH.VERIFY_EMAIL_CODE, data);
        return response.data;
    },
    resendVerification: async (data: ResendVerificationReq): Promise<AuthRes> => {
        const response = await api.post(API_ROUTES.AUTH.RESEND_VERIFICATION, data);
        return response.data;
    },
}

export default authService;