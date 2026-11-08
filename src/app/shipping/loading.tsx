import CustomerShell from '@/components/layout/CustomerShell';
import { InfoPageSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return (
    <CustomerShell>
      <InfoPageSkeleton variant="article" toc={true} label="Đang tải chính sách vận chuyển" />
    </CustomerShell>
  );
}
