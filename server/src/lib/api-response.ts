export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export function success<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

export function failure(message: string): ApiResponse<null> {
  return { success: false, data: null, error: message };
}
