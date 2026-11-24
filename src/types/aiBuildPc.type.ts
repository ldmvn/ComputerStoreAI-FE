// ── Request ──────────────────────────────────────────────────────────────────

export type AiBuildPcRequest = {
  prompt?: string;
  budget?: number;
  purpose?: string;
  games?: string;
  resolution?: string;
  cpuPreference?: string;
  gpuPreference?: string;
  priority?: string;
  extras?: string;
  freeText?: string;
};

// ── Response ─────────────────────────────────────────────────────────────────

export type AiBuildPcItem = {
  slot: string;
  productId: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  lineTotal: number;
  stockQuantity: number | null;
  primaryImage: string | null;
  reason: string;
  slug: string;
};

export type FpsEstimate = {
  game: string;
  resolution: string;
  fpsRange: string;
  estimated: boolean;
};

export type CompatibilityIssue = {
  code: string;
  level: 'error' | 'warning' | 'info';
  slots: string[];
  message: string;
};

// Một luật tương thích đã được kiểm, kèm giá trị cụ thể đã đối chiếu (ví dụ "Bộ vi xử lý: LGA1700 · Bo mạch chủ: LGA1700").
export type CompatibilityCheck = {
  code: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  slots: string[];
  message: string;
};

export type AiBuildPcTier = {
  name: string;
  description: string;
  items: AiBuildPcItem[];
  totalPrice: number;
  budgetDiff: number;
  overBudget?: boolean;
  fpsEstimates: FpsEstimate[];
  compatibilityStatus: 'pass' | 'warning' | 'fail';
  compatibilityIssues: CompatibilityIssue[];
  compatibilityChecks?: CompatibilityCheck[];
  compatibilityMissing: { slots: string[]; message: string }[];
  canAddToCart: boolean;
  isComplete: boolean;
  validationError: string | null;
};

export type ParsedRequirements = {
  purpose?: string;
  games?: string[];
  monitor?: string;
  fps?: string;
  budget?: number;
  preferences?: string[];
};

export type AiBuildPcResult = {
  success: boolean;
  parsedRequirements: ParsedRequirements;
  tiers: AiBuildPcTier[];
  budgetNotice?: string;
  budgetShortfall?: { minimumBudget: number; suggestedBudget: number; shortfall: number } | null;
  selectedTier: number;
  budget: number;
  purpose: string;
  purposeLabel: string;
  summary: string;
  error?: string;
  rawResponse?: string;
  metrics: {
    geminiCalls: number;
    toolCalls: number;
    searchCalls: number;
    compatCalls: number;
    latencyMs: number;
  };
};

// ── UI Constants ─────────────────────────────────────────────────────────────

// Gợi ý nhanh ở trang AI Build PC: 2 ca chơi game, 1 giải trí, 1 làm việc và học tập. Bấm vào chỉ điền câu vào ô nhập.
export const QUICK_SUGGESTIONS: string[] = [
  'Chơi Valorant, CS2 trên 240 FPS, màn Full HD, tầm 25 triệu',
  'Chơi game AAA 2K như Wukong, Cyberpunk, dùng card RTX, khoảng 35 triệu',
  'Xem phim, nghe nhạc, lướt web và chơi game nhẹ cuối tuần, tầm 20 triệu',
  'Máy cho sinh viên học online, làm Word, Excel và lập trình nhẹ, tầm 20 triệu',
];

export const PURPOSE_SHORTCUTS: { value: string; label: string }[] = [
  { value: 'gaming', label: 'Chơi game' },
  { value: 'livestream', label: 'Livestream' },
  { value: 'dung-video', label: 'Đồ họa' },
  { value: 'ai-ml', label: 'AI & máy học' },
  { value: 'van-phong', label: 'Văn phòng' },
  { value: 'hoc-tap', label: 'Học tập' },
  { value: 'may-tram', label: 'Máy trạm' },
  { value: 'chung-khoan', label: 'Chứng khoán' },
];

// Các nút nhu cầu nhanh hiện ở trang chủ AI Build PC (theo thứ tự hiển thị); bảng hỏi thêm vẫn dùng đủ PURPOSE_SHORTCUTS.
export const QUICK_NEED_KEYS = ['gaming', 'hoc-tap', 'van-phong', 'dung-video'] as const;

export const PURPOSE_PROMPTS: Record<string, string> = {
  gaming: 'Máy chơi game, tầm 20 triệu',
  livestream: 'Máy livestream, tầm 25 triệu',
  'dung-video': 'Máy dựng video, tầm 30 triệu',
  'ai-ml': 'Máy chạy AI và machine learning, tầm 40 triệu',
  'van-phong': 'Máy văn phòng, tầm 10 triệu',
  'hoc-tap': 'Máy học tập, tầm 12 triệu',
  'may-tram': 'Máy trạm làm việc nặng, tầm 50 triệu',
  'chung-khoan': 'Máy chơi chứng khoán nhiều màn hình, tầm 15 triệu',
};

export const SLOT_LABELS: Record<string, string> = {
  cpu: 'CPU', mainboard: 'Mainboard', ram: 'RAM', ssd: 'SSD',
  hdd: 'HDD', vga: 'Card đồ hoạ', psu: 'Nguồn', case: 'Vỏ Case',
  monitor: 'Màn hình', 'keyboard-mouse-combo': 'Bộ phím chuột', keyboard: 'Bàn phím',
  mouse: 'Chuột', headphone: 'Tai nghe', speaker: 'Loa', chair: 'Ghế Gaming',
  'case-fan': 'Quạt Case', 'cooler-air': 'Tản nhiệt khí',
  'cooler-aio': 'Tản nhiệt AIO', 'cooler-custom': 'Tản nhiệt nước Custom',
};

export const REFINEMENT_PRESETS = [
  'Thêm 5 triệu',
  'Bớt 3 triệu',
  'Nâng 4K',
  'Thử card AMD',
  'Case màu trắng',
  'Cần WiFi',
];

// Legacy exports for backwards compat
export type AiBuildPcPurpose = string;
export const PURPOSE_OPTIONS = PURPOSE_SHORTCUTS.map(s => ({ ...s, value: s.value as AiBuildPcPurpose }));
export const BUDGET_PRESETS = [
  { value: 8_000_000, label: '8 triệu' },
  { value: 10_000_000, label: '10 triệu' },
  { value: 15_000_000, label: '15 triệu' },
  { value: 20_000_000, label: '20 triệu' },
  { value: 25_000_000, label: '25 triệu' },
  { value: 30_000_000, label: '30 triệu' },
  { value: 40_000_000, label: '40 triệu' },
  { value: 50_000_000, label: '50 triệu' },
];
