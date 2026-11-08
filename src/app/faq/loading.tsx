import CustomerShell from '@/components/layout/CustomerShell';
import { InfoPageSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return (
    <CustomerShell>
      <InfoPageSkeleton variant="faq" toc={false} label="Đang tải câu hỏi thường gặp" />
    </CustomerShell>
  );
}
