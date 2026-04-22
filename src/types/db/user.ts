export const UserRole = {
    ADMIN: "admin",
    USER: "user",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type User = {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: UserRole;
    emailVerified: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
};
  
