'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageKeyFromPath } from '@/lib/pageKey';
import { useChatContextStore } from '@/store/chatContext.store';

// Renders nothing; keeps the chatbot's page context in sync with the URL from a single place.
export default function PageContextTracker() {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? '';
  const setPageKey = useChatContextStore(s => s.setPageKey);
  useEffect(() => { setPageKey(pageKeyFromPath(pathname, search)); }, [pathname, search, setPageKey]);
  return null;
}
