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
  USERS: {
    UPDATE_NAME: "/api/users/update-name",
    UPDATE_AVATAR: "/api/users/update-avatar",
    UPDATE_PASSWORD: "/api/users/update-password",
    AVATAR: (id: string) => `/api/users/${id}/avatar`,
  },
  DOCUMENTS: {
    BASE: "/api/documents",
    COMMUNITY: "/api/documents/community",
    BY_ID: (id: string) => `/api/documents/${id}`,
    VISIBILITY: (id: string) => `/api/documents/${id}/visibility`,
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
  AI: {
    /** Lấy bản tóm tắt đã lưu (không gọi AI). */
    SUMMARY: (id: string) => `/api/documents/${id}/summary`,
    /** Gọi AI tóm tắt và lưu vào DB. */
    SUMMARIZE: (id: string) => `/api/documents/${id}/summarize`,
    /** Gọi AI tạo quiz và lưu vào DB. */
    GENERATE_QUIZ: (id: string) => `/api/documents/${id}/quiz`,
    /** Danh sách quiz của document. */
    QUIZZES_BY_DOC: (id: string) => `/api/documents/${id}/quizzes`,
    /** Danh sách tất cả quiz của người dùng hiện tại. */
    QUIZZES: "/api/quizzes",
    /** Chi tiết / xóa một quiz theo id. */
    QUIZ_BY_ID: (id: string) => `/api/quizzes/${id}`,
  },
  NOTES: {
    BASE: "/api/notes",
    BY_ID: (id: string) => `/api/notes/${id}`,
    BY_DOCUMENT: (id: string) => `/api/documents/${id}/note`,
  },
  ROADMAPS: {
    BASE: "/api/roadmaps",
    BY_ID: (id: string) => `/api/roadmaps/${id}`,
    TASKS: (id: string) => `/api/roadmaps/${id}/tasks`,
    TASK_BY_ID: (taskId: string) => `/api/roadmaps/tasks/${taskId}`,
    TASK_COMPLETE: (taskId: string) => `/api/roadmaps/tasks/${taskId}/complete`,
    TASK_DOCUMENT: (taskId: string) => `/api/roadmaps/tasks/${taskId}/document`,
  },
} as const

export default API_ROUTES
