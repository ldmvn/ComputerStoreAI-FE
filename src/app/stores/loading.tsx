import CustomerShell from '@/components/layout/CustomerShell';
import { InfoPageSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return (
    <CustomerShell>
      <InfoPageSkeleton variant="cards" toc={false} label="Đang tải hệ thống cửa hàng" />
    </CustomerShell>
  );
}
