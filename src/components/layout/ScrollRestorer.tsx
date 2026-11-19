'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Khi bấm "quay lại" từ trang chi tiết, trình duyệt khôi phục vị trí cuộn ngay lập tức, nhưng nội dung trang
// (sản phẩm, khối trang chủ) còn đang tải nên trang còn ngắn và bị đẩy xuống tận chân trang. Component này tự lưu vị trí
// cuộn của từng địa chỉ rồi, khi quay lại, đợi trang đủ dài mới cuộn về đúng chỗ cũ.
const PREFIX = 'scroll-pos:';
const MAX_WAIT_MS = 4000;
const STEP_MS = 50;

const keyOf = () => PREFIX + window.location.pathname + window.location.search;

export default function ScrollRestorer() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const poppedRef = useRef(false); // trang vừa đổi do bấm quay lại/tiến tới (đã có logic khôi phục riêng)

  // Chuyển sang trang mới bằng cách bấm liên kết: luôn bắt đầu từ đầu trang (vì đã tắt chế độ tự khôi phục của trình duyệt).
  useEffect(() => {
    const previous = lastPath.current;
    lastPath.current = pathname;
    if (previous === null || previous === pathname) return;
    if (poppedRef.current) { poppedRef.current = false; return; }
    if (window.location.hash) return;
    window.scrollTo(0, 0);
    // Giữ ở đầu trang thêm một lúc: nội dung/ảnh tải trễ hoặc việc focus có thể kéo trang xuống. Người dùng tự cuộn thì thôi.
    let stop = () => {};
    const timer = window.setInterval(() => { if (window.scrollY > 0) window.scrollTo(0, 0); }, 50);
    const end = window.setTimeout(() => stop(), 1500);
    stop = () => {
      window.clearInterval(timer);
      window.clearTimeout(end);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);
    return stop;
  }, [pathname]);

  useEffect(() => {
    let previousMode: ScrollRestoration | undefined;
    try {
      previousMode = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
    } catch { /* trình duyệt không cho đổi: bỏ qua */ }

    let restoring = false; // đang đưa trang về vị trí cũ: không ghi đè vị trí đã lưu bằng giá trị tạm
    let saveTimer: number | undefined;
    const save = (force = false) => {
      if (restoring && !force) return;
      try { sessionStorage.setItem(keyOf(), String(Math.round(window.scrollY))); } catch { /* bộ nhớ bị chặn */ }
    };
    const onScroll = () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(save, 120);
    };

    let restoreTimer: number | undefined;
    let releaseTimer: number | undefined;
    // Người dùng tự cuộn/chạm: dừng ép vị trí và coi các vị trí cuộn từ giờ là hợp lệ để lưu.
    const cancelRestore = () => window.clearInterval(restoreTimer);
    const onUserInput = () => { cancelRestore(); restoring = false; };
    const releaseHeight = () => { window.clearTimeout(releaseTimer); document.body.style.minHeight = ''; restoring = false; };

    let poppedTimer: number | undefined;
    const onPopState = () => {
      poppedRef.current = true;
      window.clearTimeout(poppedTimer);
      poppedTimer = window.setTimeout(() => { poppedRef.current = false; }, 1500);
      cancelRestore();
      releaseHeight();
      let target = 0;
      try { target = Number(sessionStorage.getItem(keyOf())) || 0; } catch { /* bộ nhớ bị chặn */ }
      if (target <= 0) return;
      // Giữ trang đủ cao ngay lập tức để vị trí cũ không bị kẹp xuống chân trang (footer) lúc nội dung chưa tải xong.
      restoring = true;
      document.body.style.minHeight = (target + window.innerHeight) + 'px';
      window.scrollTo(0, target);
      const started = Date.now();
      const startKey = keyOf();
      restoreTimer = window.setInterval(() => {
        // Đã sang trang khác (bấm nhanh vào sản phẩm khác): dừng ngay, không kéo trang mới về vị trí cũ.
        if (keyOf() !== startKey) { onUserInput(); releaseHeight(); return; }
        if (Math.abs(window.scrollY - target) > 4) window.scrollTo(0, target);
        if (Date.now() - started > MAX_WAIT_MS) cancelRestore();
      }, STEP_MS);
      // Gỡ chiều cao giữ chỗ khi nội dung thật đã tải xong.
      releaseTimer = window.setTimeout(releaseHeight, MAX_WAIT_MS);
    };

    // Lưu ngay vị trí lúc bấm vào liên kết (không chờ 120ms) để quay lại về đúng chỗ đang xem.
    const onClickCapture = () => { window.clearTimeout(saveTimer); save(true); }; // bấm liên kết là người dùng đang chủ động: vị trí hiện tại luôn hợp lệ
    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', onPopState);
    const onPageHide = () => save(true);
    window.addEventListener('pagehide', onPageHide);
    // Người dùng tự cuộn thì ngừng ép về vị trí cũ.
    window.addEventListener('wheel', onUserInput, { passive: true });
    window.addEventListener('touchstart', onUserInput, { passive: true });
    window.addEventListener('pointerdown', onUserInput, { passive: true });
    window.addEventListener('keydown', onUserInput);
    return () => {
      window.clearTimeout(saveTimer);
      window.clearTimeout(poppedTimer);
      cancelRestore();
      releaseHeight();
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('wheel', onUserInput);
      window.removeEventListener('touchstart', onUserInput);
      window.removeEventListener('pointerdown', onUserInput);
      window.removeEventListener('keydown', onUserInput);
      if (previousMode) { try { window.history.scrollRestoration = previousMode; } catch { /* bỏ qua */ } }
    };
  }, []);

  return null;
}
