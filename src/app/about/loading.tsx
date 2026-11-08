import CustomerShell from '@/components/layout/CustomerShell';
import { InfoPageSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return (
    <CustomerShell>
      <InfoPageSkeleton variant="article" toc={false} label="Đang tải trang giới thiệu" />
    </CustomerShell>
  );
}
