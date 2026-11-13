'use client';

import { MapPin, Wallet, StickyNote } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { formatProductPrice } from '@/lib/product';
import type { Address } from '@/types/address.type';

type Item = { id: number; name: string; price: number; quantity: number };

// Bước xem lại cuối cùng trước khi tạo đơn: đặt hàng trừ tồn kho ngay và có thể chuyển sang cổng thanh toán.
export default function OrderConfirmModal({ address, items, paymentLabel, note, voucherCode, subtotal, discountAmount, total, onConfirm, onClose }: {
  address: Address;
  items: Item[];
  paymentLabel: string;
  note: string;
  voucherCode?: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <Modal
      title="Xác nhận đặt hàng"
      onClose={onClose}
      footer={(
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Quay lại chỉnh sửa
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[0.98]">
            Xác nhận đặt hàng · {formatProductPrice(total)}
          </button>
        </div>
      )}
    >
      <div className="space-y-4 text-sm">
        <section className="flex gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold text-slate-800">{address.fullName} · {address.phone}</p>
            <p className="mt-0.5 text-slate-600">{address.streetAddress}, {address.communeName}, {address.provinceName}</p>
          </div>
        </section>

        <section className="flex gap-3">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
          <p className="font-semibold text-slate-800">{paymentLabel}</p>
        </section>

        {note.trim() && (
          <section className="flex gap-3">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
            <p className="break-words text-slate-600">{note.trim()}</p>
          </section>
        )}

        <section className="rounded-xl border border-slate-200">
          <p className="border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {items.length} sản phẩm · {units} món
          </p>
          <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto">
            {items.map(item => (
              <li key={item.id} className="flex items-start justify-between gap-3 px-3 py-2">
                <span className="min-w-0 flex-1 text-slate-700">{item.name} <span className="text-slate-400">× {item.quantity}</span></span>
                <span className="shrink-0 tabular-nums text-slate-700">{formatProductPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>

        <dl className="space-y-1.5">
          <div className="flex justify-between"><dt className="text-slate-500">Tạm tính</dt><dd className="tabular-nums">{formatProductPrice(subtotal)}</dd></div>
          {discountAmount > 0 && (
            <div className="flex justify-between"><dt className="text-slate-500">Mã giảm giá{voucherCode ? ` (${voucherCode})` : ''}</dt><dd className="tabular-nums text-emerald-600">-{formatProductPrice(discountAmount)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-slate-500">Phí vận chuyển</dt><dd className="font-medium text-emerald-600">Miễn phí</dd></div>
          <div className="flex items-baseline justify-between border-t border-slate-100 pt-2">
            <dt className="font-semibold text-slate-800">Tổng thanh toán</dt>
            <dd className="text-lg font-bold tabular-nums text-primary-700">{formatProductPrice(total)}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
