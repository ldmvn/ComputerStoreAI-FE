import type { MetadataRoute } from 'next';
import { SERVER_API_BASE_URL } from '@/services/http.client';
import { SITE_URL } from '@/lib/site';

// Lấy dữ liệu động từ backend nên phải sinh lúc có yêu cầu; kết quả được lưu đệm 1 giờ.
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

const STATIC_PATHS = [
  '/', '/customer/products', '/customer/build-pc', '/customer/build-pc/ai', '/customer/build-pc/manual',
  '/about', '/faq', '/guide', '/shipping', '/returns', '/stores', '/support', '/blog', '/careers',
  '/policy/warranty', '/policy/return', '/policy/payment', '/policy/privacy', '/policy/terms',
];

type ProductRow = { slug: string; updatedAt?: string };
type CategoryRow = { slug: string; children?: { slug: string }[] };

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}${path}`, { next: { revalidate: 3600 } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(path => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '/' ? 'daily' : 'monthly',
    priority: path === '/' ? 1 : 0.6,
  }));

  const categories = await fetchJson<{ categories: CategoryRow[] }>('/categories');
  for (const category of categories?.categories ?? []) {
    entries.push({ url: `${SITE_URL}/customer/products?category=${encodeURIComponent(category.slug)}`, changeFrequency: 'daily', priority: 0.8 });
    for (const child of category.children ?? []) {
      entries.push({ url: `${SITE_URL}/customer/products?category=${encodeURIComponent(child.slug)}`, changeFrequency: 'daily', priority: 0.7 });
    }
  }

  for (let page = 1; page <= 50; page++) {
    const result = await fetchJson<{ products: ProductRow[]; meta: { totalPages: number } }>(`/products?limit=100&page=${page}`);
    if (!result) break;
    for (const product of result.products) {
      entries.push({
        url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
    if (page >= result.meta.totalPages) break;
  }

  return entries;
}
