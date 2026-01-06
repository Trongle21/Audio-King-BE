// Tạo slug chuẩn SEO từ name
export const slugify = (str = '') => {
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // thay khoảng trắng & ký tự đặc biệt bằng -
    .replace(/^-+|-+$/g, ''); // bỏ - ở đầu/cuối
};

// Tạo slug cho product từ name, sku, description
export const generateProductSlug = (name = '', sku = '', description = '') => {
  const nameSlug = slugify(name);
  const skuSlug = slugify(sku);
  const descSlug = slugify(description.slice(0, 50)); // lấy 50 ký tự đầu của description

  const parts = [nameSlug, skuSlug];
  if (descSlug) {
    parts.push(descSlug);
  }

  return parts.filter(Boolean).join('-');
};

// Tạo slug cho category từ name (để đồng bộ 1 chỗ)
export const generateCategorySlug = (name = '') => {
  return slugify(name);
};
