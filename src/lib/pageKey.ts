import type { AiPageKey } from '@/types/ai.type';

// The one place that maps a storefront URL to the page key the chatbot understands.
export function pageKeyFromPath(pathname: string | null | undefined, search?: string | null): AiPageKey {
  if (!pathname) return 'other';
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  if (path === '/') return 'home';
  if (/^\/products\/[^/]+$/.test(path)) return 'product_detail';
  if (path === '/customer/products') return new URLSearchParams(search ?? '').get('search')?.trim() ? 'search' : 'product_list';
  if (path === '/customer/cart') return 'cart';
  if (path === '/customer/checkout') return 'checkout';
  if (path === '/customer/profile/orders') return 'order_history';
  if (/^\/customer\/(profile\/)?orders\/[^/]+$/.test(path)) return 'order_detail';
  if (path === '/customer/wishlist') return 'wishlist';
  if (path === '/customer/build-pc/ai') return 'ai_build_pc';
  if (path === '/customer/build-pc' || path === '/customer/build-pc/manual') return 'build_pc';
  if (path === '/customer/profile' || path.startsWith('/customer/profile/')) return 'account';
  if (path === '/login' || path === '/forgot-password' || path.startsWith('/auth/')) return 'auth';
  if (path.startsWith('/policy/') || ['/faq', '/guide', '/returns', '/shipping'].includes(path)) return 'policy';
  return 'other';
}
