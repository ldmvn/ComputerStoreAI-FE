import type { Metadata } from 'next';
import CustomerShell from '@/components/layout/CustomerShell';
import ProductDetail from '@/components/product/ProductDetail';
import { SERVER_API_BASE_URL } from '@/services/http.client';
import { SITE_BRAND, SITE_URL } from '@/lib/site';

type SeoProduct = {
  name: string;
  slug: string;
  sku?: string;
  shortDescription?: string | null;
  price: number;
  stockQuantity: number;
  primaryImage?: string | null;
  brand?: string | null;
};

// Chạy phía server nên trình thu thập (Google) nhận được tên/mô tả/giá của đúng sản phẩm,
// không phụ thuộc phần giao diện tải bằng JavaScript. fetch giống nhau trong một lượt render được Next gộp lại.
async function getProductForSeo(slug: string): Promise<SeoProduct | null> {
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}/products/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return ((await res.json()) as { product: SeoProduct }).product;
  } catch {
    return null;
  }
}

const absoluteImage = (url?: string | null) => (url ? (/^https?:\/\//i.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`) : undefined);

function describe(product: SeoProduct) {
  const text = product.shortDescription?.trim()
    || `${product.name}. Giá ${product.price.toLocaleString('vi-VN')}đ. ${product.stockQuantity > 0 ? 'Còn hàng' : 'Liên hệ để biết tình trạng'}, bảo hành chính hãng, giao hàng toàn quốc tại ${SITE_BRAND}.`;
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductForSeo(params.slug);
  if (!product) return { title: `Không tìm thấy sản phẩm — ${SITE_BRAND}`, robots: { index: false, follow: false } };

  const title = `${product.name} — ${SITE_BRAND}`;
  const description = describe(product);
  const image = absoluteImage(product.primaryImage);
  const url = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: 'website', siteName: SITE_BRAND, url, ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductForSeo(params.slug);
  const image = absoluteImage(product?.primaryImage);
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(image ? { image: [image] } : {}),
    description: describe(product),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
      priceCurrency: 'VND',
      price: product.price,
      availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  } : null;

  return (
    <CustomerShell contentClassName="container mx-auto min-w-0 flex-1 px-4 py-6 sm:py-8">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
      <ProductDetail slug={params.slug} />
    </CustomerShell>
  );
}
