import API_ROUTES from "@/conf/constants/api-routes";
import type { AuthRes, LoginReq, RegisterReq, LogoutRes, VerifyEmailReq, VerifyEmailCodeReq, ResendVerificationReq, RefreshReq } from "@/types/core/auth";
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
    logout: async (refreshToken?: string): Promise<LogoutRes> => {
        const response = await api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken });
        return response.data;
    },
    refresh: async (data: RefreshReq): Promise<AuthRes> => {
        const response = await api.post(API_ROUTES.AUTH.REFRESH, data);
        return response.data;
    },
    verifyEmail: async (data: VerifyEmailReq): Promise<AuthRes> => {
        const response = await api.get(API_ROUTES.AUTH.VERIFY_EMAIL, {
            params: { token: data.token },
        });
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
