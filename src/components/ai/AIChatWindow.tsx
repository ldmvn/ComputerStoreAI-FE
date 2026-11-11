'use client';

import AIChatHeader from './AIChatHeader';
import AIChatMessages from './AIChatMessages';
import AIChatInput from './AIChatInput';
import type { AIChatSession } from '@/hooks/useAIChat';

// heightPx chỉ được truyền khi bàn phím điện thoại đang mở: khung co lại vừa phần còn nhìn thấy.
export default function AIChatWindow({ chat, onBack, onClose, heightPx }: { chat: AIChatSession; onBack: () => void; onClose: () => void; heightPx?: number }) {
  const { chatAvailable, messages, sending, sendMessage, reset } = chat;

  return (
    <div
      role="dialog"
      aria-label="Chatbot AI"
      style={heightPx ? { height: heightPx } : undefined}
      className="flex h-[min(520px,calc(100dvh-140px))] w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/15"
    >
      <AIChatHeader onBack={onBack} onClose={onClose} onReset={reset} />
      <AIChatMessages messages={messages} />
      <AIChatInput disabled={!chatAvailable} sending={sending} onSend={sendMessage} />
    </div>
  );
}
