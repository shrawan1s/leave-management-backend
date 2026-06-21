import type { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Creates the standard success response envelope used by controllers.
 */
export function createApiResponse<TData>(
  data: TData,
  message: string,
): ApiResponse<TData> {
  return {
    success: true,
    data,
    message,
  };
}
