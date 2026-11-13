// Mirrors backend/src/ai/validators/aiChat.validator.js and
// backend/src/ai/config/ai.config.js#getAiStatus — keep these in sync with
// the backend contract, not the other way around.

export type AiStatus = {
  enabled: boolean;
  chatAvailable: boolean;
  ragAvailable: boolean;
  buildPcAvailable: boolean;
};

export type AiChatContext = 'general' | 'product_advice' | 'order_lookup' | 'build_pc' | 'faq';

// Tóm tắt giỏ hàng (giỏ nằm ở trình duyệt, không có trên server) để chatbot trả lời về giỏ.
export type AiCartItem = { id: number; name: string; price: number; quantity: number };

export type AiChatRequest = {
  message: string;
  conversationId: string | null;
  context?: AiChatContext;
  currentProductId?: number;
  pageKey?: AiPageKey;
  cart?: AiCartItem[];
};

export type AiCitation = {
  sourceNumber?: number;
  chunkId?: string;
  sku?: string;
  updatedAt?: string;
  documentId: string;
  sourceType: string;
  sourceRef: string;
  title?: string;
  score: number;
  productId: number | null;
};

export type AiToolCallResult = {
  name: string;
  result: unknown;
};

export type AiChatResponse = {
  reply: string;
  conversationId: string;
  citations: AiCitation[];
  toolCalls: AiToolCallResult[];
};

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  citations?: AiCitation[];
  id: string;
  role: ChatRole;
  content: string;
  status: 'sending' | 'sent' | 'error';
  createdAt: number;
};

// Closed set mirrored by backend/src/ai/config/pageContext.js — never send anything else.
export type AiPageKey =
  | 'home' | 'product_list' | 'product_detail' | 'search' | 'cart' | 'checkout'
  | 'order_history' | 'order_detail' | 'wishlist' | 'build_pc' | 'ai_build_pc'
  | 'account' | 'auth' | 'policy' | 'other';
