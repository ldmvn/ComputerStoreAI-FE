'use client';

import { useEffect, useState } from 'react';

export type KeyboardViewport = { open: boolean; inset: number; height: number };

const CLOSED: KeyboardViewport = { open: false, inset: 0, height: 0 };
// Bàn phím điện thoại luôn cao hơn ngưỡng này; chênh lệch nhỏ hơn là thanh địa chỉ co giãn, không phải bàn phím.
const KEYBOARD_MIN_PX = 120;

function isEditing() {
  const el = document.activeElement;
  return el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

/**
 * Hai kiểu hành vi trên điện thoại:
 *  - Bàn phím đè lên trang (iOS Safari thường gặp): innerHeight giữ nguyên, phần bị che = innerHeight - vv.height - offsetTop.
 *  - Bàn phím co vùng hiển thị (Android, một số bản iOS): innerHeight co lại theo, phần bị che đo ra 0.
 * Nên ngoài phần bị che còn so chiều cao vùng nhìn thấy với chiều cao lúc chưa gõ (baseline).
 * `inset` = phần bị che phía dưới (0 nếu trang tự co), `height` = chiều cao vùng nhìn thấy.
 */
export function useKeyboardViewport(): KeyboardViewport {
  const [state, setState] = useState<KeyboardViewport>(CLOSED);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let baseline = viewport.height;

    const update = () => {
      // Trang đang bị phóng to (visualViewport.height co lại theo tỉ lệ phóng) không phải bàn phím.
      const zoomed = Math.abs(viewport.scale - 1) > 0.01;
      if (!isEditing()) baseline = Math.max(viewport.height, window.innerHeight);

      const covered = zoomed ? 0 : Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      const shrunk = zoomed ? 0 : Math.max(0, baseline - viewport.height);
      const open = covered > KEYBOARD_MIN_PX || (shrunk > KEYBOARD_MIN_PX && isEditing());
      const next: KeyboardViewport = open ? { open: true, inset: covered > KEYBOARD_MIN_PX ? covered : 0, height: viewport.height } : CLOSED;

      setState(current => (current.open === next.open && current.inset === next.inset && current.height === next.height ? current : next));
    };

    // iOS Safari mở/đóng bàn phím có hiệu ứng ~300ms và không phát lại sự kiện khi vùng nhìn thấy dừng hẳn
    // (chỉ khi người dùng lướt trang mới có). Nên đo lại nhiều lần sau mỗi lần focus/blur.
    const timers: number[] = [];
    const settle = () => {
      timers.forEach(id => window.clearTimeout(id));
      timers.length = 0;
      [0, 80, 180, 320, 500, 800].forEach(delay => timers.push(window.setTimeout(update, delay)));
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    window.addEventListener('orientationchange', settle);
    document.addEventListener('focusin', settle);
    document.addEventListener('focusout', settle);
    return () => {
      timers.forEach(id => window.clearTimeout(id));
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', settle);
      document.removeEventListener('focusin', settle);
      document.removeEventListener('focusout', settle);
    };
  }, []);

  return state;
}
