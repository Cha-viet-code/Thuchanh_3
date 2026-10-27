import { Platform } from 'react-native';

/**
 * Chạy bằng điện thoại thật: điền IP LAN của máy tính, ví dụ '192.168.1.10'.
 * Để trống khi dùng máy ảo (Android emulator dùng 10.0.2.2, iOS simulator dùng localhost).
 */
const LAN_IP = '192.168.1.10'; // IP máy tính của bạn

const HOST = LAN_IP || 'localhost';

export const BASE_URL = `http://${HOST}:3000`;

/** Thời gian chờ tối đa cho mỗi request (ms). */
export const TIMEOUT = 10000;

/** Trong khoảng này (ms) sau lần tải thành công, mở lại màn hình không gọi API lại. */
export const CACHE_TTL = 60 * 1000;

/** Id sinh viên đang đăng nhập (đề bài dùng /students/1). */
export const STUDENT_ID = 1;
