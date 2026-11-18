import { ChevronLeft, ChevronRight } from 'lucide-react';

// Dãy số trang gọn: luôn có trang đầu, trang cuối và 1 trang kề hai bên trang hiện tại; chỗ thiếu thay bằng "…".
function pageItems(page: number, total: number): Array<number | 'gap-start' | 'gap-end'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | 'gap-start' | 'gap-end'> = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(total - 1, page + 1);
  if (from > 2) items.push('gap-start');
  for (let p = from; p <= to; p++) items.push(p);
  if (to < total - 1) items.push('gap-end');
  items.push(total);
  return items;
}

const baseBtn = 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1';

export default function PageNumbers({ page, totalPages, onChange, label = 'Phân trang' }: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  label?: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={label} className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Trang trước"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${baseBtn} bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      {pageItems(page, totalPages).map(item => typeof item === 'number' ? (
        <button
          key={item}
          type="button"
          aria-label={`Trang ${item}`}
          aria-current={item === page ? 'page' : undefined}
          onClick={() => item !== page && onChange(item)}
          className={`${baseBtn} ${item === page ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          {item}
        </button>
      ) : (
        <span key={item} aria-hidden="true" className="px-1 text-slate-400">…</span>
      ))}
      <button
        type="button"
        aria-label="Trang sau"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${baseBtn} bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
