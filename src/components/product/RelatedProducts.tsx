'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getRelatedProducts } from '@/services/product.service';
import type { Product } from '@/types/product.type';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import CatalogProductCard from './CatalogProductCard';

type State = { slug: string; status: 'loading' | 'ready' | 'hidden'; products: Product[] };

const FETCH_LIMIT = 12;
// Cùng quy chuẩn carousel sản phẩm trang chủ: 2 / 3 / 4 / 5 / 6 thẻ mỗi lần nhìn.
const TRACK = 'flex snap-x snap-proximity gap-[var(--gap)] overflow-x-auto overscroll-x-contain py-1 [--gap:8px] [--n:2] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:[--gap:10px] sm:[--n:3] md:[--gap:12px] md:[--n:4] lg:[--gap:14px] lg:[--n:5] xl:[--n:6]';
const SLOT = 'min-w-0 shrink-0 grow-0 snap-start basis-[calc((100%_-_(var(--n)_-_1)_*_var(--gap))_/_var(--n))]';
const ARROW = 'absolute top-1/2 z-10 hidden h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:border-orange-200 hover:text-orange-700 disabled:cursor-default disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 md:flex';

function RelatedCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); observer.disconnect(); };
  }, [checkScroll, products]);

  const scroll = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="relative min-w-0">
      <div ref={trackRef} className={TRACK}>
        {products.map(product => (
          <div key={product.id} className={SLOT}><CatalogProductCard product={product} /></div>
        ))}
      </div>
      {(canPrev || canNext) && (
        <>
          <button type="button" className={`${ARROW} -left-3`} disabled={!canPrev} onClick={() => scroll(-1)} aria-label="Sản phẩm trước">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className={`${ARROW} -right-3`} disabled={!canNext} onClick={() => scroll(1)} aria-label="Sản phẩm tiếp theo">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

export default function RelatedProducts({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ slug, status: 'loading', products: [] });

  useEffect(() => {
    const controller = new AbortController();
    setState({ slug, status: 'loading', products: [] });
    getRelatedProducts(slug, FETCH_LIMIT, controller.signal)
      .then(({ products }) => {
        if (controller.signal.aborted) return;
        setState({ slug, status: products.length ? 'ready' : 'hidden', products });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ slug, status: 'hidden', products: [] });
      });
    return () => controller.abort();
  }, [slug]);

  if (state.slug !== slug || state.status === 'loading') {
    return (
      <section aria-busy="true" aria-label="Đang tải sản phẩm tương tự" className="mt-6 sm:mt-8">
        <Skeleton className="mb-4 h-7 w-56 rounded-lg" />
        <div className={`${TRACK} overflow-hidden`}>
          {Array.from({ length: 6 }, (_, index) => <div key={index} className={SLOT}><ProductCardSkeleton /></div>)}
        </div>
      </section>
    );
  }
  if (state.status === 'hidden') return null;

  return (
    <section aria-labelledby="related-products-heading" className="mt-6 sm:mt-8">
      <h2 id="related-products-heading" className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl">Sản phẩm tương tự</h2>
      <RelatedCarousel products={state.products} />
    </section>
  );
}
