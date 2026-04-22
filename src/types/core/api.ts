export type ApiResponse<T> = {
    status: number;
    error: unknown;
    isSuccess: boolean;
    data: T | null;
  };

