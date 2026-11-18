'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Cpu, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useAuthModal } from '@/store/authModal.store';
import { useCartStore } from '@/store/cart.store';

// Sự kiện để Header mở ngăn kéo danh mục (trạng thái menu nằm trong Header).
export const OPEN_MOBILE_MENU_EVENT = 'open-mobile-category-menu';

const itemBase = 'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors';

export default function MobileBottomNav() {
  const pathname = usePathname() || '';
  const user = useAuthStore(s => s.user);
  const openAuthModal = useAuthModal(s => s.open);
  const cartCount = useCartStore(s => s.items.reduce((sum, item) => sum + item.quantity, 0));

  // Trang thanh toán cần khách tập trung hoàn tất đơn, không hiện thanh điều hướng.
  if (pathname.startsWith('/customer/checkout')) return null;

  const isHome = pathname === '/';
  const isBuildPc = pathname.startsWith('/customer/build-pc');
  const isCart = pathname.startsWith('/customer/cart');
  const isAccount = pathname.startsWith('/customer/profile');
  const color = (active: boolean) => (active ? 'bg-primary-600/10 text-primary-600' : 'text-slate-600 hover:text-primary-600');

  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[55] flex gap-0.5 rounded-full border border-slate-200 bg-white p-1.5 shadow-[0_4px_14px_rgba(15,23,42,0.10)] lg:hidden"
    >
      <Link href="/" className={`${itemBase} ${color(isHome)}`} aria-current={isHome ? 'page' : undefined}>
        <Home className="h-5 w-5" aria-hidden="true" />Trang chủ
      </Link>
      <button type="button" className={`${itemBase} ${color(false)}`} onClick={() => window.dispatchEvent(new Event(OPEN_MOBILE_MENU_EVENT))}>
        <LayoutGrid className="h-5 w-5" aria-hidden="true" />Danh mục
      </button>
      <Link href="/customer/build-pc" className={`${itemBase} ${color(isBuildPc)}`} aria-current={isBuildPc ? 'page' : undefined}>
        <Cpu className="h-5 w-5" aria-hidden="true" />Build PC
      </Link>
      <Link href="/customer/cart" className={`${itemBase} ${color(isCart)}`} aria-current={isCart ? 'page' : undefined}>
        <span className="relative">
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -right-2.5 -top-2 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold leading-none tabular-nums text-white">
              {cartCount > 99 ? '99+' : cartCount}
              <span className="sr-only"> sản phẩm</span>
            </span>
          )}
        </span>
        Giỏ hàng
      </Link>
      {user ? (
        <Link href="/customer/profile" className={`${itemBase} ${color(isAccount)}`} aria-current={isAccount ? 'page' : undefined}>
          <User className="h-5 w-5" aria-hidden="true" />Tài khoản
        </Link>
      ) : (
        <button type="button" className={`${itemBase} ${color(false)}`} onClick={() => openAuthModal()}>
          <User className="h-5 w-5" aria-hidden="true" />Đăng nhập
        </button>
      )}
    </nav>
  );
}
