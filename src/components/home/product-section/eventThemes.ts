import { Flower2, GraduationCap, Gift, Tag, Zap, type LucideIcon } from 'lucide-react';
import type { EventIcon, EventTheme } from '@/types/productSection.type';

// Bộ màu cho từng chủ đề sự kiện. Muốn thêm chủ đề mới: thêm một mục ở đây, thêm giá trị vào EventTheme
// (frontend) và EVENT_THEMES (backend validator) là xong.
export type EventThemeConfig = {
  label: string;
  bg: [string, string, string];       // nền khối (gradient)
  accent: string;                     // màu giá và nhãn giảm giá
  soft: string;                       // nền ô ảnh sản phẩm
  ribbonShadow: string;               // viền chữ trên ruy băng
  badge: { bg: [string, string]; border: string; text: string; hi: string; iconBg: string; iconFg: string };
  countText: string;                  // màu số trong ô đếm ngược
};

export const EVENT_THEMES: Record<EventTheme, EventThemeConfig> = {
  'nha-giao': {
    label: 'Ngày Nhà giáo (cam chủ đạo)', bg: ['#C4480A', '#d9560c', '#e8620f'], accent: '#C4480A', soft: '#fff7ed', ribbonShadow: '#b91c1c',
    badge: { bg: ['#1f2a5c', '#2f3f9a'], border: '#fde047', text: '#ffffff', hi: '#fde047', iconBg: '#fde047', iconFg: '#1f2a5c' },
    countText: '#C4480A',
  },
  'black-friday': {
    label: 'Black Friday (đen vàng)', bg: ['#0b0b10', '#1c1c26', '#2b2b3a'], accent: '#b45309', soft: '#fffbeb', ribbonShadow: '#111827',
    badge: { bg: ['#fde047', '#f59e0b'], border: '#ffffff', text: '#111827', hi: '#b91c1c', iconBg: '#111827', iconFg: '#fde047' },
    countText: '#111827',
  },
  '11-11': {
    label: 'Siêu sale 11.11 (đỏ hồng)', bg: ['#be123c', '#e11d48', '#f43f5e'], accent: '#be123c', soft: '#fff1f2', ribbonShadow: '#7f1d1d',
    badge: { bg: ['#ffffff', '#ffe4e6'], border: '#fde047', text: '#9f1239', hi: '#e11d48', iconBg: '#e11d48', iconFg: '#ffffff' },
    countText: '#be123c',
  },
  tet: {
    label: 'Đón Tết (đỏ đậm vàng)', bg: ['#7f1d1d', '#b91c1c', '#dc2626'], accent: '#b91c1c', soft: '#fef2f2', ribbonShadow: '#7f1d1d',
    badge: { bg: ['#fde047', '#f59e0b'], border: '#fff7ed', text: '#7f1d1d', hi: '#b91c1c', iconBg: '#b91c1c', iconFg: '#fde047' },
    countText: '#b91c1c',
  },
};

export const EVENT_ICONS: Record<EventIcon, { label: string; Icon: LucideIcon }> = {
  cap: { label: 'Mũ cử nhân', Icon: GraduationCap },
  tag: { label: 'Nhãn giá', Icon: Tag },
  gift: { label: 'Hộp quà', Icon: Gift },
  flower: { label: 'Hoa', Icon: Flower2 },
  bolt: { label: 'Tia chớp', Icon: Zap },
};

export const eventTheme = (id?: string): EventThemeConfig => EVENT_THEMES[(id as EventTheme) in EVENT_THEMES ? (id as EventTheme) : 'nha-giao'];
export const eventIcon = (id?: string) => EVENT_ICONS[(id as EventIcon) in EVENT_ICONS ? (id as EventIcon) : 'cap'];
