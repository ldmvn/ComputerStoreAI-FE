import { create } from 'zustand';
import type { AiPageKey } from '@/types/ai.type';

// What the chatbot should know about the page the customer has open right now.
type ChatContextState = {
  pageKey: AiPageKey;
  productId: number | null;
  setPageKey: (pageKey: AiPageKey) => void;
  setProduct: (productId: number) => void;
  // Only clears if the product being left is still the current one, so a late
  // cleanup from page A can never wipe out page B's value.
  clearProduct: (productId: number) => void;
};

export const useChatContextStore = create<ChatContextState>(set => ({
  pageKey: 'other',
  productId: null,
  setPageKey: pageKey => set(state => (state.pageKey === pageKey ? state : { pageKey })),
  setProduct: productId => set({ productId }),
  clearProduct: productId => set(state => (state.productId === productId ? { productId: null } : state)),
}));
