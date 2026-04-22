import type { User } from "../db/user";
import type { ApiResponse } from "./api";

export type AuthRes = ApiResponse<{
    accessToken?: string;
    /** @deprecated dùng accessToken */
    // token?: string;
    user: Partial<User>;
    emailVerificationRequired?: boolean;
  }>;
export type LoginReq = {
    email: string;
    password: string;
  };
export type RegisterReq = {
    name: string;
    email: string;
    password: string;
  };
export type LogoutRes = ApiResponse<{
    message: string;
  }>;
export type VerifyEmailReq = {
    token: string;
  };
export type VerifyEmailCodeReq = {
    email: string;
    code: string;
  };
export type ResendVerificationReq = {
    email: string;
  };

export type AuthState = {
    token: string | null;
    user: Partial<User> | null;
    isAuthenticated: boolean;
    requiresEmailVerification: boolean;
  };