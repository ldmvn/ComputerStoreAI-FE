// Đọc nhanh nhu cầu và ngân sách từ câu khách gõ ở trang AI Build PC, để biết còn thiếu gì thì hỏi thêm.
// Chấp nhận gõ không dấu, gõ tắt và sai dấu thường gặp ("50 chiệu", "15tr", "30 củ").

export type PurposeKey = 'gaming' | 'livestream' | 'dung-video' | 'ai-ml' | 'van-phong' | 'hoc-tap' | 'may-tram' | 'chung-khoan';

export type DetectedIntent = { purposes: PurposeKey[]; budget: number | null };

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

const PURPOSE_PATTERNS: Array<[PurposeKey, RegExp]> = [
  ['may-tram', /may tram|workstation|render nang|3d nang|mo phong|solidworks|autocad|\bcad\b|\bcfd\b/],
  ['chung-khoan', /chung khoan|trade|nhieu man hinh/],
  ['ai-ml', /machine learning|may hoc|hoc may|deep learning|\bllm\b|chay ai|train ai|stable diffusion|mo hinh ai|ai cuc bo|local ai|ai local|lam ai|huan luyen|pytorch|tensorflow|keras|ollama|lm studio|fine.?tun|inference|data science|khoa hoc du lieu/],
  ['dung-video', /dung video|edit video|premiere|after effects|davinci|photoshop|do hoa|thiet ke|render|sang tao noi dung|dung phim|blender|3ds max|maya|sketchup|lumion|zbrush|capcut|vegas|bien tap/],
  ['livestream', /livestream|live stream|\bstream\b|phat truc tiep|\bobs\b/],
  ['hoc-tap', /hoc tap|hoc online|hoc sinh|sinh vien|bai tap|do an|luan van|hoc ky/],
  ['van-phong', /van phong|office|word|excel|ke toan|xem phim|lam viec|lap trinh|\bcode\b|coding|docker|vs ?code|may ao|doanh nghiep|cong ty/],
  ['gaming', /\bgame\b|gaming|choi game|valorant|lien minh|\blol\b|pubg|cs2|csgo|fps|fo4|fc online|fifa|gta|cyberpunk|black myth|genshin|dota|\bgem\b|lien quan|toc chien|apex|fortnite|warzone|minecraft|elden ring|steam|esport|aoe/],
];

export function detectBudget(prompt: string): number | null {
  const text = normalize(prompt);
  const match = text.match(/(\d+(?:[.,]\d+)*)\s*(trieu|trjeu|triu|treu|chieu|chiu|tr|cu|ty)(?![a-z])/);
  if (!match) return null;
  const raw = match[1];
  const value = /^\d+[.,]\d{1,2}$/.test(raw) ? parseFloat(raw.replace(',', '.')) : parseFloat(raw.replace(/[.,]/g, ''));
  if (!Number.isFinite(value) || value <= 0) return null;
  const budget = Math.round(value * (match[2] === 'ty' ? 1_000_000_000 : 1_000_000));
  return Math.min(budget, 500_000_000);
}

// Khách có thể muốn nhiều việc cùng lúc (vừa chơi game vừa dựng video): trả về mọi nhu cầu nhận ra được.
export function detectPurposes(prompt: string): PurposeKey[] {
  const text = normalize(prompt);
  return PURPOSE_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([key]) => key);
}

export function detectIntent(prompt: string): DetectedIntent {
  return { purposes: detectPurposes(prompt), budget: detectBudget(prompt) };
}

// Các mức ngân sách chọn nhanh: giá trị là mức TỐI ĐA dùng để dựng cấu hình.
export const BUDGET_CHOICES: Array<{ label: string; value: number }> = [
  { label: 'Dưới 15 triệu', value: 15_000_000 },
  { label: '15 - 20 triệu', value: 20_000_000 },
  { label: '20 - 30 triệu', value: 30_000_000 },
  { label: '30 - 50 triệu', value: 50_000_000 },
  { label: 'Trên 50 triệu', value: 70_000_000 },
];

export const formatBudgetLabel = (value: number) =>
  `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;

// ── Thông tin thêm cho máy chơi game (tùy chọn) ──
export const GAME_OPTIONS = ['Valorant', 'Liên Minh', 'CS2', 'PUBG', 'FC Online', 'GTA V', 'Black Myth: Wukong', 'Cyberpunk 2077'] as const;
export const RESOLUTION_OPTIONS = ['Full HD', '2K', '4K'] as const;
export const FPS_OPTIONS = ['60 FPS', '144 FPS', '240 FPS'] as const;

const GAME_PATTERNS: Array<[(typeof GAME_OPTIONS)[number], RegExp]> = [
  ['Valorant', /valorant/],
  ['Liên Minh', /lien minh|\blol\b|league of legends/],
  ['CS2', /\bcs2\b|csgo|counter strike/],
  ['PUBG', /pubg/],
  ['FC Online', /fc online|fo4|fifa/],
  ['GTA V', /\bgta\b/],
  ['Black Myth: Wukong', /black myth|wukong/],
  ['Cyberpunk 2077', /cyberpunk/],
];

export const detectGames = (prompt: string): string[] => {
  const text = normalize(prompt);
  return GAME_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
};

export const detectResolution = (prompt: string): (typeof RESOLUTION_OPTIONS)[number] | null => {
  const text = normalize(prompt);
  if (/\b4k\b|2160p/.test(text)) return '4K';
  if (/\b2k\b|1440p|qhd/.test(text)) return '2K';
  if (/full ?hd|\bfhd\b|1080p/.test(text)) return 'Full HD';
  return null;
};

export const detectFps = (prompt: string): (typeof FPS_OPTIONS)[number] | null => {
  const text = normalize(prompt);
  if (/\b240\s*(fps|hz)?\b/.test(text)) return '240 FPS';
  if (/\b(144|165)\s*(fps|hz)?\b/.test(text)) return '144 FPS';
  if (/\b60\s*(fps|hz)\b/.test(text)) return '60 FPS';
  return null;
};
