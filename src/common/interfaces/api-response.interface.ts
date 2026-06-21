/**
 * Standard API envelope returned by every controller.
 */
export interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  message: string;
}
