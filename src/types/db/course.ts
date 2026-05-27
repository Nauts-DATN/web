export type Course = {
    id: string;
    name: string;
    description?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
};

export type CourseBody = {
    name: string;
    description?: string;
};

