'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Boxes, Loader2, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { formatProductPrice, productDetailHref } from '@/lib/product';
import { mediaUrl } from '@/services/http.client';
import { getProfitLoss, type DashboardRange, type ProductProfit, type ProfitLossData } from '@/services/adminDashboard.service';
import ProfitChart from './ProfitChart';

type Props = {
  token: string | null;
  enabled: boolean;
  range: DashboardRange;
  from?: string;
  to?: string;
};

// Change vs the previous period. null = no baseline (previous period is 0) -> neutral grey.
function PeriodChange({ pct }: { pct: number | null | undefined }) {
  if (pct === null || pct === undefined) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400">
        <Minus className="h-3 w-3" />—
      </span>
    );
  }
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct).toLocaleString('vi-VN')}%
    </span>
  );
}

function ProductThumb({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
      {src && !failed && (
        <Image src={mediaUrl(src)} alt={alt} width={36} height={36} className="h-full w-full object-contain" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

function StatCard({ label, value, tone = 'neutral', hint, footer }: { label: string; value: string; tone?: 'neutral' | 'good' | 'bad'; hint?: string; footer?: ReactNode }) {
  const color = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-red-600' : 'text-slate-900';
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-lg font-bold tabular-nums sm:text-xl ${color}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      {footer && <div className="mt-1 flex flex-wrap items-center gap-1.5">{footer}</div>}
    </div>
  );
}

function ProductList({ title, items, tone, empty }: { title: string; items: ProductProfit[]; tone: 'good' | 'bad'; empty: string }) {
  const Icon = tone === 'good' ? TrendingUp : TrendingDown;
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Icon className={`h-4 w-4 ${tone === 'good' ? 'text-emerald-600' : 'text-red-600'}`} />
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map(p => (
            <li key={p.productId} className="flex items-center gap-3 py-2.5">
              <ProductThumb src={p.primaryImage} alt={p.name} />
              <div className="min-w-0 flex-1">
                <Link href={productDetailHref(p.slug)} className="block truncate text-sm font-medium text-slate-700 hover:text-primary-700" title={p.name}>{p.name}</Link>
                <p className="mt-0.5 text-xs text-slate-400">Đã bán {p.quantitySold}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-sm font-bold tabular-nums ${tone === 'good' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {p.profit > 0 ? '+' : ''}{formatProductPrice(p.profit)}
                </p>
                <p className="text-xs tabular-nums text-slate-400">Biên {p.marginPercent.toLocaleString('vi-VN')}%</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProfitLossSection({ token, enabled, range, from, to }: Props) {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return;
    if (range === 'custom' && (!from || !to)) return;
    let cancelled = false;
    setLoading(true); setError('');
    getProfitLoss(token, range === 'custom' ? { range, from, to } : { range })
      .then(result => { if (!cancelled) setData(result); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu lời lỗ.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enabled, token, range, from, to]);

  const isLoss = (data?.profit ?? 0) < 0;
  const hasOrders = (data?.revenue ?? 0) > 0;
  // Products missing a cost price: sold in the period (excluded from profit) or active in stock.
  const missingCount = data ? Math.max(data.missingCostProducts, data.inventory.productsMissingCost) : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">Lời lỗ bán hàng</h3>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex h-[200px] items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : data && (
        <>
          {missingCount > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Có {missingCount} sản phẩm chưa nhập giá vốn, chưa được tính vào lợi nhuận.
                {data.missingCostSamples.length > 0 && (
                  <span className="text-amber-700/80"> Ví dụ: {data.missingCostSamples.join(', ')}.</span>
                )}{' '}
                <Link href="/admin/products" className="font-semibold underline underline-offset-2 hover:text-amber-900">Cập nhật giá nhập</Link>
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Doanh thu"
              value={formatProductPrice(data.revenue)}
              hint="Đơn đã giao"
              footer={<><PeriodChange pct={data.previous.changePercent.revenue} /><span className="text-xs text-slate-400">so với kỳ trước</span></>}
            />
            <StatCard label="Giá vốn" value={formatProductPrice(data.cost)} />
            <StatCard
              label={isLoss ? 'Lỗ' : 'Lợi nhuận'}
              value={formatProductPrice(data.profit)}
              tone={!hasOrders ? 'neutral' : isLoss ? 'bad' : 'good'}
              footer={<><PeriodChange pct={data.previous.changePercent.profit} /><span className="text-xs text-slate-400">so với kỳ trước</span></>}
            />
            <StatCard
              label="Biên lợi nhuận"
              value={`${data.marginPercent.toLocaleString('vi-VN')}%`}
              tone={!hasOrders ? 'neutral' : isLoss ? 'bad' : 'good'}
            />
          </div>

          <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
            <div className="rounded-lg bg-slate-50 p-2 text-slate-500"><Boxes className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Vốn tồn kho</p>
              <p className="mt-1 break-words text-lg font-bold tabular-nums text-slate-900 sm:text-xl">{formatProductPrice(data.inventory.costValue)}</p>
              <p className="mt-0.5 text-xs text-slate-400">Giá trị theo giá bán: {formatProductPrice(data.inventory.retailValue)}</p>
              {data.inventory.productsMissingCost > 0 && (
                <p className="mt-0.5 text-xs text-amber-600">{data.inventory.productsMissingCost} sản phẩm chưa có giá nhập</p>
              )}
            </div>
          </div>

          {!hasOrders ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              Chưa có đơn hàng đã giao trong khoảng thời gian này.
            </div>
          ) : (
            <>
              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
                <h4 className="mb-4 text-sm font-semibold text-slate-800">Lợi nhuận theo thời gian</h4>
                <ProfitChart data={data.timeline} />
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ProductList title="Sản phẩm lời nhiều nhất" items={data.topProfit} tone="good" empty="Chưa có sản phẩm nào có lãi trong kỳ." />
                <ProductList title="Sản phẩm bán lỗ" items={data.topLoss} tone="bad" empty="Không có sản phẩm bán lỗ trong kỳ." />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
