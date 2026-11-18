'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Check, Flame, PackageOpen, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types/product.type';
import { mediaUrl } from '@/services/http.client';
import { formatProductPrice, productDetailHref } from '@/lib/product';
import { useCartStore } from '@/store/cart.store';
import { useToast } from '@/components/ui/Toast';

const STOCK_STATUS: Record<string, { label: string; cls: string }> = {
  OUT_OF_STOCK: { label: 'Hết hàng', cls: 'text-slate-400' },
  LOW_STOCK: { label: 'Sắp hết hàng', cls: 'text-amber-600' },
};

export default function CatalogProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem);
  const toast = useToast();

  const specs = (product.highlightSpecs ?? [])
    .filter(s => s.content.trim())
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, 3);

  const discounted =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.price &&
    product.price >= 0;
  const discount = discounted
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const outOfStock = product.stockStatus === 'OUT_OF_STOCK' || product.stockQuantity <= 0;
  const stock = STOCK_STATUS[product.stockStatus] ?? { label: 'Sẵn hàng', cls: 'text-emerald-600' };

  const addToCart = () => {
    if (addItem(product)) toast.success('Đã thêm vào giỏ hàng', product.name);
    else toast.error('Không thể thêm', 'Sản phẩm đã hết hàng hoặc số lượng trong giỏ đã đạt mức tồn kho.');
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-primary-200 hover:shadow-md hover:shadow-slate-900/[0.06]">
      {/* Image */}
      <div className="relative">
        <Link href={productDetailHref(product.slug)} tabIndex={-1} aria-hidden="true">
          <div className="relative aspect-square w-full overflow-hidden bg-slate-50 p-2 sm:p-3">
            {product.primaryImage ? (
              <img
                src={mediaUrl(product.primaryImage)}
                alt={product.name}
                className="h-full w-full object-contain transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:-translate-y-[5px] group-hover:scale-[1.05] motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PackageOpen className="h-10 w-10 text-slate-300" aria-hidden="true" />
              </div>
            )}
          </div>
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          {product.isHot && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-red-500 to-orange-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              <Flame className="h-3 w-3 fill-current" aria-hidden="true" />
              Hot
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-2 sm:gap-2 sm:p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
          <Link
            href={productDetailHref(product.slug)}
            className="hover:text-primary-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            aria-label={`Xem chi tiết ${product.name}`}
          >
            {product.name}
          </Link>
        </h3>

        {specs.length > 0 && (
          <ul
            className="hidden flex-col gap-0.5 rounded-lg bg-slate-50 px-2.5 py-2 sm:flex"
            aria-label="Thông số nổi bật"
          >
            {specs.map((s, i) => (
              <li key={s.id ?? i} className="truncate text-[11px] leading-relaxed text-slate-500">
                • {s.content}
              </li>
            ))}
          </ul>
        )}

        {/* Pricing — pushed to bottom */}
        <div className="mt-auto flex flex-col gap-0.5 pt-1">
          {discounted && (
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-400">
              <del>{formatProductPrice(product.originalPrice!)}</del>
              {discount >= 1 && (
                <span className="whitespace-nowrap rounded-full bg-orange-100 px-1.5 py-px text-[11px] font-semibold text-primary-600">Tiết kiệm {discount}%</span>
              )}
            </p>
          )}
          <p className="text-sm font-bold text-primary-700 sm:text-base">{formatProductPrice(product.price)}</p>
        </div>

        {/* Stock + cart */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <span className={`inline-flex min-w-0 items-center gap-1 text-xs font-medium ${stock.cls}`}>
            {!outOfStock && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            <span className="truncate">{stock.label}</span>
          </span>
          <button
            type="button"
            onClick={addToCart}
            disabled={outOfStock}
            title={outOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            aria-label={outOfStock ? `${product.name} đã hết hàng` : `Thêm ${product.name} vào giỏ hàng`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
