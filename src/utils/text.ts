/** Chuyển về chữ thường, bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
