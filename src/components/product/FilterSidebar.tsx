'use client';
import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { FilterAttribute, FilterBrand } from '@/services/product.service';
import type { PublicCategory } from '@/services/category.service';

const SHOW_LIMIT = 4;

// Renders inside a <ul>: children(limit) returns <li> elements, button wrapped in <li>
function ShowMoreWrapper({ total, activeIndex, children }: {
  total: number;
  activeIndex: number;
  children: (limit: number) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const forceOpen = activeIndex >= SHOW_LIMIT;
  const limit = (expanded || forceOpen) ? total : Math.min(SHOW_LIMIT, total);
  return (
    <>
      {children(limit)}
      {total > SHOW_LIMIT && !forceOpen && (
        <li className="pt-0.5">
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-[11px] font-medium text-primary-700 hover:text-primary-800"
          >
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
            {expanded ? 'Thu gọn' : `Xem thêm (${total - SHOW_LIMIT})`}
          </button>
        </li>
      )}
    </>
  );
}

export interface FilterState {
  brand: string;
  attr: Record<string, string>;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}

interface FilterSidebarProps {
  state: FilterState;
  brands: FilterBrand[];
  attributes: FilterAttribute[];
  priceRange: { min: number | null; max: number | null };
  allCategories: PublicCategory[];
  onNavigate: (changes: Record<string, string>) => void;
  onCategorySelect: (slug: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

type PanelProps = Omit<FilterSidebarProps, 'mobileOpen' | 'onMobileClose'>;


function Collapsible({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-slate-700 hover:text-slate-900"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

function PriceFilter({ min, max, range, onApply }: { min?: number; max?: number; range: { min: number | null; max: number | null }; onApply: (min: string, max: string) => void }) {
  const [localMin, setLocalMin] = useState(min != null ? String(min) : '');
  const [localMax, setLocalMax] = useState(max != null ? String(max) : '');

  useEffect(() => { setLocalMin(min != null ? String(min) : ''); }, [min]);
  useEffect(() => { setLocalMax(max != null ? String(max) : ''); }, [max]);

  const handleApply = () => onApply(localMin, localMax);
  const inputClass = 'w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm tabular-nums focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-300';

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number" min={0} inputMode="numeric"
          placeholder="Từ"
          value={localMin}
          onChange={e => setLocalMin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          aria-label="Giá từ"
          className={inputClass}
        />
        <input
          type="number" min={0} inputMode="numeric"
          placeholder="Đến"
          value={localMax}
          onChange={e => setLocalMax(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          aria-label="Giá đến"
          className={inputClass}
        />
      </div>
      <button
        type="button"
        onClick={handleApply}
        className="w-full rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        Áp dụng
      </button>
    </div>
  );
}

// `onDeselect` lets the user click an already-selected radio to clear it (used by the category
// group, which has no "all" row).
function OptionRow({ name, checked, label, count, onSelect, onDeselect }: { name: string; checked: boolean; label: string; count?: number; onSelect: () => void; onDeselect?: () => void }) {
  return (
    <li>
      <label className="flex min-h-6 cursor-pointer items-center gap-2 py-0.5 text-sm text-slate-600 hover:text-slate-900">
        <input
          type="radio" name={name} checked={checked} onChange={onSelect}
          onClick={() => { if (checked && onDeselect) onDeselect(); }}
          className="h-4 w-4 shrink-0 accent-primary-600"
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {count != null && <span className="shrink-0 text-xs tabular-nums text-slate-400">({count})</span>}
      </label>
    </li>
  );
}

function FilterPanel({ state, brands, attributes, priceRange, allCategories, onNavigate, onCategorySelect, onClearAll, activeFilterCount }: PanelProps) {
  // Show only leaf categories: if a parent has children, show the children instead of the parent
  const leafCategories = allCategories.flatMap(cat =>
    cat.children.length > 0
      ? cat.children.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
      : [{ id: cat.id, name: cat.name, slug: cat.slug }]
  );
  const catActiveIndex = leafCategories.findIndex(c => c.slug === state.category);

  return (
    <div>
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="mb-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"
        >
          Xóa tất cả bộ lọc ({activeFilterCount})
        </button>
      )}

      {leafCategories.length > 0 && (
        <Collapsible title="Danh mục sản phẩm">
          <ul className="space-y-1.5">
            <ShowMoreWrapper total={leafCategories.length} activeIndex={catActiveIndex}>
              {limit => leafCategories.slice(0, limit).map(cat => (
                <OptionRow
                  key={cat.id}
                  name="filter-category"
                  checked={state.category === cat.slug}
                  label={cat.name}
                  onSelect={() => onCategorySelect(cat.slug)}
                  onDeselect={() => onCategorySelect('')}
                />
              ))}
            </ShowMoreWrapper>
          </ul>
        </Collapsible>
      )}

      <Collapsible title="Giá">
        <PriceFilter
          min={state.minPrice}
          max={state.maxPrice}
          range={priceRange}
          onApply={(minStr, maxStr) => onNavigate({ minPrice: minStr, maxPrice: maxStr, page: '1' })}
        />
      </Collapsible>

      {brands.length > 0 && (
        <Collapsible title="Thương hiệu">
          <ul className="space-y-1.5">
            <OptionRow name="filter-brand" checked={!state.brand} label="Tất cả" onSelect={() => onNavigate({ brand: '', page: '1' })} />
            <ShowMoreWrapper total={brands.length} activeIndex={brands.findIndex(b => b.slug === state.brand)}>
              {limit => brands.slice(0, limit).map(brand => (
                <OptionRow
                  key={brand.id}
                  name="filter-brand"
                  checked={state.brand === brand.slug}
                  label={brand.name}
                  count={brand.productCount}
                  onSelect={() => onNavigate({ brand: brand.slug, page: '1' })}
                />
              ))}
            </ShowMoreWrapper>
          </ul>
        </Collapsible>
      )}

      {attributes.map(attribute => {
        const field = `attr[${attribute.slug}]`;
        const selected = state.attr[attribute.slug] ?? '';
        return (
          <Collapsible key={attribute.id} title={attribute.name}>
            <ul className="space-y-1.5">
              <OptionRow
                name={field}
                checked={!selected}
                label="Tất cả"
                onSelect={() => onNavigate({ [field]: '', page: '1' })}
              />
              <ShowMoreWrapper
                total={attribute.values.length}
                activeIndex={attribute.values.findIndex(v => String(v.id) === selected)}
              >
                {limit => attribute.values.slice(0, limit).map(value => (
                  <OptionRow
                    key={value.id}
                    name={field}
                    checked={selected === String(value.id)}
                    label={value.value}
                    count={value.productCount}
                    onSelect={() => onNavigate({ [field]: String(value.id), page: '1' })}
                  />
                ))}
              </ShowMoreWrapper>
            </ul>
          </Collapsible>
        );
      })}
    </div>
  );
}

export default function FilterSidebar({ mobileOpen, onMobileClose, ...panel }: FilterSidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onMobileClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Sticky + own scroll area: the aside itself is sticky (its containing block is the tall flex
          row, so it can actually stick), and its list scrolls independently of the page —
          overscroll-contain stops scroll chaining, and the "Bộ lọc" title stays pinned above. */}
      <aside className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] w-[220px] shrink-0 flex-col rounded-xl border border-slate-200 bg-white lg:flex">
        <p className="shrink-0 px-4 pb-3 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Bộ lọc</p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4" data-testid="filter-scroll">
          <FilterPanel {...panel} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog" aria-label="Bộ lọc sản phẩm">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pt-4 shadow-xl" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">Bộ lọc</p>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                aria-label="Đóng bộ lọc"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel
              {...panel}
              onNavigate={changes => { panel.onNavigate(changes); onMobileClose(); }}
              onClearAll={() => { panel.onClearAll(); onMobileClose(); }}
            />
          </div>
        </div>
      )}
    </>
  );
}
