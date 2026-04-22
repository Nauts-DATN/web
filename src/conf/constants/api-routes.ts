/**
 * Đường dẫn API (relative tới origin). Dev: Vite proxy `/api` → backend.
 * Production: cùng origin hoặc set `VITE_API_URL` trỏ tới backend gốc.
 */
const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
    VERIFY_EMAIL: "/api/auth/verify-email",
    VERIFY_EMAIL_CODE: "/api/auth/verify-email-code",
    RESEND_VERIFICATION: "/api/auth/resend-verification",
    LOGOUT: "/api/auth/logout",
  },
  DOCUMENTS: {
    BASE: "/api/documents",
    BY_ID: (id: string) => `/api/documents/${id}`,
    DOWNLOAD: (id: string) => `/api/documents/${id}/download`,
    PRESIGNED_URL: (id: string) => `/api/documents/${id}/presigned-url`,
  },
  CATEGORIES: {
    BASE: "/api/categories",
    BY_ID: (id: string) => `/api/categories/${id}`,
  },
  COURSES: {
    BASE: "/api/courses",
    BY_ID: (id: string) => `/api/courses/${id}`,
  },
} as const

export default API_ROUTES
