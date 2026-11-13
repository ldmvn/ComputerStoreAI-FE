'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import PageContextTracker from '@/components/ai/PageContextTracker';
import { AnimatePresence, m } from 'motion/react';
import FloatingSupportToggle from './FloatingSupportToggle';
import FloatingSupportPanel from './FloatingSupportPanel';
import AIChatWindow from '@/components/ai/AIChatWindow';
import { useAIChat } from '@/hooks/useAIChat';
import { useKeyboardViewport } from '@/hooks/useKeyboardViewport';
import { getPublicStoreInfo } from '@/services/adminSettings.service';
import { resolveWidgetConfig, resolveWidgetConfigOnFetchError, type ResolvedWidgetConfig } from '@/lib/supportWidget';
import { supportPanelVariants, panelTransition } from '@/components/ui/motion/transitions';

type View = 'support' | 'chat';

export default function FloatingSupportWidget() {
  const chat = useAIChat();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('support');
  const [config, setConfig] = useState<ResolvedWidgetConfig | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const keyboard = useKeyboardViewport();
  // Khi gõ chat trên điện thoại: khung nằm ngay trên bàn phím và co lại vừa phần còn nhìn thấy.
  const chatKeyboardOpen = isOpen && view === 'chat' && keyboard.open;
  const chatHeightPx = chatKeyboardOpen ? Math.max(240, Math.min(520, Math.round(keyboard.height - 16))) : undefined;

  useEffect(() => {
    const ctrl = new AbortController();
    getPublicStoreInfo(ctrl.signal)
      .then(res => setConfig(resolveWidgetConfig(res.data ?? {})))
      .catch(e => { if (e?.name !== 'AbortError') setConfig(resolveWidgetConfigOnFetchError()); });
    return () => ctrl.abort();
  }, []);

  const closeAll = () => { setIsOpen(false); setView('support'); };

  // Các nút "Liên hệ admin" ở trang khác (ví dụ chi tiết đơn hàng) mở bảng liên hệ này qua sự kiện của window.
  useEffect(() => {
    const open = () => { setView('support'); setIsOpen(true); };
    window.addEventListener('open-support-widget', open);
    return () => window.removeEventListener('open-support-widget', open);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) closeAll();
    };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeAll(); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={wrapperRef}
      style={chatKeyboardOpen ? { bottom: keyboard.inset + 8 } : undefined}
      className="fixed bottom-5 right-4 z-[80] flex flex-col items-end gap-3 sm:right-6"
    >
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="support-panel"
            variants={supportPanelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={panelTransition}
          >
            {view === 'chat' ? (
              <AIChatWindow chat={chat} onBack={() => setView('support')} onClose={closeAll} heightPx={chatHeightPx} />
            ) : (
              <FloatingSupportPanel config={config} onClose={closeAll} onOpenChat={() => setView('chat')} />
            )}
          </m.div>
        )}
      </AnimatePresence>
      <Suspense fallback={null}><PageContextTracker /></Suspense>
      {!chatKeyboardOpen && (
        <FloatingSupportToggle isOpen={isOpen} toggleAvatarUrl={config?.toggleAvatarUrl} onClick={() => (isOpen ? closeAll() : setIsOpen(true))} />
      )}
    </div>
  );
}
