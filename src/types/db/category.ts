export type Category = {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
};

export type CategoryBody = {
    name: string;
    description?: string;
};

export type CategoryBodyPartial = Partial<CategoryBody>;
