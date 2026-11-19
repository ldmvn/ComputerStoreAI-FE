'use client';

import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Loader2, AlertCircle, CheckCircle2, AlertTriangle,
  ShoppingCart, Pencil, ChevronDown, ChevronUp, Send, Wrench,
  Cpu, Monitor, Zap, Shield, Package, BarChart3,
  MessageSquare, Search, GitCompare, Info,
} from 'lucide-react';
import { useAiBuildPc } from '@/hooks/useAiBuildPc';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { validateBuildPc } from '@/services/buildPc.service';
import { formatProductPrice } from '@/lib/product';
import type {
  AiBuildPcRequest, AiBuildPcResult, AiBuildPcTier, AiBuildPcItem,
  FpsEstimate, ParsedRequirements,
} from '@/types/aiBuildPc.type';
import {
  QUICK_SUGGESTIONS, PURPOSE_SHORTCUTS, PURPOSE_PROMPTS,
  SLOT_LABELS, REFINEMENT_PRESETS,
} from '@/types/aiBuildPc.type';
import {
  BUDGET_CHOICES, FPS_OPTIONS, GAME_OPTIONS, RESOLUTION_OPTIONS,
  detectFps, detectGames, detectIntent, detectResolution, formatBudgetLabel, type PurposeKey,
} from '@/lib/aiBuildPcIntent';
import type { Product } from '@/types/product.type';
import type { PickedItem, BuildPcProduct } from '@/types/buildPc.type';

function toCartProduct(item: AiBuildPcItem): Product {
  return {
    id: item.productId, slug: item.slug, sku: item.sku, name: item.name,
    price: item.price, stockQuantity: item.stockQuantity ?? 0,
    primaryImage: item.primaryImage, isActive: true, isDeleted: false,
    category: null, categoryId: null, brandId: null, brand: null, brandInfo: null,
    shortDescription: null, originalPrice: null, lowStockThreshold: 5,
    stockStatus: (item.stockQuantity ?? 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    createdAt: '', updatedAt: '',
  };
}

function formatBudgetDiff(diff: number): string {
  const abs = Math.abs(diff);
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1).replace('.0', '')} triệu`;
  if (abs >= 1000) return `${Math.round(abs / 1000)} nghìn`;
  return formatProductPrice(abs);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AiBuildPcPage() {
  const router = useRouter();
  const { state, result, lastPrompt, errorMsg, generate, reset, cancel } = useAiBuildPc();
  const userId = useAuthStore(s => s.user?.id ?? null);
  const { addItem, setQuantity } = useCartStore();
  const [cartStatus, setCartStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cartMsg, setCartMsg] = useState('');

  function handleSubmit(prompt: string, budget?: number) {
    generate(budget ? { prompt, budget } : { prompt });
  }

  function handleRefine(modification: string) {
    const newPrompt = lastPrompt
      ? `${lastPrompt}. Chỉnh lại: ${modification}`
      : modification;
    generate({ prompt: newPrompt });
  }

  function handleRebuildWithBudget(budget: number) {
    generate({ prompt: lastPrompt, budget });
  }

  function handleTransferToManual(tier: AiBuildPcTier) {
    if (!tier.items.length) return;
    const buildItems: Record<string, PickedItem> = {};
    for (const item of tier.items) {
      const product: BuildPcProduct = {
        id: item.productId, slug: item.slug, sku: item.sku, name: item.name,
        price: item.price, stockQuantity: item.stockQuantity ?? 0,
        inStock: (item.stockQuantity ?? 0) > 0, primaryImage: item.primaryImage,
        brand: null, warranty: null,
      };
      buildItems[item.slot] = { product, quantity: item.quantity };
    }
    try {
      const key = userId ? `build-pc:user:${userId}` : 'build-pc:guest';
      localStorage.setItem(key, JSON.stringify(buildItems));
    } catch { /* ignore */ }
    router.push('/customer/build-pc/manual');
  }

  async function handleAddToCart(tier: AiBuildPcTier) {
    if (!tier.items.length || cartStatus === 'loading') return;
    setCartStatus('loading');
    setCartMsg('');
    try {
      const body = { items: tier.items.map(it => ({ slot: it.slot, productId: it.productId, quantity: it.quantity })) };
      const validated = await validateBuildPc(body);
      if (!validated.data.canAddToCart) {
        const errors = validated.data.issues.filter((i: { level: string }) => i.level === 'error');
        setCartMsg(errors.length ? errors.map((e: { message: string }) => e.message).join('; ') : 'Cấu hình có lỗi.');
        setCartStatus('error');
        setTimeout(() => setCartStatus('idle'), 5000);
        return;
      }
      let failed = 0;
      for (const item of tier.items) {
        addItem(toCartProduct(item));
        if (!setQuantity(item.productId, item.quantity)) failed++;
      }
      setCartStatus(failed > 0 ? 'error' : 'success');
      if (failed > 0) setCartMsg(`${failed} sản phẩm không thể thêm.`);
      setTimeout(() => setCartStatus('idle'), 4000);
    } catch {
      setCartMsg('Không thể kiểm tra cấu hình.');
      setCartStatus('error');
      setTimeout(() => setCartStatus('idle'), 5000);
    }
  }

  if ((state === 'done' || state === 'loading') && result?.tiers?.length) {
    return (
      <ResultView
        loading={state === 'loading'}
        result={result}
        lastPrompt={lastPrompt}
        onEdit={reset}
        onRefine={handleRefine}
        onRebuild={handleRebuildWithBudget}
        onTransfer={handleTransferToManual}
        onAddToCart={handleAddToCart}
        cartStatus={cartStatus}
        cartMsg={cartMsg}
      />
    );
  }

  return (
    <InputView
      onSubmit={handleSubmit}
      errorMsg={state === 'error' ? errorMsg : ''}
      lastPrompt={lastPrompt}
      isLoading={state === 'loading'}
      onCancel={cancel}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT VIEW
// ═══════════════════════════════════════════════════════════════════════════════

type AskState = {
  text: string; purposes: PurposeKey[]; budget: number | null; purposesTouched: boolean; budgetTouched: boolean;
  // true: khách bấm nút nhu cầu nhanh (không gõ câu) nên chỉ hiện bảng hỏi thêm, không hiện cột "AI đã hiểu"
  fromChips: boolean;
  // Thông tin thêm cho máy chơi game (tùy chọn)
  games: string[]; resolution: string | null; fps: string | null;
};

function InputView({ onSubmit, errorMsg, lastPrompt, isLoading, onCancel }: {
  onSubmit: (prompt: string, budget?: number) => void;
  errorMsg: string;
  lastPrompt: string;
  isLoading?: boolean;
  onCancel?: () => void;
}) {
  const [prompt, setPrompt] = useState(lastPrompt);
  // Khi câu của khách thiếu nhu cầu hoặc ngân sách: hiện bước hỏi thêm thay vì tự dựng bằng giá trị mặc định.
  const [ask, setAsk] = useState<AskState | null>(null);
  const askRef = useRef<HTMLDivElement>(null);

  // Gộp phần khách vừa chọn bằng nút vào câu gốc để AI dựng đúng ý.
  function finish(state: AskState) {
    const parts = [state.text.trim() || 'Dựng cấu hình PC'];
    if (state.purposesTouched && state.purposes.length) {
      const labels = state.purposes.map(key => PURPOSE_SHORTCUTS.find(p => p.value === key)?.label).filter(Boolean);
      if (labels.length) parts.push(`Nhu cầu: ${labels.join(', ')}`);
    }
    if (state.purposes.includes('gaming')) {
      if (state.games.length) parts.push(`Game hay chơi: ${state.games.join(', ')}`);
      if (state.resolution) parts.push(`Màn hình ${state.resolution}`);
      if (state.fps) parts.push(`Mong muốn ${state.fps}`);
    }
    if (state.budgetTouched && state.budget) parts.push(`Ngân sách tối đa ${formatBudgetLabel(state.budget)}`);
    setAsk(null);
    onSubmit(parts.join('. '), state.budget ?? undefined);
  }

  function submitText(text: string) {
    const value = text.trim();
    if (!value) return;
    const intent = detectIntent(value);
    if (intent.purposes.length > 0 && intent.budget) {
      setAsk(null);
      onSubmit(value);
      return;
    }
    setAsk({
      text: value, purposes: intent.purposes, budget: intent.budget, purposesTouched: false, budgetTouched: false, fromChips: false,
      games: detectGames(value), resolution: detectResolution(value), fps: detectFps(value),
    });
  }

  function update(patch: Partial<AskState>) {
    setAsk(current => (current ? { ...current, ...patch } : current));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitText(prompt);
  }

  function handleQuickSuggestion(text: string) {
    setPrompt(text);
    submitText(text);
  }

  // Bấm nút nhu cầu nhanh: mở ngay khung bên dưới với nhu cầu đó đã chọn để khách chọn thêm (bấm lại để bỏ).
  function handlePurposeClick(value: string) {
    const key = value as PurposeKey;
    const base = ask ?? {
      text: prompt.trim(), purposes: detectIntent(prompt).purposes, budget: detectIntent(prompt).budget,
      purposesTouched: false, budgetTouched: false, fromChips: true,
      games: detectGames(prompt), resolution: detectResolution(prompt), fps: detectFps(prompt),
    };
    const purposes = base.purposes.includes(key) ? base.purposes.filter(k => k !== key) : [...base.purposes, key];
    setAsk({ ...base, purposes, purposesTouched: true });
    window.setTimeout(() => askRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  }

  return (
    <div className="min-h-[80vh] bg-white bg-[radial-gradient(900px_340px_at_50%_-40px,#ffe3d0_0%,rgba(255,255,255,0)_70%)] text-gray-900">
      <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-10 sm:pt-14">
        <div className="mx-auto max-w-[880px]">
          <p className="text-center text-xs font-extrabold uppercase tracking-[0.14em] text-[#C4480A]">DUCMANH PC BUILDER</p>
          <h1 className="mt-3 text-center text-[28px] font-extrabold leading-tight text-slate-900 sm:text-[40px]">
            AI dựng cấu hình PC theo<br className="hidden sm:block" /> nhu cầu và ngân sách của bạn
          </h1>
          <p className="mx-auto mt-3 max-w-[640px] text-center text-base leading-relaxed text-slate-500">
            Mô tả bạn muốn dùng máy làm gì và mức tiền dự kiến, AI sẽ đề xuất cấu hình tối ưu từ linh kiện đang bán tại DUCMANH PC.
          </p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-slate-600">
            {['Tư vấn tức thì', 'Kiểm tra tương thích', 'Linh kiện chính hãng'].map(text => (
              <li key={text} className="flex items-center gap-2">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3" aria-hidden="true" /></span>
                {text}
              </li>
            ))}
          </ul>

          {/* Ô nhập */}
          <form onSubmit={handleSubmit} className="mt-7 rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-[18px]">
            <div className="rounded-2xl bg-slate-50 px-4 pb-3 pt-4 sm:px-[18px]">
              <textarea
                value={prompt}
                onChange={e => { setPrompt(e.target.value); if (ask) setAsk(null); }}
                placeholder="VD: máy chơi Valorant và Liên Minh, màn 2K, tầm 25 triệu"
                rows={2}
                maxLength={500}
                aria-label="Mô tả nhu cầu và ngân sách"
                className="block min-h-[52px] w-full resize-none bg-transparent text-base text-slate-900 placeholder-slate-400 outline-none sm:text-lg"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[13px] text-slate-500"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />{prompt.length}/500</span>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C4480A] px-5 py-3 text-[15px] font-bold text-white transition hover:bg-[#a83b08] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoading ? (<>Đang tạo <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Nhờ AI dựng <Send className="h-4 w-4" /></>)}
                </button>
              </div>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chọn nhanh nhu cầu */}
          <p className="mb-3 mt-5 text-center text-xs font-extrabold uppercase tracking-widest text-slate-500">Hoặc chọn nhanh nhu cầu</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {PURPOSE_SHORTCUTS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePurposeClick(opt.value)}
                aria-pressed={!!ask?.purposes.includes(opt.value as PurposeKey)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${ask?.purposes.includes(opt.value as PurposeKey) ? 'border-[#C4480A] bg-orange-50 font-semibold text-[#C4480A]' : 'border-slate-200 bg-white text-slate-700 hover:border-[#C4480A] hover:text-[#C4480A]'}`}
              >
                <span aria-hidden="true">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
            <Link
              href="/customer/build-pc/manual"
              className="flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-[#C4480A] hover:text-[#C4480A]"
            >
              <Wrench className="h-4 w-4" aria-hidden="true" />
              Tự chọn linh kiện
            </Link>
          </div>
        </div>

        {ask && !isLoading && (
          <div ref={askRef}><AskMore state={ask} onChange={update} onContinue={() => finish(ask)} /></div>
        )}

        {/* AI làm việc thế nào */}
        <section className="mt-12" aria-labelledby="ai-how-it-works">
          <h2 id="ai-how-it-works" className="text-xl font-extrabold text-slate-900">AI làm việc thế nào</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { n: 1, title: 'Chia sẻ nhu cầu và ngân sách', text: 'Mô tả mục đích dùng máy và mức tiền dự kiến. AI hỏi thêm nếu còn thiếu.' },
              { n: 2, title: 'AI chọn linh kiện', text: 'Chọn từ sản phẩm đang bán tại DUCMANH PC, theo nhu cầu, giá và khả năng tương thích.' },
              { n: 3, title: 'So sánh và chọn cấu hình', text: 'Xem các phương án Tiết kiệm, Tối ưu, Hiệu năng cao rồi thêm vào giỏ hoặc tinh chỉnh.' },
            ].map(step => (
              <div key={step.n} className="rounded-2xl border border-slate-200 bg-white p-[18px]">
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#C4480A] text-sm font-bold text-white">{step.n}</span>
                <p className="mt-2.5 text-base font-bold text-slate-900">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          <span className="mr-2" aria-hidden="true">📞</span>
          Cần hỗ trợ thêm? Liên hệ DUCMANH PC qua <strong className="text-slate-900">Zalo</strong> hoặc gọi{' '}
          <strong className="text-slate-900">Hotline 0386220065</strong> để được tư vấn trực tiếp.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULT VIEW
// ═══════════════════════════════════════════════════════════════════════════════

// ── Bước hỏi thêm: khách chọn một hoặc nhiều nhu cầu và một mức ngân sách, rồi bấm "Tiếp tục" ──
function AskMore({ state, onChange, onContinue }: {
  state: AskState;
  onChange: (patch: Partial<AskState>) => void;
  onContinue: () => void;
}) {
  const [custom, setCustom] = useState('');
  const [customGame, setCustomGame] = useState('');
  const nothing = state.purposes.length === 0 && !state.budget;
  const canContinue = state.purposes.length > 0 && !!state.budget;
  const budgetInChoices = BUDGET_CHOICES.some(opt => opt.value === state.budget);

  function togglePurpose(key: PurposeKey) {
    const next = state.purposes.includes(key) ? state.purposes.filter(k => k !== key) : [...state.purposes, key];
    onChange({ purposes: next, purposesTouched: true });
  }

  function toggleGame(name: string) {
    onChange({ games: state.games.includes(name) ? state.games.filter(g => g !== name) : [...state.games, name] });
  }

  function addCustomGame() {
    const name = customGame.trim().slice(0, 40);
    if (!name) return;
    if (!state.games.some(g => g.toLowerCase() === name.toLowerCase())) onChange({ games: [...state.games, name] });
    setCustomGame('');
  }

  function submitCustom() {
    const millions = parseFloat(custom.replace(',', '.'));
    if (!Number.isFinite(millions) || millions < 1 || millions > 500) return;
    onChange({ budget: Math.round(millions * 1_000_000), budgetTouched: true });
    setCustom('');
  }

  const choiceBase = 'rounded-full border px-4 py-2 text-sm transition';
  const choiceOff = `${choiceBase} border-slate-200 bg-white text-slate-700 hover:border-[#C4480A] hover:text-[#C4480A]`;
  const choiceOn = `${choiceBase} border-[#C4480A] bg-orange-50 font-semibold text-[#C4480A]`;
  const understoodCls = 'inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700';
  const needTag = <span className="ml-1.5 text-xs font-extrabold uppercase text-[#C4480A]">Cần</span>;

  const chipsMode = state.fromChips;

  return (
    <div className={`mx-auto mt-9 grid max-w-[1120px] gap-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-[22px] ${chipsMode ? '' : 'lg:grid-cols-[360px_1fr]'}`} role="region" aria-label="Thêm thông tin để AI tư vấn chính xác hơn">
      {!chipsMode && (
      <div className="rounded-2xl border border-slate-200 p-5">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#C4480A]"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI đã hiểu nhu cầu của bạn</p>
        {nothing ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Chưa đọc được thông tin cụ thể nào từ câu này. Bạn chọn giúp mình ở bên cạnh nhé.</p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {state.purposes.map(key => (
                <button key={key} type="button" onClick={() => togglePurpose(key)} className={understoodCls} title="Bấm để bỏ">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {PURPOSE_SHORTCUTS.find(p => p.value === key)?.label} <span aria-hidden="true" className="text-green-700/60">✕</span><span className="sr-only">Bỏ nhu cầu này</span>
                </button>
              ))}
              {state.budget && (
                <button type="button" onClick={() => onChange({ budget: null, budgetTouched: true })} className={understoodCls} title="Bấm để bỏ">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Ngân sách {formatBudgetLabel(state.budget)} <span aria-hidden="true" className="text-green-700/60">✕</span><span className="sr-only">Bỏ ngân sách này</span>
                </button>
              )}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-500">Bấm vào thẻ xanh để bỏ chọn.</p>
          </>
        )}
      </div>
      )}

      <div className="rounded-2xl border border-slate-200 p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#C4480A]">Thêm một chút thông tin để AI tư vấn chính xác hơn</p>

        {!chipsMode && (
        <div className="mt-4">
          <p className="text-[15px] font-bold text-slate-900">Bạn dùng máy cho việc gì? <span className="text-sm font-normal text-slate-500">(chọn một hoặc nhiều)</span>{state.purposes.length === 0 && needTag}</p>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {PURPOSE_SHORTCUTS.map(opt => {
              const on = state.purposes.includes(opt.value as PurposeKey);
              return (
                <button key={opt.value} type="button" aria-pressed={on} onClick={() => togglePurpose(opt.value as PurposeKey)} className={`${on ? choiceOn : choiceOff} flex items-center gap-2`}>
                  <span aria-hidden="true">{opt.icon}</span>{opt.label}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {state.purposes.includes('gaming') && (
          <div className="mt-5 border-t border-dashed border-slate-200 pt-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">Thêm cho máy chơi game <span className="font-semibold normal-case tracking-normal">(không bắt buộc)</span></p>
            <div className="mt-3 grid gap-5 lg:grid-cols-2">
              <div>
                <p className="text-[15px] font-bold text-slate-900">Bạn hay chơi game nào?</p>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {GAME_OPTIONS.map(name => (
                    <button key={name} type="button" aria-pressed={state.games.includes(name)} onClick={() => toggleGame(name)} className={state.games.includes(name) ? choiceOn : choiceOff}>{name}</button>
                  ))}
                  {state.games.filter(g => !(GAME_OPTIONS as readonly string[]).includes(g)).map(name => (
                    <button key={name} type="button" aria-pressed="true" onClick={() => toggleGame(name)} className={choiceOn} title="Bấm để bỏ">{name} ✕</button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={customGame}
                    onChange={e => setCustomGame(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomGame(); } }}
                    maxLength={40}
                    placeholder="Game khác, VD: Dota 2"
                    aria-label="Thêm game khác"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#C4480A]"
                  />
                  <button type="button" onClick={addCustomGame} disabled={!customGame.trim()} className="rounded-xl px-3 py-2 text-sm font-semibold text-[#C4480A] disabled:text-slate-400">Thêm</button>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-[15px] font-bold text-slate-900">Bạn chơi trên màn hình độ phân giải nào?</p>
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    {RESOLUTION_OPTIONS.map(name => (
                      <button key={name} type="button" aria-pressed={state.resolution === name} onClick={() => onChange({ resolution: state.resolution === name ? null : name })} className={state.resolution === name ? choiceOn : choiceOff}>{name}</button>
                    ))}
                    <button type="button" aria-pressed={state.resolution === null} onClick={() => onChange({ resolution: null })} className={state.resolution === null ? choiceOn : choiceOff}>Để AI đề xuất</button>
                  </div>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-900">Bạn muốn chơi game ở mức FPS nào?</p>
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    {FPS_OPTIONS.map(name => (
                      <button key={name} type="button" aria-pressed={state.fps === name} onClick={() => onChange({ fps: state.fps === name ? null : name })} className={state.fps === name ? choiceOn : choiceOff}>{name}</button>
                    ))}
                    <button type="button" aria-pressed={state.fps === null} onClick={() => onChange({ fps: null })} className={state.fps === null ? choiceOn : choiceOff}>Để AI đề xuất</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="text-[15px] font-bold text-slate-900">Ngân sách khoảng bao nhiêu?{!state.budget && needTag}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            {BUDGET_CHOICES.map(opt => (
              <button key={opt.value} type="button" aria-pressed={state.budget === opt.value} onClick={() => onChange({ budget: opt.value, budgetTouched: true })} className={state.budget === opt.value ? choiceOn : choiceOff}>{opt.label}</button>
            ))}
            {state.budget && !budgetInChoices && <span className={choiceOn}>{formatBudgetLabel(state.budget)}</span>}
            <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-4 pr-1 text-sm text-slate-500">
              <input
                inputMode="decimal"
                value={custom}
                onChange={e => setCustom(e.target.value.replace(/[^\d.,]/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitCustom(); } }}
                placeholder="Số khác"
                aria-label="Ngân sách khác, tính bằng triệu"
                className="w-20 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              />
              triệu
              <button type="button" onClick={submitCustom} disabled={!custom} className="rounded-full bg-[#C4480A] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Chọn</button>
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-full bg-[#C4480A] px-6 py-3 text-[15px] font-bold text-white transition hover:bg-[#a83b08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tiếp tục với cấu hình AI đề xuất <Sparkles className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-[13px] text-slate-500">{canContinue ? 'Đã đủ thông tin, bấm để AI dựng.' : chipsMode ? 'Chọn nhu cầu ở trên và ngân sách để AI dựng.' : 'Chọn nhu cầu và ngân sách để AI dựng.'}</span>
        </div>
      </div>
    </div>
  );
}

function formatMillions(value: number) {
  return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} triệu`;
}

function ResultView({ loading = false, result, lastPrompt, onEdit, onRefine, onRebuild, onTransfer, onAddToCart, cartStatus, cartMsg }: {
  loading?: boolean;
  result: AiBuildPcResult;
  lastPrompt: string;
  onEdit: () => void;
  onRefine: (mod: string) => void;
  onRebuild: (budget: number) => void;
  onTransfer: (tier: AiBuildPcTier) => void;
  onAddToCart: (tier: AiBuildPcTier) => void;
  cartStatus: string;
  cartMsg: string;
}) {
  const [selectedIdx, setSelectedIdx] = useState(result.selectedTier);
  const tier = result.tiers[selectedIdx] || result.tiers[0];
  const parsed = result.parsedRequirements || {};
  const shortfall = result.budgetShortfall;

  const tierSection = (
    <>
      {/* Tier cards */}
      <div className={`mt-6 mb-8 grid grid-cols-1 gap-4 ${result.tiers.length >= 3 ? 'sm:grid-cols-3' : result.tiers.length === 2 ? 'sm:grid-cols-2' : 'sm:max-w-sm'}`}>
        {result.tiers.map((t, i) => (
          <TierCard
            key={i}
            tier={t}
            budget={result.budget}
            selected={i === selectedIdx}
            recommended={i === result.selectedTier}
            onClick={() => setSelectedIdx(i)}
            prevTier={i > 0 ? result.tiers[i - 1] : undefined}
          />
        ))}
      </div>

      {!shortfall && (
        <p className="mb-8 text-xs text-gray-400">
          Mặc định AI không đưa ra bản vượt ngân sách bạn nêu.
        </p>
      )}

      {/* Selected tier detail */}
      <TierDetail
        tier={tier}
        tierIdx={selectedIdx}
        result={result}
        onTransfer={() => onTransfer(tier)}
        onAddToCart={() => onAddToCart(tier)}
        cartStatus={cartStatus}
        cartMsg={cartMsg}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {loading && (
          <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            AI đang dựng lại cấu hình, vui lòng đợi trong giây lát…
          </div>
        )}
        <div className={loading ? 'pointer-events-none opacity-60' : ''}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-[#C4480A]" />
            <h1 className="text-xl font-bold sm:text-2xl">
              {shortfall
                ? `VỚI ${formatMillions(result.budget).toUpperCase()}, AI CHƯA DỰNG ĐƯỢC BỘ MÁY HỢP LỆ`
                : `AI DỰNG ${result.tiers.length} CẤU HÌNH CHO BẠN`}
            </h1>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:border-gray-400 hover:text-gray-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Sửa yêu cầu
          </button>
        </div>

        {/* Original prompt quote */}
        {lastPrompt && (
          <div className="mb-4">
            <p className="text-base text-gray-600">
              <span className="mr-2 text-xl text-gray-300">&ldquo;</span>
              {lastPrompt}
              <span className="ml-1 text-xl text-gray-300">&rdquo;</span>
            </p>
          </div>
        )}

        {/* Parsed requirements tags */}
        <ParsedRequirementsTags parsed={parsed} />

        {shortfall ? (
            <section role="alert" className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700">Phương án đề xuất</p>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Cần tối thiểu khoảng {formatMillions(shortfall.minimumBudget)}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Với linh kiện đang bán tại cửa hàng, cấu hình rẻ nhất vẫn đủ linh kiện, tương thích và chạy được mục đích bạn chọn
                cần cao hơn ngân sách {formatMillions(shortfall.shortfall)}. AI không tự đưa ra bản vượt ngân sách của bạn.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onRebuild(shortfall.suggestedBudget)}
                  className="rounded-lg bg-[#C4480A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a83c08]"
                >
                  Dựng lại với {formatMillions(shortfall.suggestedBudget)}
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
                >
                  Sửa yêu cầu
                </button>
              </div>
            </section>
        ) : (
          <>
            {result.budgetNotice && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{result.budgetNotice}</span>
              </div>
            )}
            {tierSection}
            {/* Refinement section */}
            <RefinementSection onRefine={onRefine} />
          </>
        )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARSED REQUIREMENTS TAGS
// ═══════════════════════════════════════════════════════════════════════════════

function ParsedRequirementsTags({ parsed }: { parsed: ParsedRequirements }) {
  const tags: { label: string; value: string }[] = [];
  if (parsed.purpose) tags.push({ label: 'NHU CẦU', value: parsed.purpose });
  if (parsed.games?.length) tags.push({ label: 'GAME', value: parsed.games.join(', ') });
  if (parsed.monitor) tags.push({ label: 'MÀN HÌNH', value: parsed.monitor });
  if (parsed.fps) tags.push({ label: 'FPS', value: `${parsed.fps} FPS` });
  if (parsed.budget) tags.push({ label: 'NGÂN SÁCH', value: `Tối đa ${(parsed.budget / 1_000_000).toFixed(0)} triệu` });
  if (parsed.preferences?.length) tags.push({ label: 'SỞ THÍCH', value: parsed.preferences.join(', ') });

  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
          <span className="font-bold text-gray-400">{tag.label}</span>
          <span className="text-gray-700">{tag.value}</span>
        </span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER CARD
// ═══════════════════════════════════════════════════════════════════════════════

function TierCard({ tier, budget, selected, recommended, onClick, prevTier }: {
  tier: AiBuildPcTier;
  budget: number;
  selected: boolean;
  recommended: boolean;
  onClick: () => void;
  prevTier?: AiBuildPcTier;
}) {
  const diff = tier.totalPrice - budget;
  const diffLabel = diff <= 0
    ? `Dư ${formatBudgetDiff(Math.abs(diff))} so với ngân sách`
    : `Vượt ${formatBudgetDiff(diff)} so với ngân sách`;

  const diffItems = useMemo(() => {
    if (!prevTier) return '';
    const priceDiff = tier.totalPrice - prevTier.totalPrice;
    const changedSlots: string[] = [];
    for (const item of tier.items) {
      const prevItem = prevTier.items.find(p => p.slot === item.slot);
      if (!prevItem || prevItem.productId !== item.productId) {
        changedSlots.push(SLOT_LABELS[item.slot] || item.slot);
      }
    }
    for (const pi of prevTier.items) {
      if (!tier.items.find(t => t.slot === pi.slot)) {
        changedSlots.push(SLOT_LABELS[pi.slot] || pi.slot);
      }
    }
    if (!changedSlots.length) return '';
    const sign = priceDiff >= 0 ? '+' : '-';
    return `${sign}${formatBudgetDiff(Math.abs(priceDiff))}, khác ở ${changedSlots.join(', ')}`;
  }, [tier, prevTier]);

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col rounded-xl border-2 p-5 text-left transition ${
        selected
          ? 'border-[#C4480A] bg-white shadow-lg shadow-[#C4480A]/10'
          : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
      }`}
    >
      {/* Tier name + badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {tier.name}
        </span>
        {recommended && (
          <span className="rounded bg-[#C4480A] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            AI chọn
          </span>
        )}
      </div>

      {/* Price */}
      <p className="text-2xl font-bold tabular-nums">{formatProductPrice(tier.totalPrice)}</p>

      {/* Budget diff */}
      <p className={`mt-1 text-sm ${diff <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
        {diffLabel}
      </p>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{tier.description}</p>

      {/* Component thumbnails */}
      <div className="mt-4 flex gap-1.5">
        {tier.items.slice(0, 5).map((item, i) => (
          <div key={i} className="flex h-10 w-10 items-center justify-center rounded bg-gray-50 border border-gray-200">
            {item.primaryImage ? (
              <img src={item.primaryImage} alt="" className="h-8 w-8 object-contain" />
            ) : (
              <Package className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Diff from previous tier */}
      {diffItems && (
        <p className="mt-3 text-xs text-gray-400">{diffItems}</p>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER DETAIL
// ═══════════════════════════════════════════════════════════════════════════════

function TierDetail({ tier, tierIdx, result, onTransfer, onAddToCart, cartStatus, cartMsg }: {
  tier: AiBuildPcTier;
  tierIdx: number;
  result: AiBuildPcResult;
  onTransfer: () => void;
  onAddToCart: () => void;
  cartStatus: string;
  cartMsg: string;
}) {
  // Mở sẵn danh sách luật đã kiểm để khách thấy ngay hệ thống đã đối chiếu những gì; vẫn bấm để thu gọn được.
  const [showCompat, setShowCompat] = useState(false); // danh sách luật đã kiểm chỉ mở khi người dùng bấm xem
  const diff = tier.totalPrice - result.budget;

  const cpuItem = tier.items.find(i => i.slot === 'cpu');
  const vgaItem = tier.items.find(i => i.slot === 'vga');
  const titleParts = [cpuItem?.name, vgaItem?.name].filter(Boolean);
  const displayTitle = titleParts.length ? titleParts.join(' + ') : tier.name;

  return (
    <div className="space-y-6">
      {/* Build header */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row">
          {/* Left: images */}
          <div className="flex gap-2 p-5 lg:w-[300px] lg:shrink-0">
            {tier.items.filter(i => i.primaryImage).slice(0, 4).map((item, i) => (
              <div key={i} className="h-20 w-20 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                <img src={item.primaryImage!} alt="" className="h-16 w-16 object-contain" />
              </div>
            ))}
          </div>

          {/* Center: description */}
          <div className="flex-1 p-5 lg:border-l lg:border-gray-200">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
              BẢN {tier.name.toUpperCase()}, AI ĐỀ XUẤT
            </p>
            <h2 className="mb-3 text-lg font-bold sm:text-xl">{displayTitle}</h2>

            {result.summary && (
              <p className="mb-4 text-sm text-gray-500">{result.summary}</p>
            )}

            {/* Component list summary */}
            <ul className="space-y-1 text-sm text-gray-600">
              {tier.items.map(item => (
                <li key={item.slot} className="flex gap-2">
                  <span className="text-gray-300">•</span>
                  <span>
                    <strong className="text-gray-500">{SLOT_LABELS[item.slot] || item.slot}:</strong>{' '}
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: price + CTAs */}
          <div className="border-t border-gray-200 p-5 lg:w-[280px] lg:shrink-0 lg:border-t-0 lg:border-l">
            <p className="text-2xl font-bold tabular-nums">{formatProductPrice(tier.totalPrice)}</p>
            <p className="mt-0.5 text-xs text-gray-400">tạm tính, giá cuối tính lại khi mở trong Build PC</p>
            <p className={`mt-1 text-sm ${diff <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
              {diff <= 0 ? `Dư ${formatBudgetDiff(Math.abs(diff))} so với ngân sách` : `Vượt ${formatBudgetDiff(diff)}`}
            </p>

            {/* Component icon grid */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tier.items.map((item, i) => (
                <div key={i} className="h-9 w-9 rounded bg-gray-50 border border-gray-200 flex items-center justify-center" title={SLOT_LABELS[item.slot] || item.slot}>
                  {item.primaryImage ? (
                    <img src={item.primaryImage} alt="" className="h-7 w-7 object-contain" />
                  ) : (
                    <Package className="h-3.5 w-3.5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-5 space-y-2">
              <button
                onClick={onTransfer}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C4480A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a83b08]"
              >
                <Monitor className="h-4 w-4" />
                Mở trong Build PC để đặt
              </button>
              <button
                onClick={onAddToCart}
                disabled={!tier.canAddToCart || cartStatus === 'loading'}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                {cartStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Thêm tất cả vào giỏ hàng
              </button>
            </div>

            {/* Cart feedback */}
            {cartStatus === 'success' && (
              <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-600">
                Đã thêm vào giỏ hàng!{' '}
                <Link href="/customer/cart" className="underline">Xem giỏ</Link>
              </div>
            )}
            {cartStatus === 'error' && cartMsg && (
              <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{cartMsg}</div>
            )}
          </div>
        </div>
      </div>

      {/* FPS Estimates */}
      {tier.fpsEstimates?.length > 0 && <FpsTable estimates={tier.fpsEstimates} tierName={tier.name} />}

      {/* Compatibility section */}
      <CompatSection tier={tier} result={result} showDetail={showCompat} onToggle={() => setShowCompat(!showCompat)} />

      {/* Component list */}
      <ComponentList items={tier.items} tierName={tier.name} />

      {/* Cost breakdown */}
      <CostBreakdown items={tier.items} totalPrice={tier.totalPrice} budget={result.budget} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FPS TABLE
// ═══════════════════════════════════════════════════════════════════════════════

function FpsTable({ estimates, tierName }: { estimates: FpsEstimate[]; tierName: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3">
        <Zap className="h-4 w-4 text-yellow-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">FPS dự kiến của bản {tierName}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-400">
              <th className="px-5 py-2.5 text-left font-semibold">GAME</th>
              <th className="px-5 py-2.5 text-left font-semibold">ĐỘ PHÂN GIẢI · ĐỒ HOẠ</th>
              <th className="px-5 py-2.5 text-right font-semibold">FPS</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((e, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-5 py-3 font-medium">{e.game}</td>
                <td className="px-5 py-3 text-gray-500">{e.resolution}</td>
                <td className="px-5 py-3 text-right">
                  <span className="font-bold tabular-nums text-green-600">{e.fpsRange}</span>
                  {e.estimated && (
                    <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-700">
                      ƯỚC TÍNH
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPATIBILITY SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function CompatSection({ tier, result, showDetail, onToggle }: {
  tier: AiBuildPcTier;
  result: AiBuildPcResult;
  showDetail: boolean;
  onToggle: () => void;
}) {
  const parsed = result.parsedRequirements || {};
  const inStockCount = tier.items.filter(i => (i.stockQuantity ?? 0) > 0).length;
  // Thiếu dữ liệu thông số (info) là việc của cửa hàng cần bổ sung, không hiện thành cảnh báo cho khách.
  const visibleIssues = (tier.compatibilityIssues ?? []).filter(issue => issue.code !== 'MISSING_DATA');
  const issueCount = visibleIssues.length;
  // Số liệu lấy từ danh sách luật thật mà hệ thống đã kiểm (không còn dùng con số cố định).
  const checks = tier.compatibilityChecks ?? [];
  const checkTotal = checks.length;
  const passCount = checks.filter(c => c.status === 'pass').length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3">
        <Shield className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">AI đối chiếu với yêu cầu của bạn</h3>
      </div>
      <div className="p-5">
        {/* Requirement checks */}
        <div className="mb-4 flex flex-wrap gap-3">
          {result.budget > 0 && (
            <span className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Ngân sách tối đa {(result.budget / 1_000_000).toFixed(0)} triệu
            </span>
          )}
          {tier.totalPrice <= result.budget ? (
            <span className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Còn dư ngân sách {formatBudgetDiff(result.budget - tier.totalPrice)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Vượt ngân sách {formatBudgetDiff(tier.totalPrice - result.budget)}
            </span>
          )}
          {(parsed.games?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Chơi {parsed.games!.join(', ')}
            </span>
          )}
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums ${tier.compatibilityStatus === 'pass' ? 'text-green-600' : 'text-amber-600'}`}>
              {passCount}/{checkTotal}
            </span>
            <span className="text-gray-500">luật tương thích đạt</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-blue-600">{inStockCount}/{tier.items.length}</span>
            <span className="text-gray-500">linh kiện còn hàng</span>
          </div>
        </div>

        {/* Compatibility issues */}
        {visibleIssues.length > 0 && (
          <div className="mt-4 space-y-2">
            {visibleIssues.map((issue, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                issue.level === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {issue.level === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                <span>{issue.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Toggle detail */}
        <button
          onClick={onToggle}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#C4480A] hover:text-[#e05510] transition"
        >
          {showDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showDetail ? 'Ẩn chi tiết' : 'Xem từng luật đã kiểm'}
        </button>

        {showDetail && (
          checks.length > 0 ? (
            <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200">
              {checks.map((check, i) => (
                <li key={`${check.code}-${i}`} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                  {check.status === 'pass' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-label="Đạt" />}
                  {check.status === 'fail' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-label="Lỗi" />}
                  {check.status === 'warning' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-label="Cảnh báo" />}
                  {check.status === 'skip' && <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-label="Thiếu dữ liệu" />}
                  <p className="min-w-0 text-gray-600">
                    <span className="font-semibold text-gray-900">{check.name}</span>
                    <span className="text-gray-400"> · </span>
                    {check.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : issueCount === 0 && (
            <p className="mt-3 text-sm text-gray-500">Tất cả các luật tương thích đều đạt. Cấu hình này an toàn để sử dụng.</p>
          )
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT LIST
// ═══════════════════════════════════════════════════════════════════════════════

function ComponentList({ items, tierName }: { items: AiBuildPcItem[]; tierName: string }) {
  const total = items.reduce((s, i) => s + i.lineTotal, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3">
        <Cpu className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">
          {items.length} linh kiện trong bản {tierName}
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map(item => (
          <div key={item.slot} className="flex gap-4 px-5 py-4">
            {/* Image */}
            <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-200">
              {item.primaryImage ? (
                <img src={item.primaryImage} alt="" className="h-14 w-14 object-contain" />
              ) : (
                <Package className="h-6 w-6 text-gray-300" />
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                {SLOT_LABELS[item.slot] || item.slot}
              </p>
              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
              {item.reason && (
                <p className="mt-1 text-xs text-gray-400">
                  <span className="text-gray-500">Vì sao chọn:</span> {item.reason}
                </p>
              )}
            </div>

            {/* Price + stock */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold tabular-nums">{formatProductPrice(item.lineTotal)}</p>
              <p className={`mt-0.5 text-xs ${(item.stockQuantity ?? 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {(item.stockQuantity ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
        <span className="text-sm font-bold">Thanh toán tạm tính</span>
        <span className="text-lg font-bold tabular-nums text-[#C4480A]">{formatProductPrice(total)}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COST BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════

function CostBreakdown({ items, totalPrice, budget }: {
  items: AiBuildPcItem[];
  totalPrice: number;
  budget: number;
}) {
  const breakdown = useMemo(() => {
    return items
      .map(item => ({
        slot: item.slot,
        label: SLOT_LABELS[item.slot] || item.slot,
        amount: item.lineTotal,
        percent: totalPrice > 0 ? Math.round((item.lineTotal / totalPrice) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [items, totalPrice]);

  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500',
    'bg-indigo-500', 'bg-teal-500',
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3">
        <BarChart3 className="h-4 w-4 text-cyan-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Tiền được đổn vào đâu</h3>
      </div>
      <div className="p-5">
        {/* Stacked bar */}
        <div className="mb-4 flex h-6 overflow-hidden rounded-full bg-gray-100">
          {breakdown.map((b, i) => (
            <div
              key={b.slot}
              className={`${colors[i % colors.length]} transition-all`}
              style={{ width: `${b.percent}%` }}
              title={`${b.label}: ${b.percent}%`}
            />
          ))}
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
          {breakdown.map((b, i) => (
            <div key={b.slot} className="flex items-center gap-2 text-sm">
              <div className={`h-3 w-3 shrink-0 rounded-sm ${colors[i % colors.length]}`} />
              <span className="text-gray-500">{b.label}</span>
              <span className="ml-auto font-medium tabular-nums">{b.percent}%</span>
              <span className="text-xs text-gray-400 tabular-nums">{formatProductPrice(b.amount)}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Tổng {formatProductPrice(totalPrice)} trên ngân sách {formatProductPrice(budget)}.
          {totalPrice <= budget && ` Dư ${formatBudgetDiff(budget - totalPrice)}.`}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFINEMENT SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function RefinementSection({ onRefine }: { onRefine: (mod: string) => void }) {
  const [input, setInput] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    onRefine(input.trim());
    setInput('');
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3">
        <Sparkles className="h-4 w-4 text-[#C4480A]" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Bảo AI chỉnh lại</h3>
      </div>
      <div className="p-5">
        {/* Preset buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {REFINEMENT_PRESETS.map(preset => (
            <button
              key={preset}
              onClick={() => onRefine(preset)}
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 transition hover:border-[#C4480A] hover:text-[#C4480A]"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="VD: đổi sang CPU Intel, bỏ cái case này, giữ nguyên card"
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#C4480A] transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-lg bg-[#C4480A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a83b08] disabled:opacity-40"
          >
            Chỉnh lại
          </button>
        </form>
      </div>
    </div>
  );
}
