'use client';
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useCartStore } from '@/store/cart.store';
import { mediaUrl } from '@/services/http.client';
import { formatProductPrice, productDetailHref } from '@/lib/product';
import type { Product } from '@/types/product.type';
import type { ProductSection, SectionProduct } from '@/types/productSection.type';
import { eventIcon, eventTheme } from './eventThemes';

const pad = (n: number) => String(n).padStart(2, '0');

// Đếm ngược tới giờ kết thúc; trả về null khi đã hết giờ (khối tự ẩn, backend cũng thôi trả khối này).
function useCountdown(endsAt?: string | null) {
  const end = endsAt ? new Date(endsAt).getTime() : 0;
  const [left, setLeft] = useState(() => Math.max(0, end - Date.now()));
  useEffect(() => {
    if (!end) return;
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [end]);
  if (!end || left <= 0) return null;
  const total = Math.floor(left / 1000);
  return { days: Math.floor(total / 86400), hours: Math.floor((total % 86400) / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60 };
}

// Bước cuộn = độ rộng một thẻ + khoảng cách 10px giữa các thẻ.
function cardStep(el: HTMLElement) {
  const first = el.children[0] as HTMLElement | undefined;
  return first ? first.offsetWidth + 10 : el.clientWidth * 0.8;
}

// Độ rộng của một bộ sản phẩm gốc = khoảng cách từ thẻ đầu tới thẻ đầu của bộ nhân đôi.
function loopWidth(el: HTMLElement, count: number) {
  const first = el.children[0] as HTMLElement | undefined;
  const clone = el.children[count] as HTMLElement | undefined;
  return first && clone ? clone.offsetLeft - first.offsetLeft : 0;
}

function normalizeLoop(el: HTMLElement, count: number) {
  const width = loopWidth(el, count);
  if (width > 0 && el.scrollLeft >= width - 1) el.scrollLeft -= width;
}

function EventCard({ product, accent, soft }: { product: SectionProduct; accent: string; soft: string }) {
  const toast = useToast();
  const addItem = useCartStore(state => state.addItem);
  const original = product.originalPrice;
  const discounted = typeof original === 'number' && original > product.price && product.price >= 0;
  const percent = discounted ? Math.round(((original - product.price) / original) * 100) : 0;
  const soldOut = typeof product.stockQuantity === 'number' && product.stockQuantity <= 0;
  const href = product.slug ? productDetailHref(product.slug) : undefined;

  const add = () => {
    // Giỏ hàng chỉ cần id, tên, slug, giá, ảnh và tồn kho; khối sự kiện đã có đủ các trường này.
    const ok = addItem(product as unknown as Product);
    if (ok) toast.success('Đã thêm vào giỏ hàng', product.name);
    else toast.error('Không thể thêm', 'Số lượng trong giỏ đã đạt mức tồn kho.');
  };

  const image = (
    <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-md" style={{ background: soft }}>
      {product.primaryImage
        ? <img src={mediaUrl(product.primaryImage)} alt={product.name} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105 motion-reduce:transform-none" />
        : <PackageOpen className="h-10 w-10 text-slate-300" aria-hidden />}
      {discounted && percent >= 1 && (
        <span className="absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[11px] font-extrabold text-white" style={{ background: accent }}>-{percent}%</span>
      )}
    </div>
  );

  return (
    <article className="group flex min-w-0 flex-col rounded-lg bg-white p-2 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none">
      {href ? <Link href={href} aria-label={`Xem chi tiết ${product.name}`}>{image}</Link> : image}
      <h3 className="mt-2 line-clamp-2 h-9 text-[13px] font-semibold leading-[1.35] text-slate-900" title={product.name}>
        {href ? <Link href={href}>{product.name}</Link> : product.name}
      </h3>
      <p className="mt-1.5 text-[17px] font-extrabold" style={{ color: accent }}><span className="sr-only">Giá bán </span>{formatProductPrice(product.price)}</p>
      <p className="h-4 text-xs text-slate-400">{discounted && <del><span className="sr-only">Giá gốc </span>{formatProductPrice(original)}</del>}</p>
      <button
        type="button"
        disabled={soldOut}
        onClick={add}
        className="mt-2 h-9 w-full rounded-full text-[13px] font-bold text-white shadow-[0_3px_0_rgba(0,0,0,0.22)] transition active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
        style={soldOut ? undefined : { background: accent }}
      >
        {soldOut ? 'Hết hàng' : 'Thêm vào giỏ'}
      </button>
    </article>
  );
}

export default function EventSection({ section }: { section: ProductSection }) {
  const theme = eventTheme(section.eventTheme);
  const { Icon } = eventIcon(section.eventIcon);
  const countdown = useCountdown(section.endsAt);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = section.products.length;
  // Khi sản phẩm nhiều hơn số thẻ vừa khung, nhân đôi danh sách để chạy nối tiếp vô tận, không có điểm "giật về đầu".
  const [loop, setLoop] = useState(false);
  // Tạm dừng tự chạy khi khách đang rê chuột, chạm hoặc focus vào hàng sản phẩm.
  const pausedRef = useRef(false);

  // Phát hiện có cần chạy không: tổng độ rộng các thẻ gốc lớn hơn khung nhìn thì mới nhân đôi.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => setLoop(cardStep(el) * count > el.clientWidth + 2);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  // Khi cuộn tới bộ nhân đôi thì lặng lẽ nhảy về vị trí tương ứng ở bộ gốc (hai bộ giống hệt nhau nên mắt không thấy gì).
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !loop) return;
    let timer = 0;
    const onScroll = () => { window.clearTimeout(timer); timer = window.setTimeout(() => normalizeLoop(el, count), 120); };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.clearTimeout(timer); el.removeEventListener('scroll', onScroll); };
  }, [loop, count]);

  // Tự chạy sang sản phẩm tiếp theo mỗi 3 giây, nối tiếp liên tục. Không chạy khi tab đang ẩn, khi khách đang tương tác
  // với hàng sản phẩm, hoặc khi hệ điều hành bật chế độ giảm chuyển động.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !loop || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      el.scrollBy({ left: cardStep(el), behavior: 'smooth' });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loop]);

  if (!countdown) return null;

  const scroll = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = cardStep(el);
    // Đang ở đầu bộ gốc mà bấm lùi: nhảy sang vị trí tương ứng ở bộ nhân đôi rồi mới lùi, để lùi cũng nối tiếp.
    if (loop && direction === -1 && el.scrollLeft < step) {
      const width = loopWidth(el, count);
      if (width > 0) el.scrollLeft += width;
    }
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const box = 'inline-flex h-7 min-w-8 items-center justify-center rounded-[5px] bg-white px-1.5 text-[15px] font-extrabold';

  return (
    <section
      className="relative mt-9 min-w-0 rounded-2xl px-3 pb-4 pt-4 sm:px-4"
      style={{ background: `linear-gradient(135deg, ${theme.bg[0]} 0%, ${theme.bg[1]} 60%, ${theme.bg[2]} 100%)` }}
      aria-labelledby={`event-${section.id}`}
    >
      {/* Ruy băng vàng nổi lên trên mép khối */}
      <div className="pointer-events-none absolute left-1/2 top-[-26px] z-10 h-14 w-[min(480px,92%)] -translate-x-1/2 sm:h-16">
        <span className="absolute left-[-2px] top-0 h-4 w-6 bg-[#7c2d12]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} aria-hidden />
        <span className="absolute right-[-2px] top-0 h-4 w-6 bg-[#7c2d12]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} aria-hidden />
        <div className="absolute inset-0 drop-shadow-md" aria-hidden>
          <div className="h-full w-full" style={{ background: 'linear-gradient(#fde68a 0%, #f6c859 55%, #e9a62f 100%)', clipPath: 'polygon(3% 0, 97% 0, 100% 100%, 0 100%)' }} />
        </div>
        {/* Đồng hồ báo thức (ảnh trong suốt ở public/icons) nổi lên khỏi mép ruy băng và rung lắc theo .event-alarm */}
        <img
          src="/icons/alarm-clock.png"
          alt=""
          aria-hidden="true"
          width={78}
          height={78}
          className="event-alarm absolute -top-4 left-[4%] h-[68px] w-[68px] object-contain drop-shadow-md sm:h-[80px] sm:w-[80px]"
        />
        <h2
          id={`event-${section.id}`}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap pl-16 text-lg font-black italic leading-none text-white sm:pl-24 sm:text-[28px]"
          style={{ textShadow: `0 2px 0 ${theme.ribbonShadow}, 0 0 8px ${theme.ribbonShadow}, 2px 2px 0 ${theme.ribbonShadow}, -2px 2px 0 ${theme.ribbonShadow}` }}
        >
          {section.name}
        </h2>
      </div>

      {/* Dòng sự kiện + đồng hồ đếm ngược */}
      <div className="mb-3 mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-white sm:mt-9">
        <span
          className="inline-flex items-center gap-2 rounded-full py-1 pl-1.5 pr-4 text-sm font-black tracking-wide shadow-md sm:text-[17px]"
          style={{ background: `linear-gradient(135deg, ${theme.badge.bg[0]}, ${theme.badge.bg[1]})`, border: `2px solid ${theme.badge.border}`, color: theme.badge.text }}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: theme.badge.iconBg, color: theme.badge.iconFg }}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="uppercase">
            {section.badge}{section.promoTitle && <> <b className="text-[1.15em]" style={{ color: theme.badge.hi }}>{section.promoTitle}</b></>}
          </span>
        </span>
        {section.subtitle && <span className="text-sm font-bold text-white/95 sm:text-base" style={{ textShadow: '0 1px 0 rgba(0,0,0,.3)' }}>{section.subtitle}</span>}

        <div className="ml-auto flex flex-wrap items-center gap-1.5 text-sm font-bold" role="timer" aria-label="Thời gian còn lại của sự kiện">
          <span className="mr-1">Kết thúc sau</span>
          {countdown.days > 0 && <span className={`${box} px-2`} style={{ color: theme.countText }}>{pad(countdown.days)} Ngày</span>}
          <span className={box} style={{ color: theme.countText }}>{pad(countdown.hours)}</span>:
          <span className={box} style={{ color: theme.countText }}>{pad(countdown.minutes)}</span>:
          <span className={box} style={{ color: theme.countText }}>{pad(countdown.seconds)}</span>
          {section.viewAllUrl && (
            <Link href={section.viewAllUrl} className="ml-3 border-l border-white/45 pl-3 text-sm font-bold text-white hover:underline">Xem tất cả ›</Link>
          )}
        </div>
      </div>

      {/* Hàng thẻ sản phẩm, cuộn ngang */}
      <div
        className="relative"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onFocus={() => { pausedRef.current = true; }}
        onBlur={() => { pausedRef.current = false; }}
        onTouchStart={() => { pausedRef.current = true; }}
        onTouchEnd={() => { window.setTimeout(() => { pausedRef.current = false; }, 4000); }}
      >
        <div
          ref={trackRef}
          className="relative -my-2 grid snap-x snap-mandatory py-2 auto-cols-[calc((100%-10px)/2)] grid-flow-col gap-[10px] overflow-x-auto [scrollbar-width:none] sm:auto-cols-[calc((100%-20px)/3)] lg:auto-cols-[calc((100%-40px)/5)] xl:auto-cols-[calc((100%-50px)/6)] [&::-webkit-scrollbar]:hidden"
        >
          {section.products.map(product => (
            <div key={product.id} className="snap-start"><EventCard product={product} accent={theme.accent} soft={theme.soft} /></div>
          ))}
          {/* Bộ nhân đôi để nối tiếp vòng lặp: ẩn khỏi trình đọc màn hình và không cho focus bằng bàn phím */}
          {loop && section.products.map(product => (
            <div key={`loop-${product.id}`} className="snap-start" aria-hidden="true" {...({ inert: '' } as object)}>
              <EventCard product={product} accent={theme.accent} soft={theme.soft} />
            </div>
          ))}
        </div>
        {loop && (
          <>
            <button type="button" onClick={() => scroll(-1)} aria-label="Trước" className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg sm:flex">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="Tiếp" className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg sm:flex">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
