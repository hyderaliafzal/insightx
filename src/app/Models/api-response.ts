export interface ApiResponse<T> {
  data: T;
  total: number;
  message: string;
  success: boolean;
}
