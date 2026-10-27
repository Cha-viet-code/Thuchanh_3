/** Lấy thông báo lỗi tiếng Việt từ một lỗi bất kỳ (kể cả đối tượng ApiError). */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string' && message !== '') {
      return message;
    }
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
