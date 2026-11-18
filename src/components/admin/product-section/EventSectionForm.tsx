'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { EVENT_ICONS, EVENT_THEMES, eventBadgeStyle, eventIcon, eventTheme } from '@/components/home/product-section/eventThemes';
import type { EventIcon, EventSectionInput, EventTheme, ProductSection } from '@/types/productSection.type';

function slugify(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// <input type="datetime-local"> dùng giờ địa phương của trình duyệt; backend lưu ISO (UTC).
const pad = (n: number) => String(n).padStart(2, '0');
const toLocalInput = (iso?: string | null) => {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toIso = (local: string) => { const d = new Date(local); return Number.isNaN(d.getTime()) ? '' : d.toISOString(); };

const inputCls = 'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm';

export default function EventSectionForm({ section, busy, onClose, onSave }: {
  section?: ProductSection;
  busy: boolean;
  onClose: () => void;
  onSave: (input: EventSectionInput) => void;
}) {
  const [name, setName] = useState(section?.name || 'FLASH SALE GIÁ SỐC');
  const [badge, setBadge] = useState(section?.badge || '');
  const [promoTitle, setPromoTitle] = useState(section?.promoTitle || '');
  const [subtitle, setSubtitle] = useState(section?.subtitle || '');
  const [slug, setSlug] = useState(section?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(section));
  const [theme, setTheme] = useState<EventTheme>(section?.eventTheme || 'nha-giao');
  const [icon, setIcon] = useState<EventIcon>(section?.eventIcon || 'cap');
  const [startsAt, setStartsAt] = useState(() => toLocalInput(section?.startsAt) || toLocalInput(new Date().toISOString()));
  const [endsAt, setEndsAt] = useState(() => toLocalInput(section?.endsAt) || toLocalInput(new Date(Date.now() + 3 * 86_400_000).toISOString()));
  const [viewAllUrl, setViewAllUrl] = useState(section?.viewAllUrl || '');
  const [sortOrder, setSortOrder] = useState(String(section?.sortOrder || 0));
  const [isActive, setIsActive] = useState(section?.isActive ?? true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(`su-kien ${badge || name} ${promoTitle}`));
  }, [badge, name, promoTitle, slugTouched]);

  const t = eventTheme(theme);
  const Icon = eventIcon(icon).Icon;
  const bs = eventBadgeStyle(t);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const start = toIso(startsAt);
    const end = toIso(endsAt);
    if (!start || !end) { setError('Hãy chọn thời gian bắt đầu và kết thúc.'); return; }
    if (new Date(end) <= new Date(start)) { setError('Thời gian kết thúc phải sau thời gian bắt đầu.'); return; }
    setError('');
    onSave({
      type: 'EVENT_SECTION', name, slug, badge, promoTitle, subtitle, viewAllUrl,
      eventTheme: theme, eventIcon: icon, startsAt: start, endsAt: end,
      sortOrder: Number(sortOrder) || 0, isActive,
    });
  };

  return (
    <Modal title={section ? 'Sửa khối sự kiện' : 'Tạo khối sự kiện'} onClose={onClose} busy={busy} size="lg">
      <form onSubmit={submit} className="space-y-5">
        {/* Xem trước phần đầu khối theo chủ đề đang chọn */}
        <div className="rounded-xl p-4 pt-7" style={{ background: `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]} 60%, ${t.bg[2]})` }} aria-label="Xem trước">
          <div className="-mt-12 mb-3 flex justify-center">
            <span className="rounded-b-md px-8 py-1.5 text-lg font-black italic text-white" style={{ background: 'linear-gradient(#fde68a, #e9a62f)', textShadow: `0 2px 0 ${t.ribbonShadow}, 0 0 6px ${t.ribbonShadow}` }}>{name || 'TÊN Ở GIỮA'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {badge.trim() && (
              <span className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm font-black" style={{ background: bs.background, border: `2px solid ${bs.border}`, color: bs.text }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: bs.iconBg, color: bs.iconFg }}><Icon className="h-3.5 w-3.5" aria-hidden /></span>
                {badge.toUpperCase()} {promoTitle && <span style={{ color: bs.hi }}>{promoTitle.toUpperCase()}</span>}
              </span>
            )}
            {subtitle && <span className="text-sm font-bold text-white">{subtitle}</span>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Tên ở giữa (trên ruy băng)
            <input required value={name} onChange={e => setName(e.target.value)} maxLength={150} className={inputCls} placeholder="FLASH SALE GIÁ SỐC" /></label>
          <label className="block text-sm font-medium text-slate-700">Tên sự kiện (để trống thì không hiện khung này)
            <input value={badge} onChange={e => setBadge(e.target.value)} maxLength={100} className={inputCls} placeholder="Nhân ngày Nhà giáo Việt Nam" /></label>
          <label className="block text-sm font-medium text-slate-700">Phần nhấn (màu vàng, không bắt buộc)
            <input value={promoTitle} onChange={e => setPromoTitle(e.target.value)} maxLength={40} className={inputCls} placeholder="20/11" /></label>
          <label className="block text-sm font-medium text-slate-700">Câu phụ (không bắt buộc)
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} maxLength={191} className={inputCls} placeholder="Ưu đãi tri ân thầy cô" /></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Bắt đầu
            <input required type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className={inputCls} /></label>
          <label className="block text-sm font-medium text-slate-700">Kết thúc (đồng hồ đếm ngược chạy tới giờ này)
            <input required type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} className={inputCls} /></label>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Chủ đề màu</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(Object.keys(EVENT_THEMES) as EventTheme[]).map(id => (
              <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${theme === id ? 'border-primary-500 bg-primary-50 font-medium text-primary-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <input type="radio" name="event-theme" checked={theme === id} onChange={() => setTheme(id)} className="accent-primary-600" />
                <span className="h-5 w-10 shrink-0 rounded" style={{ background: `linear-gradient(90deg, ${EVENT_THEMES[id].bg[0]}, ${EVENT_THEMES[id].bg[2]})` }} aria-hidden />
                {EVENT_THEMES[id].label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Biểu tượng</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(EVENT_ICONS) as EventIcon[]).map(id => {
              const I = EVENT_ICONS[id].Icon;
              return (
                <label key={id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${icon === id ? 'border-primary-500 bg-primary-50 font-medium text-primary-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  <input type="radio" name="event-icon" checked={icon === id} onChange={() => setIcon(id)} className="sr-only" />
                  <I className="h-4 w-4" aria-hidden />{EVENT_ICONS[id].label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium text-slate-700">Slug
            <input required value={slug} onChange={e => { setSlugTouched(true); setSlug(e.target.value); }} className={inputCls} /></label>
          <label className="block text-sm font-medium text-slate-700">Link Xem tất cả
            <input value={viewAllUrl} onChange={e => setViewAllUrl(e.target.value)} className={inputCls} placeholder="Mặc định: các sản phẩm trong khối này" /></label>
          <label className="block text-sm font-medium text-slate-700">Thứ tự hiển thị
            <input type="number" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={inputCls} /></label>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" /> Bật khối (chỉ hiện trên trang chủ trong thời gian sự kiện)
        </label>
        <p className="text-xs text-slate-500">Sản phẩm thêm sau khi tạo khối: bấm mũi tên mở rộng khối rồi chọn &ldquo;Thêm sản phẩm&rdquo;. Giá và giá gạch ngang lấy từ giá sản phẩm.</p>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className="ui-button ui-button--neutral rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium">Hủy</button>
          <button type="submit" disabled={busy} className="ui-button ui-button--primary rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Đang lưu...' : 'Lưu khối'}</button>
        </div>
      </form>
    </Modal>
  );
}
