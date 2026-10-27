import { BASE_URL, TIMEOUT } from '../config';
import type { ApiError, HttpMethod } from '../types';

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<ApiError>;
  return (
    (candidate.type === 'network' || candidate.type === 'timeout' || candidate.type === 'http') &&
    typeof candidate.message === 'string'
  );
}

/** Chuẩn hóa mọi lỗi bắt được về dạng ApiError. */
export function toApiError(value: unknown): ApiError {
  if (isApiError(value)) {
    return value;
  }
  return {
    type: 'network',
    status: null,
    message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.',
  };
}

function httpMessage(status: number): string {
  if (status === 404) {
    return 'Không tìm thấy dữ liệu yêu cầu.';
  }
  if (status >= 500) {
    return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
  }
  return `Yêu cầu không thành công (mã lỗi ${status}).`;
}

/**
 * Gọi API và trả về dữ liệu JSON.
 * Lỗi được ném ra dưới dạng { type: 'network' | 'timeout' | 'http', status, message }.
 */
export async function request<T>(method: HttpMethod, url: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT);

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error: ApiError = {
        type: 'http',
        status: response.status,
        message: httpMessage(response.status),
      };
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch {
      const error: ApiError = {
        type: 'http',
        status: response.status,
        message: 'Dữ liệu máy chủ trả về không hợp lệ.',
      };
      throw error;
    }
  } catch (caught) {
    if (isApiError(caught)) {
      throw caught;
    }
    if (timedOut) {
      const error: ApiError = {
        type: 'timeout',
        status: null,
        message: 'Máy chủ phản hồi quá chậm. Vui lòng thử lại.',
      };
      throw error;
    }
    throw toApiError(caught);
  } finally {
    clearTimeout(timer);
  }
}
