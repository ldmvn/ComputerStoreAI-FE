'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProfitPoint } from '@/services/adminDashboard.service';

function shortLabel(label: string) {
  const parts = label.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
  return label;
}

function formatCompact(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function ProfitChart({ data }: { data: ProfitPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(700);
  const hasData = data.length > 0;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(240, Math.round(el.clientWidth)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasData]);

  if (!hasData) {
    return <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">Chưa có dữ liệu.</div>;
  }

  const height = 240;
  const padL = 48, padR = 12, padT = 16, padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const maxPos = Math.max(0, ...data.map(d => d.profit));
  const maxNeg = Math.max(0, ...data.map(d => -d.profit));
  const span = Math.max(1, maxPos + maxNeg);
  const zeroY = padT + (maxPos / span) * innerH;
  const n = data.length;
  const bandW = innerW / n;
  const barW = Math.min(64, bandW * 0.72);
  const maxLabels = width < 480 ? 5 : 8;
  const labelStep = Math.max(1, Math.ceil(n / maxLabels));

  return (
    <div ref={wrapRef} className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block max-w-full">
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={padL} x2={width - padR} y1={padT + innerH * f} y2={padT + innerH * f} stroke="#f1f5f9" strokeWidth={1} />
        ))}
        <text x={padL - 8} y={padT + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{formatCompact(maxPos)}</text>
        <text x={padL - 8} y={zeroY + 4} textAnchor="end" fontSize={10} fill="#94a3b8">0</text>
        {maxNeg > 0 && (
          <text x={padL - 8} y={padT + innerH + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{formatCompact(-maxNeg)}</text>
        )}
        <line x1={padL} x2={width - padR} y1={zeroY} y2={zeroY} stroke="#cbd5e1" strokeWidth={1} />
        {data.map((d, i) => {
          const x = padL + bandW * i + (bandW - barW) / 2;
          const h = (Math.abs(d.profit) / span) * innerH;
          const y = d.profit >= 0 ? zeroY - h : zeroY;
          const loss = d.profit < 0;
          return (
            <rect
              key={d.date} x={x} y={y} width={barW} height={Math.max(h, d.profit === 0 ? 0 : 1)} rx={4}
              fill={loss ? (hover === i ? '#dc2626' : '#f87171') : (hover === i ? '#059669' : '#34d399')}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(i)}
            />
          );
        })}
        {data.map((d, i) => (
          i % labelStep === 0 && (
            <text key={d.date} x={padL + bandW * i + bandW / 2} y={height - 8} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {shortLabel(d.date)}
            </text>
          )
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Lãi</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Lỗ</span>
        </div>
        {hover !== null && data[hover] && (
          <div className="text-xs text-slate-600">
            <strong>{shortLabel(data[hover].date)}</strong>: doanh thu {data[hover].revenue.toLocaleString('vi-VN')}đ · giá vốn {data[hover].cost.toLocaleString('vi-VN')}đ ·{' '}
            <span className={data[hover].profit < 0 ? 'font-semibold text-red-600' : 'font-semibold text-emerald-600'}>
              {data[hover].profit < 0 ? 'lỗ ' : 'lãi '}{Math.abs(data[hover].profit).toLocaleString('vi-VN')}đ
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
